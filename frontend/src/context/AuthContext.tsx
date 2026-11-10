import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  bootstrapSession,
  clearPreviewSession,
  endPreviewSession,
  isPreviewSignedIn,
  readPreviewProfile,
  registerPreviewAccount,
  setPreviewSignedIn,
  verifyPreviewAccount,
} from '../lib/auth';
import type { PreviewProfile } from '../lib/auth';

interface AuthContextValue {
  signedIn: boolean;
  profile: PreviewProfile;
  /** Re-read profile (name/photo) from the local cache. */
  refreshProfile: () => void;
  /** Sign up with the backend, then return the user to the sign-in page. */
  signUp: (name: string, email: string, password: string) => Promise<void>;
  /** Sign in against the backend. Resolves `false` for bad credentials. */
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean>(() => isPreviewSignedIn());
  const [profile, setProfile] = useState<PreviewProfile>(() => readPreviewProfile());

  // Validate any stored session against the backend once on mount.
  useEffect(() => {
    if (!isPreviewSignedIn()) return;
    let cancelled = false;
    void bootstrapSession().then((ok) => {
      if (cancelled) return;
      setSignedIn(ok);
      if (ok) setProfile(readPreviewProfile());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshProfile = useCallback(() => {
    setProfile(readPreviewProfile());
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await registerPreviewAccount(name, email, password);
    // Match the documented behavior: successful sign-up returns to the
    // sign-in page; the session does not start automatically.
    clearPreviewSession();
    setSignedIn(false);
    setProfile(readPreviewProfile());
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const account = await verifyPreviewAccount(email, password);
    if (!account) return false;
    setPreviewSignedIn(true);
    setSignedIn(true);
    setProfile(readPreviewProfile());
    return true;
  }, []);

  const signOut = useCallback(() => {
    void endPreviewSession();
    setSignedIn(false);
  }, []);

  const value = useMemo(
    () => ({ signedIn, profile, refreshProfile, signUp, signIn, signOut }),
    [signedIn, profile, refreshProfile, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
