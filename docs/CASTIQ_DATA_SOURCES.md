# CastIQ data sources

| Data | Source | What the screen should say |
|---|---|---|
| Lake names, county, town, acreage | Minnesota DNR LakeFinder | Town and county are shown so same-name lakes can be separated. |
| Fishing reports | Firestore `angler_reports` where `isPublic` is true | Source id and report date. Duplicate documents with the same content render once. |
| Gill, trap, and electrofishing surveys | Minnesota DNR lake survey detail, after a name and county match | Survey date and “Minnesota DNR”. Not a current bite report. |
| Stocking and creel | Not in the DNR survey JSON used here | Empty state. Numbers are not filled in. |
| Ice | Firestore ice reports | Thickness, time, and the safety warning. |
| Tactics | Editorial list in `src/data/baitSuggestions.ts` | Labeled as seasonal suggestions, not a report from that lake. |
| Weather and live lure advice | Cloud Functions that are not part of this launch nav | Not linked from the launch navigation. |

Seed or demo text remains visible only when a report’s own source id says so. This release does not delete existing Firestore documents.
