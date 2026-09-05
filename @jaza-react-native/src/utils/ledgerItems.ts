import type { InitLedgerItem } from '../api/types.js';

export type JazaLedgerItemProps = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  credits: number;
  direction: 'credit' | 'debit';
  statusLabel: string;
  createdAt: string;
};

function titleForType(type: string, description?: string): string {
  if (description?.trim()) return description.trim();
  switch (type) {
    case 'TOP_UP':
      return 'Top-up';
    case 'CONSUMPTION':
      return 'Purchase';
    case 'REFUND':
      return 'Refund';
    default:
      return type;
  }
}

function directionForType(type: string): 'credit' | 'debit' {
  return type === 'CONSUMPTION' ? 'debit' : 'credit';
}

export function formatLedgerSubtitle(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
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
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Earlier';
  }
}

export function toLedgerItemProps(entry: InitLedgerItem): JazaLedgerItemProps {
  return {
    id: entry.id,
    type: entry.type,
    title: titleForType(entry.type, entry.description),
    subtitle: formatLedgerSubtitle(entry.createdAt),
    credits: entry.credits,
    direction: directionForType(entry.type),
    statusLabel: 'Completed',
    createdAt: entry.createdAt,
  };
}

export type LedgerListRow =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'item'; key: string; item: JazaLedgerItemProps };

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
