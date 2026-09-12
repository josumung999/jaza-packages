import { describe, expect, it } from 'vitest';
import { canAffordFeature, getFeatureCost } from './featureGate.js';

const features = [
  { code: 'SEND_MSG', creditsCost: 5, name: 'Send' },
  { code: 'PRINT', creditsCost: 20 },
];

describe('getFeatureCost', () => {
  it('returns cost for known feature', () => {
    expect(getFeatureCost(features, 'SEND_MSG')).toBe(5);
  });

  it('returns null for unknown feature', () => {
    expect(getFeatureCost(features, 'MISSING')).toBeNull();
  });
});

describe('canAffordFeature', () => {
  it('gates by feature code', () => {
    expect(canAffordFeature(10, features, 'SEND_MSG')).toBe(true);
    expect(canAffordFeature(4, features, 'SEND_MSG')).toBe(false);
  });

  it('gates by raw credits', () => {
    expect(canAffordFeature(10, features, 10)).toBe(true);
    expect(canAffordFeature(9, features, 10)).toBe(false);
  });

  it('returns false when balance unknown or feature missing', () => {
    expect(canAffordFeature(null, features, 'SEND_MSG')).toBe(false);
    expect(canAffordFeature(100, features, 'MISSING')).toBe(false);
  });
});
