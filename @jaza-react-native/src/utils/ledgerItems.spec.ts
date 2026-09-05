import { describe, expect, it } from 'vitest';
import {
  groupLedgerIntoSections,
  ledgerTitleLabel,
  toLedgerItemProps,
} from './ledgerItems.js';

describe('ledgerTitleLabel', () => {
  it('uses provider for top-ups and feature for consumption', () => {
    expect(
      ledgerTitleLabel({
        id: '1',
        type: 'TOP_UP',
        credits: 50,
        provider: 'M-Pesa',
        createdAt: '2026-09-05T12:00:00.000Z',
      }),
    ).toBe('M-Pesa');
    expect(
      ledgerTitleLabel({
        id: '2',
        type: 'CONSUMPTION',
        credits: 5,
        featureName: 'Send message',
        featureCode: 'SEND_MSG',
        createdAt: '2026-09-05T12:00:00.000Z',
      }),
    ).toBe('Send message');
  });

  it('truncates titles longer than 20 characters', () => {
    expect(
      ledgerTitleLabel({
        id: '3',
        type: 'TOP_UP',
        credits: 50,
        provider: 'Very Long Mobile Money Provider Name',
        createdAt: '2026-09-05T12:00:00.000Z',
      }),
    ).toBe('Very Long Mobile Mo…');
    expect(
      ledgerTitleLabel({
        id: '3',
        type: 'TOP_UP',
        credits: 50,
        provider: 'Very Long Mobile Money Provider Name',
        createdAt: '2026-09-05T12:00:00.000Z',
      }).length,
    ).toBeLessThanOrEqual(20);
  });
});

describe('toLedgerItemProps', () => {
  it('maps top-up with provider title and Top-up subtitle', () => {
    const props = toLedgerItemProps({
      id: '1',
      type: 'TOP_UP',
      credits: 50,
      provider: 'M-Pesa',
      createdAt: '2026-09-05T12:00:00.000Z',
    });
    expect(props.direction).toBe('credit');
    expect(props.title).toBe('M-Pesa');
    expect(props.status).toBe('success');
    expect(props.subtitle).toMatch(/^Top-up · /);
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
    expect(props.title).toBe('M-Pesa');
    expect(props.subtitle).toMatch(/^Top-up · /);
    expect(props.subtitle).toMatch(/Sep/i);
  });

  it('maps consumption with feature title and Purchase subtitle', () => {
    const props = toLedgerItemProps({
      id: '2',
      type: 'CONSUMPTION',
      credits: 10,
      featureCode: 'SEND_MSG',
      featureName: 'Send message',
      createdAt: '2026-09-05T12:00:00.000Z',
    });
    expect(props.direction).toBe('debit');
    expect(props.title).toBe('Send message');
    expect(props.subtitle).toMatch(/^Purchase · /);
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
