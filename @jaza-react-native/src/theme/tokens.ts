export type ThemeMode = 'light' | 'dark';

export type JazaTheme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceContainer: string;
    surfaceContainerLow: string;
    surfaceContainerHigh: string;
    surfaceContainerHighest: string;
    surfaceVariant: string;
    onSurface: string;
    onSurfaceVariant: string;
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    outline: string;
    outlineVariant: string;
    error: string;
    success: string;
    overlay: string;
    bundleBorder: string;
    bundleBorderSelected: string;
    bundleBg: string;
    skeleton: string;
    skeletonHighlight: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    gutter: number;
  };
  radius: {
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
};

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, gutter: 20 };
const radius = { md: 8, lg: 12, xl: 16, full: 9999 };

export const darkTheme: JazaTheme = {
  mode: 'dark',
  spacing,
  radius,
  colors: {
    background: '#121414',
    surface: '#121414',
    surfaceContainer: '#1e2020',
    surfaceContainerLow: '#1a1c1c',
    surfaceContainerHigh: '#282a2b',
    surfaceContainerHighest: '#333535',
    surfaceVariant: '#333535',
    onSurface: '#e2e2e2',
    onSurfaceVariant: '#bacac5',
    primary: '#57f1db',
    onPrimary: '#003731',
    primaryContainer: '#2dd4bf',
    onPrimaryContainer: '#00574d',
    secondaryContainer: '#00bd85',
    onSecondaryContainer: '#00452e',
    outline: '#859490',
    outlineVariant: '#3c4a46',
    error: '#ffb4ab',
    success: '#45dfa4',
    overlay: 'rgba(12,15,15,0.8)',
    bundleBorder: '#262626',
    bundleBorderSelected: '#2dd4bf',
    bundleBg: '#111111',
    skeleton: '#2a2c2c',
    skeletonHighlight: '#3a3d3d',
  },
};

/** Checkout UI uses dark palette in both light and dark preference. */
export const lightTheme: JazaTheme = {
  ...darkTheme,
  mode: 'light',
};

export type ThemePreference = 'light' | 'dark' | 'system';

export function resolveTheme(
  preference: ThemePreference,
  systemScheme: 'light' | 'dark' | null,
): JazaTheme {
  if (preference === 'system') {
    return systemScheme === 'dark' ? darkTheme : lightTheme;
  }
  return preference === 'dark' ? darkTheme : lightTheme;
}
