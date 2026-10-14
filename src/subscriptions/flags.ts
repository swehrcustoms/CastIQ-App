/**
 * Production defaults. Query parameters cannot turn these on.
 * A production build only enables a flag when that Vite variable is exactly "true".
 */
export const PRODUCTION_SUBSCRIPTION_FLAGS = {
  subscriptionEnforcement: false,
  paidCheckoutEnabled: false,
  premiumEmailDispatchEnabled: false,
} as const;

export type SubscriptionFlags = {
  subscriptionEnforcement: boolean;
  paidCheckoutEnabled: boolean;
  premiumEmailDispatchEnabled: boolean;
};

function buildFlag(name: string): boolean {
  try {
    const env = import.meta.env as Record<string, unknown> | undefined;
    return env?.[name] === 'true';
  } catch {
    return false;
  }
}

export function subscriptionFlags(): SubscriptionFlags {
  return {
    subscriptionEnforcement: buildFlag('VITE_SUBSCRIPTION_ENFORCEMENT'),
    paidCheckoutEnabled: buildFlag('VITE_PAID_CHECKOUT_ENABLED'),
    premiumEmailDispatchEnabled: buildFlag('VITE_PREMIUM_EMAIL_DISPATCH_ENABLED'),
  };
}

export function subscriptionEnforcementEnabled(): boolean {
  return subscriptionFlags().subscriptionEnforcement;
}
