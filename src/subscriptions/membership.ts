import type { AccessTier } from './catalog';

export type MembershipStatus =
  | 'free'
  | 'active'
  | 'cancel_at_period_end'
  | 'pending'
  | 'expired'
  | 'unknown'
  | 'error';

export interface MembershipRecord {
  tier: 'standard' | 'premium';
  status: MembershipStatus;
  currentPeriodEnd: number | null;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
}

/** Paid access comes only from a verified membership record. Client-selected plans are ignored. */
export function tierFromMembership(membership: MembershipRecord | null, now: number): AccessTier {
  if (!membership) return 'free';
  if (membership.status === 'active') return membership.tier;
  if (
    membership.status === 'cancel_at_period_end' &&
    membership.currentPeriodEnd != null &&
    membership.currentPeriodEnd > now
  ) {
    return membership.tier;
  }
  return 'free';
}

export function tierFromUntrustedClient(input: { tier?: string; search?: string } | null): AccessTier {
  void input;
  return 'free';
}

/**
 * Local QA only. Ignored unless the enforcement build flag is on and this is a dev build.
 * Location search strings are never read.
 */
export function devEntitlementTier(): AccessTier | null {
  if (!import.meta.env?.DEV) return null;
  try {
    if (import.meta.env.VITE_SUBSCRIPTION_ENFORCEMENT !== 'true') return null;
    const raw = import.meta.env.VITE_DEV_ENTITLEMENT_TIER;
    if (raw === 'free' || raw === 'standard' || raw === 'premium') return raw;
  } catch {
    return null;
  }
  return null;
}

export function currentAccessTier(membership: MembershipRecord | null, now = Date.now()): AccessTier {
  return devEntitlementTier() ?? tierFromMembership(membership, now);
}
