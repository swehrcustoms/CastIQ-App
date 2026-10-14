# CastIQ subscriptions baseline

Recorded 14 October 2026 before the entitlements branch changed any product behavior.

- Repository: `/Users/stevenwehr/Desktop/CastIQ-App-main`
- Starting branch: `MVP-Launch`
- Starting commit: `b1755a75e11a3725f7a79bd6bd6c8eb74e1d4804`
- Work branch: `subscriptions/entitlements`
- Stack in the repo: Vite, React 18, TypeScript, Tailwind, React Router, Firebase Auth/Firestore/Functions. No billing provider is installed.
- Reference read: `CastIQ_Subscription_Reference_REBUILT.pdf` (10 pages). The prompt name `CastIQ_Subscription_Implementation_Reference.pdf` was not the attached filename. The attached PDF was extracted and used.

## Protected behavior at that commit

Public routes that were already working and must keep working with enforcement off: `/search`, `/pricing`, `/ice`, `/social`, `/about`, `/border-waters`, `/regulations`, `/tactics`, `/submit-report`, `/profile`, `/lake/:lakeId`, legal pages.

Search orders lakes by the newest public report. Lake pages show species from a DNR match when the DOW matches, and the newest public report per species with lure, depth, temperature, structure, and tactic. Ice reports are public, including the safety warning. Favorites save on the signed-in user document with no cap. Pricing shows Standard and Premium only, with month-to-month totals on Monthly (`$59.88`, `$107.88`) and the annual charge plus the crossed-out monthly rate on Annual.

`LIVE_CHECKOUT_ENABLED` is false. Buttons say Coming soon. There is no Stripe price id, no card form, and no email sender for new-report alerts.

Firestore `angler_reports` are readable by anyone when `isPublic == true`, and the document includes lure, depth, and temperature. That read rule was not changed.

## What this branch is allowed to change while flags are off

- Pricing gains a Free column, a comparison table, and an annual savings line. Approved cents stay 499, 3999, 899, and 6999.
- A signed-in profile says the current plan is Free and that CastIQ is not charging.
- Report cards, search, ice, and favorites keep the previous behavior because `VITE_SUBSCRIPTION_ENFORCEMENT` is unset.

## Rollback

Stay on `MVP-Launch` at `b1755a7`, or revert the `subscriptions/entitlements` commits. Do not deploy `firestore.rules` or `functions` from this branch. No production database write was made.
