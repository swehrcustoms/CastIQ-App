/**
 * Proposed caps. They are not partner-approved business rules.
 * Enforcement stays off until the owner signs off. See docs/CASTIQ_SUBSCRIPTION_DECISIONS.md.
 */
export const PROPOSED_LIMITS = {
  freeFullReportUnlocksPer30Days: 3,
  rollingWindowMs: 30 * 24 * 60 * 60 * 1000,
  savedLakes: { free: 2, standard: 10, premium: Number.POSITIVE_INFINITY },
  premiumCompareLakes: 3,
  premiumAlertLakes: 25,
  trendMinimumObservations: 3,
} as const;
