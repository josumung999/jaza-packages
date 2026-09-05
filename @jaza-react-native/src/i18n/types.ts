export type JazaLocale = 'en' | 'fr' | 'sw' | 'ln';

export const JAZA_LOCALES: readonly JazaLocale[] = [
  'en',
  'fr',
  'sw',
  'ln',
] as const;

export type MessageParams = Record<string, string | number>;

/** Flat dictionary of built-in SDK copy. */
export type MessageDictionary = Record<string, string>;
