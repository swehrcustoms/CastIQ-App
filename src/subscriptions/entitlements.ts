import { ENTITLEMENTS, tierHasEntitlement, type EntitlementKey } from '../data/pricing';
import type { AccessTier } from './catalog';
import { PROPOSED_LIMITS } from './limits';

const FREE_KEYS = new Set<EntitlementKey>(['lake_species_search', 'seasonal_ice_reports']);

export function hasFeature(tier: AccessTier, key: EntitlementKey): boolean {
  if (tier === 'free') return FREE_KEYS.has(key);
  return tierHasEntitlement(tier, key);
}

export function getEntitlements(tier: AccessTier): EntitlementKey[] {
  return (Object.keys(ENTITLEMENTS) as EntitlementKey[]).filter((key) => hasFeature(tier, key));
}

export function savedLakeCap(tier: AccessTier): number {
  return PROPOSED_LIMITS.savedLakes[tier];
}

export function canSaveLake(tier: AccessTier, savedCount: number, alreadySaved: boolean): { ok: boolean; cap: number } {
  if (alreadySaved) return { ok: true, cap: savedLakeCap(tier) };
  const cap = savedLakeCap(tier);
  return { ok: savedCount < cap, cap };
}

