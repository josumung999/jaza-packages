import { describe, expect, it } from 'vitest';
import {
  buildE164,
  pickDefaultCurrencyCode,
  isDepositTerminal,
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

describe('dialCodes', () => {
  it('maps Kenya dial code', () => {
    expect(getDialCode('KE')).toBe('254');
  });

  it('generates flag emoji', () => {
    expect(iso2ToFlag('KE').length).toBeGreaterThan(0);
  });
});
