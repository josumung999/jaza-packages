import { describe, expect, it } from 'vitest';
import { en, fr, ln, sw, t } from './t.js';
import { JAZA_LOCALES } from './types.js';

describe('t()', () => {
  it('returns English by default keys', () => {
    expect(t('en', 'balance.current')).toBe('Current Balance');
  });

  it('returns French translations', () => {
    expect(t('fr', 'balance.current')).toBe('Solde actuel');
    expect(t('fr', 'topUp.title')).toBe('Recharger des crédits');
  });

  it('interpolates params', () => {
    expect(t('en', 'common.continueWith', { label: 'Starter' })).toBe(
      'Continue with Starter',
    );
    expect(t('fr', 'action.creditsMeta', { cost: 5 })).toBe('5 crédits');
  });

  it('falls back to English for missing keys', () => {
    expect(t('sw', 'balance.current')).toBe(sw['balance.current']);
    // Unknown key → key itself after en miss
    expect(t('en', 'does.not.exist')).toBe('does.not.exist');
  });

  it('keeps dictionary key parity across locales', () => {
    const enKeys = Object.keys(en).sort();
    for (const locale of JAZA_LOCALES) {
      const dict = { en, fr, sw, ln }[locale];
      expect(Object.keys(dict).sort()).toEqual(enKeys);
    }
  });
});
