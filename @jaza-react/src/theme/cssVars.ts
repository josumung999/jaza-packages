import type { JazaTheme } from './tokens.js';

const STYLE_ID = 'jaza-react-theme-vars';

/** Push theme tokens onto `:root` as CSS custom properties (safe in browser only). */
export function applyThemeCssVars(theme: JazaTheme): void {
  if (typeof document === 'undefined') return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.radius;
  el.textContent = `:root {
  --jaza-bg: ${c.background};
  --jaza-surface: ${c.surface};
  --jaza-surface-container: ${c.surfaceContainer};
  --jaza-surface-container-low: ${c.surfaceContainerLow};
  --jaza-surface-container-high: ${c.surfaceContainerHigh};
  --jaza-surface-container-highest: ${c.surfaceContainerHighest};
  --jaza-on-surface: ${c.onSurface};
  --jaza-on-surface-variant: ${c.onSurfaceVariant};
  --jaza-primary: ${c.primary};
  --jaza-on-primary: ${c.onPrimary};
  --jaza-primary-container: ${c.primaryContainer};
  --jaza-on-primary-container: ${c.onPrimaryContainer};
  --jaza-outline: ${c.outline};
  --jaza-outline-variant: ${c.outlineVariant};
  --jaza-error: ${c.error};
  --jaza-error-container: ${c.errorContainer};
  --jaza-success: ${c.success};
  --jaza-warning: ${c.warning};
  --jaza-warning-container: ${c.warningContainer};
  --jaza-primary-muted: ${c.primaryMuted};
  --jaza-overlay: ${c.overlay};
  --jaza-bundle-border: ${c.bundleBorder};
  --jaza-bundle-border-selected: ${c.bundleBorderSelected};
  --jaza-bundle-bg: ${c.bundleBg};
  --jaza-skeleton: ${c.skeleton};
  --jaza-skeleton-highlight: ${c.skeletonHighlight};
  --jaza-space-xs: ${s.xs}px;
  --jaza-space-sm: ${s.sm}px;
  --jaza-space-md: ${s.md}px;
  --jaza-space-lg: ${s.lg}px;
  --jaza-space-xl: ${s.xl}px;
  --jaza-space-gutter: ${s.gutter}px;
  --jaza-radius-md: ${r.md}px;
  --jaza-radius-lg: ${r.lg}px;
  --jaza-radius-xl: ${r.xl}px;
  --jaza-radius-full: ${r.full}px;
}`;
}
