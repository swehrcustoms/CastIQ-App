# CastIQ mobile design — paste into Claude Design

How to use this file:

1. Open Claude on the web. In the message box choose Output, then Design. Or open claude.ai/design, start a new Prototype, and set fidelity to High fidelity.
2. Set the canvas to a phone, portrait, about 390 by 844. This is the existing CastIQ website on a phone, not a new native app and not a desktop layout squeezed down.
3. Paste the prompt below. Do not attach competitor screenshots. Do not ask it to invent lakes, reports, ice thickness, or a checkout.

---

## Prompt

Design a high-fidelity, clickable mobile-web prototype of CastIQ, a Minnesota lake fishing app. Build it as one phone-sized site, portrait only, with a persistent header and a bottom tab bar. Every control is at least 44 pixels tall. Respect the top safe area and leave room for the bottom bar. No hover-only actions. No desktop sidebar.

This is the current product, laid out for a phone. Do not redesign the brand, rename screens, add a map-first home, or invent features.

### Brand

- Background: #0c1f3d
- Cards and inputs: #1a3a5c, 12 pixel radius, 1 pixel border at white 8%
- Primary button: #06b6d4 background, #0c1f3d text, semibold, full width on phones
- Secondary button: #0c1f3d fill, white text, thin white border
- Body text: #f8fafc
- Muted text: #94a3b8
- Danger and strikethrough prices: #ef4444
- Font: Inter, or the system sans if Inter is unavailable
- Wordmark: “CastIQ”, teal, top left. It goes to Search.

### Chrome on every signed-in screen

Header: CastIQ at the left. Profile at the right. No Sign in button in the header.

Bottom bar, four items, labels under icons: Search, Ice, Social, More. Search is the default selected tab. More opens a sheet. It is not a fifth page with its own content.

More sheet, top to bottom: About, Border, Pricing, Regulations, Tactics, Share a Report. Tapping one closes the sheet and opens that screen. The bottom bar stays visible.

### Screen 1 — Search

Title area is a search field: “Search lakes, counties, or species”.

Under it, a horizontal scrolling chip row. Chips in this order: All, Walleye, Bass, Pike, Panfish, Muskie, Trout, Crappie, Perch. All is selected and filled teal. The others are outlined.

Status line in muted text: “Newest reports first”.

Three result cards. Each card is the lake name, county, a one-line species list, and a recency line. Use only these examples:

- Lake Minnetonka, Hennepin County. Largemouth bass, northern pike, walleye, muskie, crappie. “No reports this week · 1mo ago”.
- Lake of the Woods, Lake of the Woods County. Walleye, muskie, northern pike. “No reports this week · 1mo ago”.
- Mille Lacs Lake, Mille Lacs County. “No reports this week”.

Tapping Minnetonka opens Screen 2. Do not add ratings, bite scores, catch odds, or “hot” badges.

### Screen 2 — Lake Minnetonka

Back is the header wordmark, which returns to Search.

Title: Lake Minnetonka. Subtitle: Hennepin County.

A Favorite button on the right of the title. Default label “Favorite”. Tapping it toggles to “Unfavorite”.

Green species pills, only species on this lake: Largemouth Bass, Northern Pike, Walleye, Muskie, Crappie. Do not show Trout here.

Then the same chip row, filtered to this lake: All, Walleye, Bass, Pike, Muskie, Crappie. All is selected. Tapping a chip filters the card below. If a chip is not in the list, it is absent.

One report card:

- Title: Largemouth Bass, Northern Pike
- “Latest report · Aug 21, 2026”
- Note: a short angler note, not a prediction
- Fields that were actually reported: Water temperature 68°F, Structure weedline, Target depth 8 ft, Time of day morning, Tactic Casting, Lures spinnerbait and wacky senko, Colors white and green pumpkin
- Source line: “Angler report”

Empty species state, if Trout is not a chip: do not invent a trout report. Missing fields say “Not reported”, never 0.

A small AIS or source note can sit under the title. Do not add contours, a live bite engine, or stocking charts on this screen.

### Screen 3 — Ice

Header and bottom bar stay.

Warning banner, full width, not behind any plan:

“Reported ice thickness is informational only. Ice conditions vary across a lake and can change rapidly. No report guarantees safe ice. Verify conditions locally before travel.”

If the viewer is signed in, show a form: lake search, total inches, optional “Where you measured it”, and a submit button. Do not prefill a thickness.

Empty list under the form: “Ice reports show up here as soon as one is saved.” Do not draw a thickness, a map of ice roads, or a “safe to walk” label.

### Screen 4 — Social

Public report cards only. Same dark cards as the lake report. Show lake name, species, date, and the reported lure, depth, and condition when those fields exist. This is not a photo feed and not a comment thread.

### Screen 5 — Pricing

Reach it from More, then Pricing.

Eyebrow: PLANS. Headline: “Find out what's biting.” Intro: “Get fishing reports for Minnesota lakes, discover what's working for your target species, and spend less time searching for information and more time fishing.”

A two-part control: Monthly and Annual. Monthly starts selected. Both are real buttons.

Cards stack vertically on the phone. Order: Free, Standard, Premium.

Free: “$0”. Copy: “Search lakes, read public report dates, and open ice safety guidance.” Bullets: Lake and species search; Dated public report previews; Ice safety guidance and official source links. Line: “No renewal”. Note: “Included while billing is closed. Proposed full-report limits are off.” No purchase button.

Standard, Monthly selected: “$4.99/month” in teal. Subtitle: “Everything you need to plan your next fishing trip.” Bullets: Lake-specific and species-specific fishing reports; Reported depths, lures, and techniques; Water conditions and bottom structure, where available; Seasonal ice reports, where available; Easy lake and species search. Small white line: “Annual plan: $59.88”. Button: “Coming soon”.

Premium, Monthly selected: “$8.99/month” in teal, with a teal ring on the card. Subtitle: “Get more insights before you hit the water.” Line: “Everything in Standard, plus:”. Bullets: Alerts for new reports on your favorite lakes; Extended fishing report history; Advanced lake and species filters; Compare conditions across lakes; Personalized saved-lake dashboard; Historical fishing trends where data is available. Small white line: “Annual plan: $107.88”. Button: “Coming soon”.

Annual selected, same cards, Free unchanged:

- Standard top price “$39.99/year” in teal. Under it, “$4.99/month” in red with a red strikethrough. Then “$3.33/month” in white. Caption: “Annual plan broken down by month. Save $19.89 versus 12 monthly payments.” Bottom line: “Annual plan: $39.99/year”.
- Premium top price “$69.99/year”. Struck “$8.99/month” in red. Then “$5.83/month”. Caption includes “Save $37.89 versus 12 monthly payments.” Bottom line: “Annual plan: $69.99/year”.

Tapping Coming soon shows a status line: “Coming soon. CastIQ is not charging for Standard or Premium yet.” Do not open a card form, Apple Pay, or Stripe.

Under the cards, a comparison titled “What each plan can open.” Caption: “Monthly and annual copies of a plan open the same features. The number limits below are proposed and are not turned on.” Columns: Access, Free, Standard, Premium. Rows: Lake search Yes/Yes/Yes; Report dates and sources Yes/Yes/Yes; Full report detail “Proposed: 3 / 30 days”, “Eligible reports”, “Retained reports”; Saved lakes “Proposed: 2”, “Proposed: 10”, “Unlimited”; Ice safety Always/Always/Always; Compare lakes and trends No/No/“When the data supports it”.

Footer disclaimer: “Conditions and report details vary by lake, species, source, and reporting availability. Always verify current conditions before heading out, especially when ice fishing.”

### Screen 6 — Profile

From the header Profile link.

Signed out: title Profile. Subtitle “Sign in to update your name, saved lakes, and notification choices.” One primary button, Sign in, which opens Screen 7.

Signed in: name “Steven”, email, line “Current plan: Free”, and “CastIQ is not charging. Report detail and saved lakes are not limited until enforcement is approved.”

Section “Favorite lakes”. One row: Lake Minnetonka, with Unfavorite. Empty copy, if none: “No favorite lakes yet.” and “Open a lake from Search and choose Favorite.”

Section “Alert preferences”. Heading style matches “Which alerts would you like?” Explain that a freshness alert would only be for a saved lake when a new public report is saved, and that CastIQ does not send alerts yet. Three toggles, all on: Report freshness, Winterkill, Ice reports. Do not show a sent-mail inbox.

Link: Sign out.

### Screen 7 — Sign in

CastIQ wordmark. “Welcome back.” “Lake intelligence for Minnesota anglers and guides.” Email, password, Sign in, “Continue with Google”, “Forgot password?”, “New here? Create an account”. Footer links: About, Tactics, Pricing. No bottom tab on this screen.

### Screen 8 — Regulations

From More. Title Regulations. Short note that these are Minnesota inland rules for 2026 and to confirm them with the DNR before keeping fish.

Search field: “Search a lake for its special regulations…”

Before a lake is chosen, show statewide inland examples, clearly labeled as statewide, not as one lake’s special rule. Example card: Walleye and sauger, season May 9, 2026 – Feb. 28, 2027, limit “6 combined, including saugeye”, size “Only 1 walleye over 20 inches. No statewide minimum.”

Tapping a result “Mille Lacs Lake · Near Garrison · Mille Lacs County” replaces the top of the page with that lake’s special regulations and keeps statewide rules underneath, labeled “Statewide inland rules for Mille Lacs Lake”. Do not show another lake’s rules under Mille Lacs.

### Screen 9 — Tactics, About, Border, Share a Report

These open from More. Keep them short.

- Tactics: seasonal guidance for the angler, labeled as a general plan, not as a report from a specific lake.
- About: what CastIQ is. Do not invent a founder biography.
- Border: border waters use their own rules, not the inland booklet.
- Share a Report: a form for a signed-in angler to log a real observation. Fields include lake, species, lure, depth, water temperature, structure, time of day. Submit does not invent a result. If signed out, ask them to sign in first.

### Interactions that must work

- Bottom tabs switch Search, Ice, and Social.
- More opens and closes the sheet and navigates to Pricing, Regulations, Tactics, About, Border, and Share a Report.
- Search result opens Lake Minnetonka. Favorite toggles.
- Lake chips filter that lake only.
- Pricing Monthly and Annual swap the prices exactly as written, including the red strikethrough only on Annual.
- Coming soon shows the not-charging message.
- Profile signed-out Sign in opens the sign-in screen.
- Regulations search selects Mille Lacs and shows that lake’s specials plus statewide rules.

### Do not add

A sixth plan, a free trial, coupons, a “best lake” score, live bite predictions, onX maps, made-up contour lines, a safe-ice badge, fake report counts, or a working payment. Do not put the ice warning or the DNR attribution behind a lock.
