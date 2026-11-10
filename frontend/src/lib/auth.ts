/**
 * Browser-local preview authentication.
 *
 * This is NOT production authentication: it has no server, no verified email,
 * no reset service, and no protection against a local attacker with device
 * access. It exists so the prototype can gate the workspace and persist a
 * sample account between visits on the same browser. Raw passwords are never
 * stored — only a salted PBKDF2 (SHA-256, 210,000 iterations) verifier.
 */

const ACCOUNT_KEY = 'betzoPreviewAccount';
const PROFILE_KEY = 'betzoProfile';
const SESSION_KEY = 'betzoPreviewAuth';
const PBKDF2_ITERATIONS = 210_000;

export interface PreviewAccount {
  name: string;
  email: string;
  salt: string;
  verifier: string;
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

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function derivePreviewVerifier(password: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function readAccount(): PreviewAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewAccount;
    if (!parsed?.email || !parsed?.salt || !parsed?.verifier) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getPreviewAccount(): PreviewAccount | null {
  return readAccount();
}

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

export async function registerPreviewAccount(name: string, email: string, password: string): Promise<void> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToHex(saltBytes);
  const verifier = await derivePreviewVerifier(password, salt);
  const account: PreviewAccount = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    salt,
    verifier,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  writePreviewProfile({ ...readPreviewProfile(), name: account.name, email: account.email });
}

export async function verifyPreviewAccount(email: string, password: string): Promise<PreviewAccount | null> {
  const account = readAccount();
  if (!account) return null;
  if (account.email !== email.trim().toLowerCase()) return null;
  const candidate = await derivePreviewVerifier(password, account.salt);
  return candidate === account.verifier ? account : null;
}

export function updatePreviewAccountName(name: string): PreviewAccount | null {
  const account = readAccount();
  if (account) {
    account.name = name.trim();
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    } catch {
      /* storage unavailable */
    }
  }
  const profile = readPreviewProfile();
  writePreviewProfile({ ...profile, name: name.trim(), email: account?.email ?? profile.email });
  return account;
}

export function isPreviewSignedIn(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setPreviewSignedIn(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function clearPreviewSession(): void {
  setPreviewSignedIn(false);
}
