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
    errorContainer: string;
    success: string;
    warning: string;
    warningContainer: string;
    primaryMuted: string;
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
    errorContainer: 'rgba(255, 180, 171, 0.18)',
    success: '#45dfa4',
    warning: '#e8b931',
    warningContainer: 'rgba(232, 185, 49, 0.18)',
    primaryMuted: 'rgba(87, 241, 219, 0.18)',
    overlay: 'rgba(12,15,15,0.8)',
    bundleBorder: '#262626',
    bundleBorderSelected: '#2dd4bf',
    bundleBg: '#111111',
    skeleton: '#2a2c2c',
    skeletonHighlight: '#3a3d3d',
  },
};

export const lightTheme: JazaTheme = {
  mode: 'light',
  spacing,
  radius,
  colors: {
    background: '#f7f9f8',
    surface: '#ffffff',
    surfaceContainer: '#eef2f1',
    surfaceContainerLow: '#f4f7f6',
    surfaceContainerHigh: '#e4eae8',
    surfaceContainerHighest: '#d8e0dd',
    surfaceVariant: '#dce4e1',
    onSurface: '#1a1c1c',
    onSurfaceVariant: '#3f4946',
    primary: '#006b5f',
    onPrimary: '#ffffff',
    primaryContainer: '#2dd4bf',
    onPrimaryContainer: '#003731',
    secondaryContainer: '#a7f2d0',
    onSecondaryContainer: '#002114',
    outline: '#6f7976',
    outlineVariant: '#bec9c5',
    error: '#ba1a1a',
    errorContainer: 'rgba(186, 26, 26, 0.12)',
    success: '#0f7a4f',
    warning: '#9a6b00',
    warningContainer: 'rgba(232, 185, 49, 0.22)',
    primaryMuted: 'rgba(0, 107, 95, 0.12)',
    overlay: 'rgba(26, 28, 28, 0.45)',
    bundleBorder: '#d0d9d5',
    bundleBorderSelected: '#006b5f',
    bundleBg: '#ffffff',
    skeleton: '#e4eae8',
    skeletonHighlight: '#f4f7f6',
  },
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
