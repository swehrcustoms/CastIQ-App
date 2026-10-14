# CastIQ subscription implementation report

Branch: `subscriptions/entitlements`, based on `b1755a7`. Not merged to `main`. Not deployed. No production database write, no live email, no live payment.

## What was added

- `src/subscriptions/` holds the catalog, proposed limits, membership state, entitlements, unlock ledger, report redaction, compare/trend rules, alert planning, and checkout/webhook decisions.
- `src/components/subscription/UpgradeCard.tsx` is the upgrade panel. It renders only when enforcement is on.
- Pricing shows Free, the approved Standard and Premium prices, annual savings on the Annual toggle, and a comparison table that labels numeric caps as proposed.
- Profile states Current plan: Free while billing is closed.
- Lake report detail and the favorite cap consult the entitlement code only when `VITE_SUBSCRIPTION_ENFORCEMENT=true`. With the variable unset, those screens keep the previous fields and unlimited favorites.
- `firestore.rules` adds owner-read, client-write-denied paths for membership, unlocks, and alert deliveries. Those rules were not deployed. Public report reads are unchanged.
- `functions/src/subscriptions/redeemUnlock.ts` is not exported from `functions/src/index.ts` and was not deployed. The tested transaction body is `decideUnlock` / `settleUnlockRace`.

## How to try the tiers locally

Enforcement off (default), from the repo:

```bash
export PATH="/tmp/castiq-node/node-v22.21.0-darwin-arm64/bin:$PATH"
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5185
```

Open `/search`, `/pricing`, and a lake. Report lures and favorites behave as they did on `b1755a7`.

Enforcement on, dev tier only (ignored in a production build and ignored if the URL asks for a tier):

```bash
VITE_SUBSCRIPTION_ENFORCEMENT=true VITE_DEV_ENTITLEMENT_TIER=free \
  node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5185
```

Use `standard` or `premium` for the other tiers. Free hides lure, depth, temperature, structure, and the report note, and still shows the date and source. The unlock button does not spend a credit because the callable is not deployed. Do not set these variables on Vercel.

Logic tests, without the dev server:

```bash
node node_modules/tsx/dist/cli.mjs tests/subscriptions.test.ts
node node_modules/tsx/dist/cli.mjs tests/mvpLaunch.test.ts
node node_modules/typescript/lib/tsc.js --noEmit
```

Results on 14 October 2026: subscription tests 8 passed, MVP tests 11 passed, `tsc --noEmit` exited 0.

## Known limits

- Public Firestore reads still return full report documents. Hiding fields in React is not the paid-data boundary. A paid launch needs a restricted field store and a deployed rules change.
- Saved-lake caps run in the browser only when enforcement is on. A signed-in client can still write `favoriteLakeIds` under the current deployed rules.
- There is no email provider, so new-report alerts cannot send. Report freshness remains a saved preference.
- There is no billing provider. Checkout returns `checkout_disabled` or `provider_not_configured`. A success URL cannot raise a tier.
- Compare and trend helpers are tested and are not mounted as a new page, so navigation stays the same.
- Browser checks in this pass covered local `/pricing` with enforcement off. An unsigned browser is sent from `/search` to `/login` by the existing protected route, so the signed-in search page was not clicked. Phone width and a signed-in favorite cap were not clicked.

## Rollback

Check out `MVP-Launch` at `b1755a7`. Do not deploy rules or functions from this branch.

## Launch call

**CONDITIONAL GO** for this development branch: flags default off, approved prices are unchanged, and the tier rules are tested.

**NO-GO** for charging money. Paid report fields are still publicly readable, Premium tools are not a finished product, alerts cannot send, and no provider price id exists.
