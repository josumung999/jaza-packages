import type { InitLedgerItem } from '../api/types.js';
import type { JazaLocale } from '../i18n/types.js';
import { t } from '../i18n/t.js';

export type JazaLedgerItemStatus = 'success' | 'failure' | 'pending';

export type JazaLedgerItemProps = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  credits: number;
  direction: 'credit' | 'debit';
  status: JazaLedgerItemStatus;
  statusLabel: string;
  createdAt: string;
};

export type LedgerSection = {
  key: string;
  label: string;
  items: JazaLedgerItemProps[];
};

export type LedgerSubtitleStyle = 'time' | 'date-time';

const TITLE_LABEL_MAX = 20;

/** BCP 47 tags for Intl date/time formatting. */
const LOCALE_TAGS: Record<JazaLocale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  sw: 'sw-TZ',
  ln: 'ln-CD',
};

export function toBcp47Locale(locale: JazaLocale): string {
  return LOCALE_TAGS[locale] ?? LOCALE_TAGS.en;
}

function truncateLabel(label: string, max: number): string {
  const trimmed = label.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1))}…`;
}

/** Kind shown in the subtitle (Top-up / Purchase). */
export function ledgerKindLabel(type: string, locale: JazaLocale = 'en'): string {
  switch (type) {
    case 'TOP_UP':
      return t(locale, 'ledger.kind.topUp');
    case 'CONSUMPTION':
      return t(locale, 'ledger.kind.purchase');
    case 'REFUND':
      return t(locale, 'ledger.kind.refund');
    default:
      return type;
  }
}

/**
 * Primary title: provider (top-up) or feature (consumption).
 * Capped at 20 characters so the amount stays visible.
 */
export function ledgerTitleLabel(
  entry: InitLedgerItem,
  locale: JazaLocale = 'en',
): string {
  let label: string;
  if (entry.type === 'TOP_UP') {
    label =
      entry.provider?.trim() || t(locale, 'ledger.title.mobileMoney');
  } else if (entry.type === 'CONSUMPTION') {
    label =
      entry.featureName?.trim() ||
      entry.featureCode?.trim() ||
      entry.description?.trim() ||
      t(locale, 'ledger.kind.purchase');
  } else if (entry.type === 'REFUND') {
    label = entry.description?.trim() || t(locale, 'ledger.kind.refund');
  } else {
    label = entry.description?.trim() || entry.type;
  }
  return truncateLabel(label, TITLE_LABEL_MAX);
}

/** @deprecated Prefer ledgerTitleLabel */
export function ledgerDetailLabel(entry: InitLedgerItem): string {
  return ledgerTitleLabel(entry);
}

function directionForType(type: string): 'credit' | 'debit' {
  return type === 'CONSUMPTION' ? 'debit' : 'credit';
}

export function formatLedgerTime(
  iso: string,
  locale: JazaLocale = 'en',
): string {
  try {
    return new Date(iso).toLocaleTimeString(toBcp47Locale(locale), {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** e.g. `05 Sep, 15:04` for preview rows without a date header */
export function formatLedgerDateTime(
  iso: string,
  locale: JazaLocale = 'en',
): string {
  try {
    const d = new Date(iso);
    const tag = toBcp47Locale(locale);
    const dayMonth = d.toLocaleDateString(tag, {
      day: '2-digit',
      month: 'short',
    });
    const time = d.toLocaleTimeString(tag, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dayMonth}, ${time}`;
  } catch {
    return iso;
  }
}

/** @deprecated Prefer formatLedgerTime / formatLedgerDateTime */
export function formatLedgerSubtitle(
  iso: string,
  locale: JazaLocale = 'en',
): string {
  return formatLedgerDateTime(iso, locale);
}

export function ledgerSectionLabel(
  iso: string,
  locale: JazaLocale = 'en',
): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    if (sameDay(d, today)) return t(locale, 'ledger.section.today');
    if (sameDay(d, yesterday)) return t(locale, 'ledger.section.yesterday');
    return d.toLocaleDateString(toBcp47Locale(locale), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return t(locale, 'ledger.section.earlier');
  }
}

export function toLedgerItemProps(
  entry: InitLedgerItem,
  opts?: { subtitleStyle?: LedgerSubtitleStyle; locale?: JazaLocale },
): JazaLedgerItemProps {
  const locale = opts?.locale ?? 'en';
  const kind = ledgerKindLabel(entry.type, locale);
  const when =
    opts?.subtitleStyle === 'date-time'
      ? formatLedgerDateTime(entry.createdAt, locale)
      : formatLedgerTime(entry.createdAt, locale);
  return {
    id: entry.id,
    type: entry.type,
    title: ledgerTitleLabel(entry, locale),
    subtitle: `${kind} · ${when}`,
    credits: entry.credits,
    direction: directionForType(entry.type),
    status: 'success',
    statusLabel: t(locale, 'ledger.status.completed'),
    createdAt: entry.createdAt,
  };
}

/** @deprecated Prefer groupLedgerIntoSections */
export type LedgerListRow =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'item'; key: string; item: JazaLedgerItemProps };

/** @deprecated Prefer groupLedgerIntoSections */
export function groupLedgerIntoRows(
  items: JazaLedgerItemProps[],
  locale: JazaLocale = 'en',
): LedgerListRow[] {
  const rows: LedgerListRow[] = [];
  let lastSection: string | null = null;
  for (const item of items) {
    const label = ledgerSectionLabel(item.createdAt, locale);
    if (label !== lastSection) {
      rows.push({ kind: 'header', key: `h-${label}-${item.id}`, label });
      lastSection = label;
    }
    rows.push({ kind: 'item', key: item.id, item });
  }
  return rows;
}

export function groupLedgerIntoSections(
  items: JazaLedgerItemProps[],
  locale: JazaLocale = 'en',
): LedgerSection[] {
  const sections: LedgerSection[] = [];
  for (const item of items) {
    const label = ledgerSectionLabel(item.createdAt, locale);
    const last = sections[sections.length - 1];
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      sections.push({
        key: `s-${label}-${item.id}`,
        label,
        items: [item],
      });
    }
  }
  return sections;
}
