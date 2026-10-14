# CastIQ fix audit

Date: 2026-10-13. Branch started from `main` at `ca8c780`.

## Stack

Vite 5, React 18, TypeScript, React Router 6, Tailwind, Firebase Auth/Firestore. Lake name search uses the Minnesota DNR LakeFinder. There is no Supabase project and no payment provider in the repo.

## Route map before the fixes

| Route | Shell |
|---|---|
| `/`, `/search`, `/ice`, `/lake/:id` | Signed-in shell. Lake pages hid the primary nav. |
| `/pricing`, `/guides` | Separate public header. Primary nav disappeared. |
| `/login` | No app nav. |

Home (`/`) and the Map tab both opened the map. Social, Regulations, Border waters, and Share a report were in the primary or More menus.

## Baseline

There was no unit-test script. `tsc --noEmit` is the typecheck. Lint depends on the local ESLint install.

## Root causes

- FIX-01: Pricing and Tactics were outside the shared shell.
- FIX-02: Overview rendered every Firestore report document. Two documents with the same source, time, and text both rendered, while the tab count used `reportCount7d`.
- FIX-03: CastIQ and Map both targeted `/`.
- FIX-04: A second action row repeated Live Intel, Fisheries, Contours, Regulations, and Submit Report above the tabs. Regulations was in that row and in the tabs.
- FIX-07: Typed search ranked by name score, then acreage. The empty lake list used report dates, but the visible cards emphasize a 7-day count, which is not the sort key.
- FIX-09: Onboarding heading was “Which alerts should we keep?”
- FIX-10: Report-freshness was a saved checkbox with no sender.

## Lake Overview content map (FIX-11)

| Field | Source | If missing |
|---|---|---|
| Species selector | Lake species list | Chip stays on All |
| Lures, colors, depth, temperature, time of day, structure | Newest public report | “Not available” |
| Conditions text | That same report | Omitted |
| Source and time | Report `sourceId` and `reportDate` | “Unknown” / “Date unavailable” |
| Tactics | Seasonal editorial bait list for species on the lake | “Not available” plus a link to Tactics |
| Health snapshot | Existing lake fields | Existing empty handling |

Partner still needs to confirm this hierarchy. No irreversible visual system change was made.

## Contour research (FIX-12)

Do not build an onX or bathymetry integration in this release. A later decision needs a licensed provider, written terms, a cost, and a lake-id match rate. The existing contour route stays in the code and is not linked from launch navigation.
