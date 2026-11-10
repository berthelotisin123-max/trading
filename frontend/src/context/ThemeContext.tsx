import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { readString, writeString } from '../lib/storage';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', setTheme: () => undefined });

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (readString('betzoTheme', 'dark') === 'light' ? 'light' : 'dark'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeString('betzoTheme', theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next === 'light' ? 'light' : 'dark');
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
