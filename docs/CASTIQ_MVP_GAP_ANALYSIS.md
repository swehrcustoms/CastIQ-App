# CastIQ MVP gap analysis

| ID | Status | Evidence |
|---|---|---|
| MVP-01 | PARTIAL | Search calls Minnesota DNR LakeFinder and shows county and nearest town. Coverage is whatever that service returns. The app does not claim every Minnesota water is present. |
| MVP-02 | PARTIAL | Overview reads the newest public report and prints missing fields as “Not available”. It does not invent temperatures or catches. |
| MVP-03 | PARTIAL | Species chips and bait plans cover the species already in the app. That is not a signed-off list of every Minnesota species. |
| MVP-04 | PARTIAL | Surveys come from Minnesota DNR lake survey detail when Firestore has none. Stocking lists are not in that feed and stay empty. |
| MVP-05 | PARTIAL | `/ice` lists stored ice reports with thickness, time, and a warning that no report guarantees safe ice. There is no live ice feed. |
| MVP-06 | DONE | `/tactics` is the seasonal bait guide and Overview links to it. |
| MVP-07 | PARTIAL | `/about` states the product purpose. Founder copy is explicitly waiting on the partners. |
| MVP-08 | PARTIAL | Pricing page uses the four approved prices and the supplied bullets. Checkout is off. |

## Keep, hide, defer

Keep the map on the CastIQ home route, search, ice, tactics, surveys, and water quality. Hide Social, Regulations, Border waters, Share a report, Contours, and Live Intelligence from launch navigation. Do not delete those routes.
