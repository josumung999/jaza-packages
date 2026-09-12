import { describe, expect, it } from 'vitest';
import { resolveTheme } from './theme/tokens.js';
import { VERSION } from './version.js';

describe('@jazadev/react package smoke', () => {
  it('exports a semver version', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('resolves light and dark themes for CSS vars', () => {
    const light = resolveTheme('light', null);
    const dark = resolveTheme('dark', null);
    expect(light.mode).toBe('light');
    expect(dark.mode).toBe('dark');
    expect(light.colors.primary).toBeTruthy();
    expect(dark.colors.surface).toBeTruthy();
  });
});
