import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { JazaLocale, ThemePreference } from '@jazadev/react-native';

type AppPrefsContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (value: ThemePreference) => void;
  locale: JazaLocale;
  setLocale: (value: JazaLocale) => void;
};

const AppPrefsContext = createContext<AppPrefsContextValue | null>(null);

export function AppPrefsProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreference] =
    useState<ThemePreference>('system');
  const [locale, setLocaleState] = useState<JazaLocale>('en');

  const setLocale = useCallback((value: JazaLocale) => {
    setLocaleState(value);
  }, []);

  const value = useMemo(
    () => ({
      themePreference,
      setThemePreference,
      locale,
      setLocale,
    }),
    [themePreference, locale, setLocale],
  );

  return (
    <AppPrefsContext.Provider value={value}>{children}</AppPrefsContext.Provider>
  );
}

export function useAppPrefs(): AppPrefsContextValue {
  const ctx = useContext(AppPrefsContext);
  if (!ctx) {
    throw new Error('useAppPrefs must be used within AppPrefsProvider');
  }
  return ctx;
}
