import { describe, expect, it } from 'vitest';
import { darkTheme, lightTheme, resolveTheme } from './tokens.js';

describe('resolveTheme', () => {
  it('returns lightTheme for light preference', () => {
    expect(resolveTheme('light', 'dark')).toBe(lightTheme);
    expect(resolveTheme('light', null).mode).toBe('light');
  });

  it('returns darkTheme for dark preference', () => {
    expect(resolveTheme('dark', 'light')).toBe(darkTheme);
    expect(resolveTheme('dark', null).mode).toBe('dark');
  });

  it('follows system scheme when preference is system', () => {
    expect(resolveTheme('system', 'dark')).toBe(darkTheme);
    expect(resolveTheme('system', 'light')).toBe(lightTheme);
  });

  it('defaults system null to lightTheme', () => {
    expect(resolveTheme('system', null)).toBe(lightTheme);
  });

  it('uses distinct palettes for light and dark', () => {
    expect(lightTheme.colors.background).not.toBe(darkTheme.colors.background);
    expect(lightTheme.colors.onSurface).not.toBe(darkTheme.colors.onSurface);
    expect(lightTheme.colors.warning).toBeTruthy();
    expect(darkTheme.colors.warningContainer).toBeTruthy();
  });
});
