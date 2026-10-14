# CastIQ subscription QA matrix

Environment: local repo, 14 October 2026. Commands:

- `node node_modules/tsx/dist/cli.mjs tests/subscriptions.test.ts` — 8 passed
- `node node_modules/tsx/dist/cli.mjs tests/mvpLaunch.test.ts` — 11 passed
- `node node_modules/typescript/lib/tsc.js --noEmit` — exit 0
- Browser: local Vite `/pricing` and `/search` with enforcement unset

| Scenario | Result | Evidence |
|---|---|---|
| Approved prices and five SKUs | PASS | `tests/subscriptions.test.ts` catalog test |
| Standard monthly access equals annual; Premium monthly equals annual | PASS | Same test, SKU tiers |
| Annual savings $19.89 / $37.89 | PASS | `annualSavings` |
| Flags default off | PASS | `PRODUCTION_SUBSCRIPTION_FLAGS` |
| Anonymous unlock does not charge | PASS | `unauthenticated` |
| Free reports 1–3 and reopen | PASS | unlock ledger test |
| Fourth report blocked | PASS | `quota` |
| Race uses one remaining credit | PASS | `settleUnlockRace` |
| 30-day expiry charges again | PASS | expired unlock test |
| Forged spaced report id rejected | PASS | `invalid_report` |
| Standard 30-day plus latest older report | PASS | `reportsForStandard` |
| Locked standard payload has no paid fields | PASS | `responseHasPaidFields` |
| Premium sees an older report | PASS | `presentReport` premium |
| Saved lakes 2 / 10 / unlimited and downgrade keeps rows | PASS | `canSaveLake` |
| Compare rejects a fourth lake and has no ranking | PASS | `compareLakes` |
| Missing measurement is “Not reported” | PASS | compare row |
| Trend with one point is insufficient | PASS | `trendStatus` |
| Alerts default off, duplicate blocked, unsubscribe blocked | PASS | `planAlertDispatch` |
| Checkout off; client price id rejected; success URL stays Free | PASS | billing test |
| Pending, error, and expired memberships stay Free | PASS | `tierFromMembership` |
| Cancel-at-period-end keeps access until the end date | PASS | billing test |
| Webhook replay ignored | PASS | `duplicate` |
| Search sort, species chips, regulations, existing prices | PASS | `tests/mvpLaunch.test.ts` |
| `/pricing` renders with enforcement off | PASS | local browser: Free $0, Standard $4.99/month and Annual plan $59.88, Premium $8.99/month and $107.88; Annual shows $39.99/year, struck $4.99/month, $3.33/month, save $19.89, and the same pattern for Premium |
| `/search` in an unsigned browser | NOT TESTED as a signed-in page | The existing protected route sent the unsigned browser to `/login`. Search ordering is covered by `tests/mvpLaunch.test.ts`. |
| Signed-in Free unlock against Firestore | NOT TESTED | Callable is not deployed |
| Direct Firestore read of a public report | FAIL as a paywall | Rules still allow full public report reads. Expected until a later approved rules deploy. |
| Phone, tablet, and keyboard pass of every control | NOT TESTED | Pricing buttons remain real buttons. No full viewport pass. |
| Live email receipt | NOT TESTED | No provider. Dispatch flag is false. |
| Provider webhook signature | NOT TESTED | No provider. |
| Production Vercel after this branch | NOT TESTED | Branch was not deployed. |
