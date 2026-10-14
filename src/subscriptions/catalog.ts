import { PLAN_PRICES, priceFor, type BillingInterval, type PlanTier } from '../data/pricing';

export type AccessTier = 'free' | 'standard' | 'premium';

export type PurchaseSku =
  | 'free'
  | 'standard_monthly'
  | 'standard_annual'
  | 'premium_monthly'
  | 'premium_annual';

export interface CatalogSku {
  sku: PurchaseSku;
  tier: AccessTier;
  interval: BillingInterval | 'none';
  cents: number;
  display: string;
  /** Empty until an owner-approved provider price id exists. */
  providerPriceId: null;
}

const PAID: CatalogSku[] = (['standard', 'premium'] as PlanTier[]).flatMap((tier) =>
  (['monthly', 'annual'] as BillingInterval[]).map((interval) => {
    const price = priceFor(tier, interval);
    const sku = `${tier}_${interval}` as PurchaseSku;
    return {
      sku,
      tier,
      interval,
      cents: price.cents,
      display: price.display,
      providerPriceId: null,
    };
  }),
);

export const PURCHASE_SKUS: CatalogSku[] = [
  { sku: 'free', tier: 'free', interval: 'none', cents: 0, display: '$0', providerPriceId: null },
  ...PAID,
];

export const ALLOWED_PAID_CENTS = [499, 3999, 899, 6999] as const;

export function skuById(sku: string): CatalogSku | null {
  return PURCHASE_SKUS.find((item) => item.sku === sku) ?? null;
}

export function assertCatalogMatchesApprovedPrices(): void {
  const paid = PURCHASE_SKUS.filter((item) => item.sku !== 'free');
  if (paid.length !== 4) throw new Error('CastIQ has exactly four paid SKUs.');
  if (PURCHASE_SKUS.length !== 5) throw new Error('CastIQ has exactly five purchase options.');
  const cents = PLAN_PRICES.map((price) => price.cents);
  if (cents.join() !== ALLOWED_PAID_CENTS.join()) throw new Error('Approved prices changed.');
}
