import { describe, expect, it } from 'vitest';
import {
  groupLedgerIntoSections,
  ledgerDetailLabel,
  toLedgerItemProps,
} from './ledgerItems.js';

describe('ledgerDetailLabel', () => {
  it('uses provider for top-ups and feature for consumption', () => {
    expect(
      ledgerDetailLabel({
        id: '1',
        type: 'TOP_UP',
        credits: 50,
        provider: 'M-Pesa',
        createdAt: '2026-09-05T12:00:00.000Z',
      }),
    ).toBe('M-Pesa');
    expect(
      ledgerDetailLabel({
        id: '2',
        type: 'CONSUMPTION',
        credits: 5,
        featureName: 'Send message',
        featureCode: 'SEND_MSG',
        createdAt: '2026-09-05T12:00:00.000Z',
      }),
    ).toBe('Send message');
  });
});

describe('toLedgerItemProps', () => {
  it('maps top-up with provider subtitle (time only by default)', () => {
    const props = toLedgerItemProps({
      id: '1',
      type: 'TOP_UP',
      credits: 50,
      provider: 'M-Pesa',
      createdAt: '2026-09-05T12:00:00.000Z',
    });
    expect(props.direction).toBe('credit');
    expect(props.title).toBe('Top-up');
    expect(props.status).toBe('success');
    expect(props.subtitle).toMatch(/^M-Pesa · /);
    expect(props.subtitle).not.toMatch(/Sep/);
  });

  it('includes short date in preview subtitle style', () => {
    const props = toLedgerItemProps(
      {
        id: '1',
        type: 'TOP_UP',
        credits: 50,
        provider: 'M-Pesa',
        createdAt: '2026-09-05T12:00:00.000Z',
      },
      { subtitleStyle: 'date-time' },
    );
    expect(props.subtitle).toMatch(/^M-Pesa · /);
    expect(props.subtitle).toMatch(/Sep/i);
  });

  it('maps consumption with feature detail', () => {
    const props = toLedgerItemProps({
      id: '2',
      type: 'CONSUMPTION',
      credits: 10,
      featureCode: 'SEND_MSG',
      featureName: 'Send message',
      createdAt: '2026-09-05T12:00:00.000Z',
    });
    expect(props.direction).toBe('debit');
    expect(props.title).toBe('Purchase');
    expect(props.subtitle).toMatch(/^Send message · /);
  });
});

describe('groupLedgerIntoSections', () => {
  it('groups same-day items into one section', () => {
    const sections = groupLedgerIntoSections([
      toLedgerItemProps({
        id: '1',
        type: 'TOP_UP',
        credits: 10,
        createdAt: '2026-09-05T10:00:00.000Z',
      }),
      toLedgerItemProps({
        id: '2',
        type: 'CONSUMPTION',
        credits: 5,
        createdAt: '2026-09-05T18:00:00.000Z',
      }),
    ]);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.items).toHaveLength(2);
  });
});
