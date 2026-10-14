# CastIQ subscription decisions

## Approved and unchanged

| Fact | Value |
|---|---|
| Purchase options | Free $0; Standard $4.99/month or $39.99/year; Premium $8.99/month or $69.99/year |
| Entitlement levels | Free, Standard, Premium. Billing interval does not change access. |
| Premium | Includes every Standard benefit category. |
| Standard categories | Lake and species reports, depths/lures/techniques, water and structure where present, seasonal ice reports where present, lake and species search. |
| Premium categories | Favorite-lake new-report alerts, extended history, advanced filters, cross-lake comparison, saved-lake dashboard, historical trends where data exists. |
| Annual math | Standard saves $19.89 (about 33%) versus 12 × $4.99. Premium saves $37.89 (about 35%) versus 12 × $8.99. The annual charge is still yearly. |
| Checkout | Off. No provider, no price id, no trial, no coupon, no tax, no refund policy. |
| Ice safety and source links | Never paywalled. |

Partner benefit categories are not proof those Premium tools work today. Favorite lakes already exist and are not a paid dashboard. Report-freshness is a saved preference, not a sent email.

## Proposed, not approved, and not enforced in production

Constants live in `src/subscriptions/limits.ts`.

| Rule | Proposal |
|---|---|
| Free full-report unlocks | 3 distinct canonical report ids per rolling 30 days, signed-in only |
| Standard history | Past 30 days, plus the newest report on a lake when that report is older |
| Saved lakes | Free 2, Standard 10, Premium unlimited. Downgrade does not delete extras. |
| Premium compare | 3 lakes, no best-lake score |
| Premium email alerts | 25 opt-in lakes, separate from report freshness |
| Trends | At least 3 comparable observations, otherwise insufficient |

## Still needs an owner decision before any paid launch

- Approve or change every proposed number above.
- Choose a billing provider, tax treatment, renewal terms, and refund contact.
- Approve which Premium lines on the pricing page are actually delivered.
- Approve a functions and rules deploy that moves paid report fields out of the public `angler_reports` read.
- Approve an email provider before any alert is described as working.

Production flags stay off: `subscriptionEnforcement`, `paidCheckoutEnabled`, `premiumEmailDispatchEnabled`. They are build-time Vite variables, not URL parameters.
