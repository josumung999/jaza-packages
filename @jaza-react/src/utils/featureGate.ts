import type { InitFeature } from '../api/types.js';

export function getFeatureCost(
  features: InitFeature[],
  featureCode: string,
): number | null {
  const feature = features.find((f) => f.code === featureCode);
  return feature ? feature.creditsCost : null;
}

export function canAffordFeature(
  balanceCredits: number | null,
  features: InitFeature[],
  featureCodeOrCredits: string | number,
): boolean {
  if (balanceCredits === null) return false;
  if (typeof featureCodeOrCredits === 'number') {
    return balanceCredits >= featureCodeOrCredits;
  }
  const cost = getFeatureCost(features, featureCodeOrCredits);
  if (cost === null) return false;
  return balanceCredits >= cost;
}
