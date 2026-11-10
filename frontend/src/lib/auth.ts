/**
 * Authentication for BETZO.
 *
 * Credentials are verified by the FastAPI backend (`/api/v1/auth/*`) against
 * the PostgreSQL database — passwords never touch this browser. On a
 * successful sign-in the returned JWT pair is stored here and used to
 * authenticate subsequent API calls.
 *
 * Two things remain browser-local by design:
 *  - the cached profile snapshot (so the UI can render synchronously), and
 *  - the profile photo (a resized data URL; there is no avatar upload API yet).
 */

import { apiLogin, apiLogout, apiMe, apiRegister, apiUpdateProfile, clearTokens, isBadCredentials, readTokens, writeTokens } from './api';
import type { ApiUser } from './api';

const ACCOUNT_KEY = 'betzoAccount';
const PROFILE_KEY = 'betzoProfile';

export interface PreviewAccount {
  name: string;
  email: string;
  createdAt: string;
}

export interface PreviewProfile {
  name?: string;
  email?: string;
  photo?: string;
}

export interface PasswordRuleResult {
  id: string;
  label: string;
  ok: boolean;
}

export const PASSWORD_RULES: Array<{ id: string; label: string; check: (v: string) => boolean }> = [
  { id: 'ruleLength', label: 'At least 8 characters', check: (v) => v.length >= 8 },
  { id: 'ruleUpper', label: 'One uppercase letter', check: (v) => /[A-Z]/.test(v) },
  { id: 'ruleLower', label: 'One lowercase letter', check: (v) => /[a-z]/.test(v) },
  { id: 'ruleNumber', label: 'One number', check: (v) => /[0-9]/.test(v) },
  { id: 'ruleSpecial', label: 'One special character', check: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function evaluatePasswordRules(password: string): PasswordRuleResult[] {
  return PASSWORD_RULES.map(({ id, label, check }) => ({ id, label, ok: check(password) }));
}

export function passwordMeetsRules(password: string): boolean {
  return PASSWORD_RULES.every(({ check }) => check(password));
}

// ---------------------------------------------------------------------------
// Cached profile (rendered synchronously, refreshed from the API)
// ---------------------------------------------------------------------------

export function readPreviewProfile(): PreviewProfile {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}') as PreviewProfile;
  } catch {
    return {};
  }
}

export function writePreviewProfile(profile: PreviewProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* storage unavailable or full */
  }
}

function readAccount(): PreviewAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewAccount;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeAccount(account: PreviewAccount): void {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    /* storage unavailable */
  }
}

/** Cache the server's user record so the UI can render without a round trip. */
function cacheFromUser(user: ApiUser, extra: Partial<PreviewProfile> = {}): PreviewAccount {
  const account: PreviewAccount = {
    name: user.name ?? '',
    email: user.email,
    createdAt: user.created_at,
  };
  writeAccount(account);
  const profile = readPreviewProfile();
  writePreviewProfile({ ...profile, ...extra, name: account.name, email: account.email });
  return account;
}

export function getPreviewAccount(): PreviewAccount | null {
  return readAccount();
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export function isPreviewSignedIn(): boolean {
  return readTokens() !== null;
}

export function setPreviewSignedIn(value: boolean): void {
  if (!value) clearTokens();
}

export function clearPreviewSession(): void {
  clearTokens();
}

/**
 * Validate a stored session against the backend on app load.
 *
 * Returns `true` when the cached session should be kept. A definitive rejection
 * clears the session; a network failure keeps it so a flaky connection does not
 * silently sign the user out.
 */
export async function bootstrapSession(): Promise<boolean> {
  if (!readTokens()) return false;
  try {
    const user = await apiMe();
    cacheFromUser(user);
    return true;
  } catch (error) {
    if (isBadCredentials(error)) {
      clearTokens();
      return false;
    }
    return true;
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Create an account on the backend. Does not start a session. */
export async function registerPreviewAccount(name: string, email: string, password: string): Promise<void> {
  const tokens = await apiRegister(name, email, password.trim());
  // The prototype returns the user to the sign-in page after signing up, so
  // the freshly issued tokens are discarded rather than stored.
  void tokens;
  clearTokens();
  const profile = readPreviewProfile();
  writePreviewProfile({ ...profile, name: name.trim(), email: email.trim().toLowerCase() });
}

/**
 * Verify credentials against the backend and start a session.
 * Returns `null` when the credentials are rejected; throws otherwise
 * (network failure, backend unavailable).
 */
export async function verifyPreviewAccount(email: string, password: string): Promise<PreviewAccount | null> {
  let tokens;
  try {
    tokens = await apiLogin(email.trim().toLowerCase(), password);
  } catch (error) {
    if (isBadCredentials(error)) return null;
    throw error;
  }
  writeTokens(tokens);

  try {
    const user = await apiMe();
    return cacheFromUser(user);
  } catch {
    // Sign-in succeeded but the profile fetch failed: fall back to what we know.
    const account: PreviewAccount = {
      name: '',
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    writeAccount(account);
    const profile = readPreviewProfile();
    writePreviewProfile({ ...profile, email: account.email });
    return account;
  }
}

/** Persist a new display name on the backend, then refresh the local cache. */
export async function updatePreviewAccountName(name: string): Promise<PreviewAccount | null> {
  const user = await apiUpdateProfile({ name: name.trim() });
  return cacheFromUser(user);
}

/** Revoke the session server-side (best effort) and clear local tokens. */
export async function endPreviewSession(): Promise<void> {
  await apiLogout();
  clearTokens();
}
