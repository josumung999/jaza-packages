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
  const digits = nationalNumber.replace(/\D/g, '');
  const code = dialCode.replace(/\D/g, '');
  if (digits.length < 6) {
    throw new Error('Phone number too short');
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
  return `$${n.toFixed(2)}`;
}

export function formatLocalAmount(
  amount: string,
  currencyCode: string,
  decimals?: number,
): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${amount} ${currencyCode}`;
  const d = decimals ?? 2;
  return `${n.toFixed(d)} ${currencyCode}`;
}
