/**
 * Thin HTTP client for the BETZO FastAPI backend.
 *
 * Responsibilities:
 *  - resolve the API base URL (local dev vs. production deployment)
 *  - store the JWT access/refresh token pair
 *  - attach `Authorization: Bearer …` to authenticated calls
 *  - transparently refresh an expired access token once and retry
 *
 * All failures surface as `ApiError`, which carries the HTTP status and the
 * backend's human-readable `detail` message.
 */

const DEV_API = 'http://localhost:8000';
const PROD_API = 'https://betzotrading-api.vercel.app';

/** Override with `VITE_API_URL` (e.g. in `.env.local` for local development). */
const configured = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '');

export const API_BASE = configured || (import.meta.env.DEV ? DEV_API : PROD_API);

const TOKEN_KEY = 'betzoTokens';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** True when the failure means "bad credentials" rather than "backend down". */
export function isBadCredentials(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 400);
}

/** True when the request never reached the backend. */
export function isOffline(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof ApiError && error.status === 0);
}

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export function readTokens(): TokenPair | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TokenPair;
    if (!parsed?.access_token || !parsed?.refresh_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeTokens(tokens: TokenPair): void {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } catch {
    /* storage unavailable — the session simply will not persist */
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

// ---------------------------------------------------------------------------
// Request plumbing
// ---------------------------------------------------------------------------

async function toApiError(response: Response): Promise<ApiError> {
  let detail = `Request failed with status ${response.status}`;
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body?.detail === 'string') {
      detail = body.detail;
    } else if (Array.isArray(body?.detail)) {
      detail = body.detail
        .map((entry) => (typeof entry === 'string' ? entry : (entry as { msg?: string }).msg ?? 'Invalid input'))
        .join(', ');
    }
  } catch {
    /* non-JSON body (e.g. an HTML error page) — keep the generic message */
  }
  return new ApiError(response.status, detail);
}

let refreshInFlight: Promise<TokenPair | null> | null = null;

/** Exchange the stored refresh token for a new token pair (deduplicated). */
function refreshTokens(): Promise<TokenPair | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const tokens = readTokens();
      if (!tokens?.refresh_token) return null;
      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: tokens.refresh_token }),
        });
        if (!response.ok) {
          clearTokens();
          return null;
        }
        const next = (await response.json()) as TokenPair;
        writeTokens(next);
        return next;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

interface RequestOptions {
  /** Send the stored access token and refresh-and-retry once on 401. */
  auth?: boolean;
}

async function request<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
  const { auth = false } = options;

  const send = (token?: string): Promise<Response> => {
    const headers = new Headers(init.headers);
    if (init.body != null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}${path}`, { ...init, headers });
  };

  if (auth && !readTokens()) {
    throw new ApiError(401, 'Your session has ended. Please sign in again.');
  }

  let response = await send(auth ? readTokens()?.access_token : undefined);

  if (auth && response.status === 401) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }
    response = await send(refreshed.access_token);
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function post<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, options);
}

function patchRequest<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, { auth: true });
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function apiRegister(name: string, email: string, password: string): Promise<TokenPair> {
  return post<TokenPair>('/api/v1/auth/register', { name, email, password });
}

export function apiLogin(email: string, password: string): Promise<TokenPair> {
  return post<TokenPair>('/api/v1/auth/login', { email, password });
}

/** Best-effort server-side session revocation; never throws. */
export async function apiLogout(): Promise<void> {
  try {
    const refreshToken = readTokens()?.refresh_token;
    await request<void>(
      '/api/v1/auth/logout',
      { method: 'POST', body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}) },
      { auth: true },
    );
  } catch {
    /* the local session is cleared regardless */
  }
}

export function apiMe(): Promise<ApiUser> {
  return request<ApiUser>('/api/v1/users/me', {}, { auth: true });
}

export function apiUpdateProfile(fields: { name?: string }): Promise<ApiUser> {
  return patchRequest<ApiUser>('/api/v1/users/me', fields);
}
