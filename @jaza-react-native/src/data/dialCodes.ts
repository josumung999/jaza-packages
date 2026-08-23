/** ISO 3166-1 alpha-2 → international dial code (Jaza MoMo ecosystem). */
export const DIAL_CODES: Record<string, string> = {
  BJ: '229',
  BF: '226',
  CM: '237',
  CI: '225',
  CD: '243',
  CG: '242',
  ET: '251',
  GA: '241',
  GH: '233',
  KE: '254',
  MW: '265',
  MZ: '258',
  NG: '234',
  RW: '250',
  SN: '221',
  SL: '232',
  TZ: '255',
  UG: '256',
  ZM: '260',
};

export function iso2ToFlag(iso2: string): string {
  const code = iso2.toUpperCase();
  if (code.length !== 2) return '';
  const points = [...code].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...points);
}

export function getDialCode(iso2: string): string | undefined {
  return DIAL_CODES[iso2.toUpperCase()];
}
