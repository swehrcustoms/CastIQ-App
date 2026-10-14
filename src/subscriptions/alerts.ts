import type { AccessTier } from './catalog';
import { PROPOSED_LIMITS } from './limits';
import { PRODUCTION_SUBSCRIPTION_FLAGS, type SubscriptionFlags } from './flags';

export interface AlertSubscription {
  userId: string;
  lakeId: string;
  enabled: boolean;
  unsubscribed: boolean;
}

export interface AlertDelivery {
  userId: string;
  lakeId: string;
  reportId: string;
  alertType: 'new_report';
}

export function alertKey(delivery: AlertDelivery): string {
  return `${delivery.userId}|${delivery.lakeId}|${delivery.reportId}|${delivery.alertType}`;
}

export function canEnableAlertLake(tier: AccessTier, enabledCount: number): boolean {
  return tier === 'premium' && enabledCount < PROPOSED_LIMITS.premiumAlertLakes;
}

export function planAlertDispatch(input: {
  tier: AccessTier;
  preference: AlertSubscription;
  delivery: AlertDelivery;
  alreadySent: string[];
  flags?: SubscriptionFlags;
}): { send: false; reason: string } | { send: true; key: string } {
  const flags = input.flags ?? PRODUCTION_SUBSCRIPTION_FLAGS;
  if (!flags.premiumEmailDispatchEnabled) return { send: false, reason: 'email_dispatch_disabled' };
  if (input.tier !== 'premium') return { send: false, reason: 'not_premium' };
  if (!input.preference.enabled || input.preference.unsubscribed) return { send: false, reason: 'not_opted_in' };
  if (input.preference.userId !== input.delivery.userId || input.preference.lakeId !== input.delivery.lakeId) {
    return { send: false, reason: 'recipient_mismatch' };
  }
  const key = alertKey(input.delivery);
  if (input.alreadySent.includes(key)) return { send: false, reason: 'duplicate' };
  return { send: true, key };
}
