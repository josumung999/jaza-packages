import { describe, expect, it } from 'vitest';
import { toLedgerItemProps } from '../utils/ledgerItems.js';

describe('toLedgerItemProps', () => {
  it('maps top-up as credit with Completed status', () => {
    const props = toLedgerItemProps({
      id: '1',
      type: 'TOP_UP',
      credits: 50,
      description: 'Bundle A',
      createdAt: '2026-09-05T12:00:00.000Z',
    });
    expect(props.direction).toBe('credit');
    expect(props.title).toBe('Bundle A');
    expect(props.statusLabel).toBe('Completed');
    expect(props.credits).toBe(50);
  });

  it('maps consumption as debit', () => {
    const props = toLedgerItemProps({
      id: '2',
      type: 'CONSUMPTION',
      credits: 10,
      createdAt: '2026-09-05T12:00:00.000Z',
    });
    expect(props.direction).toBe('debit');
    expect(props.title).toBe('Purchase');
  });
});
