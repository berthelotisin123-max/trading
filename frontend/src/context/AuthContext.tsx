import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearPreviewSession,
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
  /** Re-read profile (name/photo) from local storage. */
  refreshProfile: () => void;
  /** Sign up, then sign out: the prototype returns the user to the sign-in page. */
  signUp: (name: string, email: string, password: string) => Promise<void>;
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

  const refreshProfile = useCallback(() => {
    setProfile(readPreviewProfile());
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await registerPreviewAccount(name, email, password);
    // Match the documented prototype behavior: successful sign-up returns to
    // the sign-in page; the session does not start automatically.
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
    clearPreviewSession();
    setSignedIn(false);
  }, []);

  const value = useMemo(
    () => ({ signedIn, profile, refreshProfile, signUp, signIn, signOut }),
    [signedIn, profile, refreshProfile, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
