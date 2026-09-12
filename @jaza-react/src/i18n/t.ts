import { en } from './dictionaries/en.js';
import { fr } from './dictionaries/fr.js';
import { ln } from './dictionaries/ln.js';
import { sw } from './dictionaries/sw.js';
import type { JazaLocale, MessageDictionary, MessageParams } from './types.js';

const dictionaries: Record<JazaLocale, MessageDictionary> = {
  en,
  fr,
  sw,
  ln,
};

export function getDictionary(locale: JazaLocale): MessageDictionary {
  return dictionaries[locale] ?? en;
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

/**
 * Translate a built-in SDK string. Falls back to English when a key is missing.
 */
export function t(
  locale: JazaLocale,
  key: string,
  params?: MessageParams,
): string {
  const primary = getDictionary(locale)[key];
  const fallback = en[key];
  const template = primary ?? fallback ?? key;
  return interpolate(template, params);
}

export { en, fr, sw, ln };
