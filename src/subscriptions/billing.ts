import { skuById, type PurchaseSku } from './catalog';
import { PRODUCTION_SUBSCRIPTION_FLAGS, type SubscriptionFlags } from './flags';
import type { MembershipRecord } from './membership';

export interface BillingEvent {
  id: string;
  type: 'checkout_completed' | 'payment_failed' | 'cancel_at_period_end' | 'expired' | 'renewed';
  occurredAt: number;
  sku: PurchaseSku;
  userId: string;
  currentPeriodEnd: number | null;
}

export interface BillingState {
  membership: MembershipRecord | null;
  appliedEventIds: string[];
  lastEventAt: number;
}

export function requestCheckout(input: {
  sku: string;
  clientPriceId?: string | null;
  flags?: SubscriptionFlags;
}): { ok: false; code: 'client_price_rejected' | 'unknown_sku' | 'checkout_disabled' | 'provider_not_configured' } {
  const flags = input.flags ?? PRODUCTION_SUBSCRIPTION_FLAGS;
  if (input.clientPriceId) return { ok: false, code: 'client_price_rejected' };
  const sku = skuById(input.sku);
  if (!sku || sku.sku === 'free') return { ok: false, code: 'unknown_sku' };
  if (!flags.paidCheckoutEnabled) return { ok: false, code: 'checkout_disabled' };
  return { ok: false, code: 'provider_not_configured' };
}

/** A success URL never grants a tier. */
export function tierFromSuccessUrl(): 'free' {
  return 'free';
}

export function applyBillingEvent(state: BillingState, event: BillingEvent): { state: BillingState; duplicate: boolean } {
  if (state.appliedEventIds.includes(event.id)) return { state, duplicate: true };
  if (event.occurredAt < state.lastEventAt) {
    return {
      duplicate: false,
      state: { ...state, appliedEventIds: [...state.appliedEventIds, event.id] },
    };
  }
  const sku = skuById(event.sku);
  let membership = state.membership;
  if (event.type === 'checkout_completed' || event.type === 'renewed') {
    if (sku && sku.tier !== 'free') {
      membership = {
        tier: sku.tier,
        status: 'active',
        currentPeriodEnd: event.currentPeriodEnd,
        providerCustomerId: membership?.providerCustomerId ?? null,
        providerSubscriptionId: membership?.providerSubscriptionId ?? null,
      };
    }
  } else if (event.type === 'cancel_at_period_end' && membership) {
    membership = { ...membership, status: 'cancel_at_period_end', currentPeriodEnd: event.currentPeriodEnd };
  } else if (event.type === 'expired' && membership) {
    membership = { ...membership, status: 'expired' };
  } else if (event.type === 'payment_failed') {
    membership = membership && membership.status === 'active' ? membership : null;
  }
  return {
    duplicate: false,
    state: {
      membership,
      appliedEventIds: [...state.appliedEventIds, event.id],
      lastEventAt: event.occurredAt,
    },
  };
}
