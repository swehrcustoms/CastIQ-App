export type BillingInterval = 'monthly' | 'annual';
export type PlanTier = 'standard' | 'premium';

export const LIVE_CHECKOUT_ENABLED = false;

export const PRICING_HERO = {
  title: "Find out what's biting.",
  description:
    "Get fishing reports for Minnesota lakes, discover what's working for your target species, and spend less time searching for information and more time fishing.",
};

export const PRICING_DISCLAIMER =
  'Conditions and report details vary by lake, species, source, and reporting availability. Always verify current conditions before heading out, especially when ice fishing.';

export interface PlanPrice {
  tier: PlanTier;
  interval: BillingInterval;
  display: string;
  cents: number;
}

export const PLAN_PRICES: PlanPrice[] = [
  { tier: 'standard', interval: 'monthly', display: '$4.99/month', cents: 499 },
  { tier: 'standard', interval: 'annual', display: '$39.99/year', cents: 3999 },
  { tier: 'premium', interval: 'monthly', display: '$8.99/month', cents: 899 },
  { tier: 'premium', interval: 'annual', display: '$69.99/year', cents: 6999 },
];

export const STANDARD_BULLETS = [
  'Lake-specific and species-specific fishing reports',
  'Reported depths, lures, and techniques',
  'Water conditions and bottom structure, where available',
  'Seasonal ice reports, where available',
  'Easy lake and species search',
] as const;

export const PREMIUM_BULLETS = [
  'Alerts for new reports on your favorite lakes',
  'Extended fishing report history',
  'Advanced lake and species filters',
  'Compare conditions across lakes',
  'Personalized saved-lake dashboard',
  'Historical fishing trends where data is available',
] as const;

export const PLANS = [
  {
    tier: 'standard' as const,
    name: 'Standard',
    subtitle: 'Everything you need to plan your next fishing trip.',
    bullets: STANDARD_BULLETS,
  },
  {
    tier: 'premium' as const,
    name: 'Premium',
    subtitle: 'Get more insights before you hit the water.',
    bullets: PREMIUM_BULLETS,
    inherits: 'Everything in Standard, plus:',
  },
];

export type EntitlementKey =
  | 'fishing_reports'
  | 'reported_depths_lures_techniques'
  | 'water_bottom_structure'
  | 'seasonal_ice_reports'
  | 'lake_species_search'
  | 'favorite_lake_new_report_alerts'
  | 'extended_fishing_history'
  | 'advanced_lake_species_filters'
  | 'cross_lake_conditions_compare'
  | 'saved_lake_dashboard'
  | 'historical_fishing_trends';

export const ENTITLEMENTS: Record<EntitlementKey, { standard: boolean; premium: boolean }> = {
  fishing_reports: { standard: true, premium: true },
  reported_depths_lures_techniques: { standard: true, premium: true },
  water_bottom_structure: { standard: true, premium: true },
  seasonal_ice_reports: { standard: true, premium: true },
  lake_species_search: { standard: true, premium: true },
  favorite_lake_new_report_alerts: { standard: false, premium: true },
  extended_fishing_history: { standard: false, premium: true },
  advanced_lake_species_filters: { standard: false, premium: true },
  cross_lake_conditions_compare: { standard: false, premium: true },
  saved_lake_dashboard: { standard: false, premium: true },
  historical_fishing_trends: { standard: false, premium: true },
};

export function priceFor(tier: PlanTier, interval: BillingInterval): PlanPrice {
  const price = PLAN_PRICES.find((item) => item.tier === tier && item.interval === interval);
  if (!price) throw new Error(`Missing price for ${tier} ${interval}`);
  return price;
}

/** Monthly equivalent of the annual charge. This is not a separate monthly bill. */
export function annualPricePerMonth(tier: PlanTier): { cents: number; display: string } {
  const cents = Math.round(priceFor(tier, 'annual').cents / 12);
  return { cents, display: `$${(cents / 100).toFixed(2)}/month` };
}

/** Twelve month-to-month payments. This is not the discounted annual charge. */
export function monthlyYearTotal(tier: PlanTier): { cents: number; display: string } {
  const cents = priceFor(tier, 'monthly').cents * 12;
  return { cents, display: `$${(cents / 100).toFixed(2)}` };
}

/** Difference between 12 monthly bills and the annual charge. Not a separate discount code. */
export function annualSavings(tier: PlanTier): { cents: number; display: string; percent: number } {
  const cents = monthlyYearTotal(tier).cents - priceFor(tier, 'annual').cents;
  const percent = Math.round((cents / monthlyYearTotal(tier).cents) * 100);
  return { cents, display: `$${(cents / 100).toFixed(2)}`, percent };
}

export function tierHasEntitlement(tier: PlanTier, key: EntitlementKey): boolean {
  return ENTITLEMENTS[key][tier];
}
