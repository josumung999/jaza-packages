import { describe, expect, it } from 'vitest';
import {
  buildE164,
  formatCurrencyAmount,
  pickDefaultCurrencyCode,
  isDepositTerminal,
  resolveCurrencyFractionDigits,
} from './helpers.js';
import { iso2ToFlag, getDialCode } from '../data/dialCodes.js';

describe('helpers', () => {
  it('buildE164 strips non-digits', () => {
    expect(buildE164('254', '712 345 678')).toBe('254712345678');
  });

  it('pickDefaultCurrencyCode prefers non-USD', () => {
    expect(pickDefaultCurrencyCode(['USD', 'CDF'])).toBe('CDF');
  });

  it('isDepositTerminal detects final states', () => {
    expect(isDepositTerminal('COMPLETED')).toBe(true);
    expect(isDepositTerminal('PENDING')).toBe(false);
  });
});

describe('formatCurrencyAmount', () => {
  it('formats USD with 2 decimals', () => {
    expect(formatCurrencyAmount(9, 'USD', 2)).toBe('$9.00');
  });

  it('formats 0-decimal KES as integer even if catalog said 2', () => {
    const formatted = formatCurrencyAmount('650.35', 'KES', 2);
    expect(formatted).not.toMatch(/\.\d/);
  });

  it('resolveCurrencyFractionDigits is USD=2 else 0', () => {
    expect(resolveCurrencyFractionDigits('CDF')).toBe(0);
    expect(resolveCurrencyFractionDigits('KES')).toBe(0);
    expect(resolveCurrencyFractionDigits('USD')).toBe(2);
  });
});

describe('dialCodes', () => {
  it('maps Kenya dial code', () => {
    expect(getDialCode('KE')).toBe('254');
  });

  it('generates flag emoji', () => {
    expect(iso2ToFlag('KE').length).toBeGreaterThan(0);
  });
});
