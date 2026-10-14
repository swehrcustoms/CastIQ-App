# CastIQ fix changelog

| ID | Status | What changed |
|---|---|---|
| FIX-01 | DONE | `SiteShell` wraps Pricing, Tactics, About, Terms, and Privacy, and it stays on lake pages. Direct loads keep Search, Ice, and More. |
| FIX-02 | DONE | `uniqueReports` collapses reports that share a report id or the same source, time, species, lure, and text. The Reports count uses that list. Regression test in `tests/mvpLaunch.test.ts`. |
| FIX-03 | DONE | The Map tab is removed. CastIQ still opens the map at `/`. |
| FIX-04 | DONE | The extra lake action row is gone. Tabs are Overview, Reports, Surveys & Stocking, Ice, and Water Quality. |
| FIX-05 | DONE | Launch nav is CastIQ, Search, Ice, and More. More contains About, Pricing, and Tactics. Social, Regulations, Border waters, Share a report, Contours, and Live Intelligence stay in the code and are off the launch nav. |
| FIX-06 | DONE | The instructional page is labeled Tactics. `/guides` redirects to `/tactics`. |
| FIX-07 | DONE | Lakes with no `lastReportDate` sort last. Otherwise the newest report date is first, then lake name, then id. A typed name still ranks by name match before date so the lake you typed stays selectable. Tests cover the date order. |
| FIX-08 | DONE | Overview shows seasonal tactics for species recorded on that lake and links to `/tactics`. |
| FIX-09 | DONE | Onboarding heading is exactly “Which alerts would you like?” |
| FIX-10 | PARTIAL | Report freshness is labeled Coming soon and cannot be turned on. No email, push, or scheduler exists in this app. Winterkill and ice preferences can still be saved, with a note that nothing is sent. |
| FIX-11 | PARTIAL | Content map is in `CASTIQ_FIX_AUDIT.md`. Overview now leads with the latest report and tactics. Partner review is still required. |
| FIX-12 | DEFERRED | No contour provider was added. |

## Commands

`tsc --noEmit` passed. `tsx tests/mvpLaunch.test.ts` passed 5 tests (sort, dedupe, and the four prices).
