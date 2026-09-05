import type { InitLedgerItem } from '../api/types.js';

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

function titleForType(type: string, description?: string): string {
  // Feature / provider belong in the subtitle, not the title.
  if (type === 'CONSUMPTION') return 'Purchase';
  if (description?.trim()) return description.trim();
  switch (type) {
    case 'TOP_UP':
      return 'Top-up';
    case 'REFUND':
      return 'Refund';
    default:
      return type;
  }
}

/** Leading subtitle segment: provider for top-ups, feature for consumption. */
export function ledgerDetailLabel(entry: InitLedgerItem): string {
  if (entry.type === 'TOP_UP') {
    return entry.provider?.trim() || 'Mobile Money';
  }
  if (entry.type === 'CONSUMPTION') {
    return (
      entry.featureName?.trim() ||
      entry.featureCode?.trim() ||
      entry.description?.trim() ||
      'Purchase'
    );
  }
  if (entry.type === 'REFUND') {
    return 'Refund';
  }
  return entry.type;
}

function directionForType(type: string): 'credit' | 'debit' {
  return type === 'CONSUMPTION' ? 'debit' : 'credit';
}

export function formatLedgerTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** e.g. `05 Sep · 15:04` for preview rows without a date header */
export function formatLedgerDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const dayMonth = d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
    });
    const time = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dayMonth} · ${time}`;
  } catch {
    return iso;
  }
}

/** @deprecated Prefer formatLedgerTime / formatLedgerDateTime */
export function formatLedgerSubtitle(iso: string): string {
  return formatLedgerDateTime(iso);
}

export function ledgerSectionLabel(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Earlier';
  }
}

export function toLedgerItemProps(
  entry: InitLedgerItem,
  opts?: { subtitleStyle?: LedgerSubtitleStyle },
): JazaLedgerItemProps {
  const detail = ledgerDetailLabel(entry);
  const when =
    opts?.subtitleStyle === 'date-time'
      ? formatLedgerDateTime(entry.createdAt)
      : formatLedgerTime(entry.createdAt);
  return {
    id: entry.id,
    type: entry.type,
    title: titleForType(entry.type, entry.description),
    subtitle: `${detail} · ${when}`,
    credits: entry.credits,
    direction: directionForType(entry.type),
    status: 'success',
    statusLabel: 'Completed',
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
): LedgerListRow[] {
  const rows: LedgerListRow[] = [];
  let lastSection: string | null = null;
  for (const item of items) {
    const label = ledgerSectionLabel(item.createdAt);
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
): LedgerSection[] {
  const sections: LedgerSection[] = [];
  for (const item of items) {
    const label = ledgerSectionLabel(item.createdAt);
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
