import { getDialCode, iso2ToFlag } from '../data/dialCodes.js';
import type { CatalogCountry } from '../api/types.js';

export type EnrichedCountry = {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  dialCode: string;
  flag: string;
  currencies: Array<{ code: string; decimals: number; name: string }>;
};

export function enrichCountries(
  countries: CatalogCountry[],
): EnrichedCountry[] {
  return countries
    .filter((c) => c.isActive && getDialCode(c.iso2))
    .map((c) => {
      const dialCode = getDialCode(c.iso2)!;
      const currencies =
        c.currencies
          ?.map((cc) => cc.currency)
          .filter((cur) => cur?.isActive)
          .map((cur) => ({
            code: cur!.code,
            decimals: cur!.decimals,
            name: cur!.name,
          })) ?? [];
      return {
        id: c.id,
        name: c.name,
        iso2: c.iso2,
        iso3: c.iso3,
        dialCode,
        flag: iso2ToFlag(c.iso2),
        currencies,
      };
    })
    .filter((c) => c.currencies.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildE164(dialCode: string, nationalNumber: string): string {
  let digits = nationalNumber.replace(/\D/g, '');
  const code = dialCode.replace(/\D/g, '');
  // National numbers often include a leading trunk 0 (KE 07…, CD 08…).
  // E.164 must be country code + subscriber digits without that 0.
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }
  if (digits.length < 6) {
    throw new Error('Phone number too short');
  }
  // If the user pasted full international already, don't double the country code.
  if (digits.startsWith(code) && digits.length >= code.length + 6) {
    return digits;
  }
  return `${code}${digits}`;
}

/** Prefer local (non-USD) when multiple currencies are supported. */
export function pickDefaultCurrencyCode(codes: string[]): string {
  if (codes.length === 0) {
    throw new Error('No currencies available');
  }
  const local = codes.find((c) => c.toUpperCase() !== 'USD');
  return (local ?? codes[0]!).toUpperCase();
}

export function isDepositTerminal(
  status: string,
): status is 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED' {
  return (
    status === 'COMPLETED' ||
    status === 'FAILED' ||
    status === 'EXPIRED' ||
    status === 'CANCELLED'
  );
}

export function formatCredits(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatUsd(priceUsd: string): string {
  const n = Number(priceUsd);
  if (Number.isNaN(n)) return priceUsd;
  return formatCurrencyAmount(n, 'USD', 2);
}

/** Fraction digits: USD = 2, every other currency = 0 (MoMo / PawaPay). */
export function resolveCurrencyFractionDigits(currencyCode: string): number {
  return currencyCode.toUpperCase() === 'USD' ? 2 : 0;
}

export function formatCurrencyAmount(
  amount: string | number,
  currencyCode: string,
  _decimals?: number,
): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  const code = currencyCode.toUpperCase();
  if (Number.isNaN(n)) return `${amount} ${code}`;

  const fractionDigits = resolveCurrencyFractionDigits(code);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(n);
  } catch {
    const grouped = n.toLocaleString('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    return `${grouped} ${code}`;
  }
}

/** @deprecated Use formatCurrencyAmount */
export function formatLocalAmount(
  amount: string,
  currencyCode: string,
  decimals?: number,
): string {
  return formatCurrencyAmount(amount, currencyCode, decimals);
}
