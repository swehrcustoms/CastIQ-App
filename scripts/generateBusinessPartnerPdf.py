#!/usr/bin/env python3
"""Generate docs/CastIQ-Business-Partner-Tech-Overview.pdf"""

from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parents[1] / "docs" / "CastIQ-Business-Partner-Tech-Overview.pdf"


class Doc(FPDF):
    def header(self) -> None:
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 116, 139)
        self.cell(0, 8, "CastIQ - Business Partner Tech Overview", align="L")
        self.set_x(self.l_margin)
        self.cell(0, 8, f"Page {self.page_no()}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(6, 182, 212)
        self.set_line_width(0.4)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(
            0,
            10,
            "Confidential - share credentials via password manager only, never in email/Slack/GitHub",
            align="C",
        )

    def h2(self, text: str) -> None:
        self.ln(4)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(26, 58, 92)
        self.multi_cell(0, 7, text)
        self.set_draw_color(6, 182, 212)
        self.set_line_width(0.5)
        y = self.get_y()
        self.line(self.l_margin, y, self.l_margin + 40, y)
        self.ln(3)

    def h3(self, text: str) -> None:
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(26, 58, 92)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def body(self, text: str) -> None:
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def bullet(self, text: str, indent: float = 0) -> None:
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 41, 59)
        x = self.l_margin + indent
        self.set_x(x)
        width = self.w - self.r_margin - x - 5
        self.cell(5, 5.5, "-")
        self.multi_cell(width, 5.5, text)

    def kv(self, key: str, value: str) -> None:
        key_w = 48
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(12, 31, 61)
        y = self.get_y()
        self.cell(key_w, 5.5, key)
        self.set_xy(self.l_margin + key_w, y)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(self.w - self.r_margin - self.l_margin - key_w, 5.5, value)

    def code(self, text: str) -> None:
        self.set_fill_color(241, 245, 249)
        self.set_font("Courier", "", 8.5)
        self.set_text_color(15, 23, 42)
        self.multi_cell(0, 5, text, fill=True)
        self.ln(2)
        self.set_font("Helvetica", "", 10)

    def table(self, headers: list[str], rows: list[list[str]], col_widths: list[float]) -> None:
        def draw_header() -> None:
            self.set_fill_color(12, 31, 61)
            self.set_text_color(248, 250, 252)
            self.set_font("Helvetica", "B", 9)
            for i, h in enumerate(headers):
                self.cell(col_widths[i], 7, h, border=0, fill=True)
            self.ln()
            self.set_font("Helvetica", "", 9)

        draw_header()
        fill = False
        for row in rows:
            line_heights = []
            for i, cell in enumerate(row):
                lines = self.multi_cell(col_widths[i], 5, str(cell), dry_run=True, output="LINES")
                line_heights.append(max(len(lines), 1) * 5)
            row_h = max(line_heights)
            if self.get_y() + row_h > self.h - 22:
                self.add_page()
                draw_header()
            if fill:
                self.set_fill_color(241, 245, 249)
            else:
                self.set_fill_color(255, 255, 255)
            self.set_text_color(30, 41, 59)
            x0, y0 = self.get_x(), self.get_y()
            for i, cell in enumerate(row):
                self.set_xy(x0 + sum(col_widths[:i]), y0)
                self.rect(x0 + sum(col_widths[:i]), y0, col_widths[i], row_h, style="F")
                self.multi_cell(col_widths[i], 5, str(cell))
            self.set_y(y0 + row_h)
            fill = not fill
        self.ln(2)


def main() -> None:
    pdf = Doc(orientation="P", unit="mm", format="Letter")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(16, 16, 16)
    pdf.add_page()

    # Cover band
    pdf.set_fill_color(12, 31, 61)
    pdf.rect(0, 0, 220, 52, style="F")
    pdf.set_xy(16, 16)
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 12, "CastIQ", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(248, 250, 252)
    pdf.cell(0, 8, "Business Partner Tech Overview", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(
        0,
        6,
        "Where everything lives  |  What to change  |  Where credentials go",
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.set_y(58)

    usable = pdf.w - pdf.l_margin - pdf.r_margin

    pdf.h2("Product snapshot")
    pdf.kv("Product", "Minnesota lake intelligence platform")
    pdf.kv("Repository", "github.com/swehrcustoms/CastIQ-App")
    pdf.kv("Firebase project", "castiq-app")
    pdf.kv(
        "Stack",
        "Vite + React + TypeScript · Firebase · Mapbox · Anthropic Claude · Tomorrow.io",
    )

    pdf.h2("1. Big picture")
    pdf.code(
        "User (browser / phone)\n"
        "    |\n"
        "Firebase Hosting  <--  built from Vite app (src/)\n"
        "    |\n"
        "Firebase Auth + Firestore + Storage\n"
        "    |\n"
        "Cloud Functions (functions/)  <--  AI, weather, DNR ingestion, guide portal\n"
        "    |\n"
        "External APIs: Anthropic, Tomorrow.io, Mapbox, MN DNR feeds"
    )

    pdf.h2("2. Frontend app (what users see)")
    pdf.body("Change UI and product screens under src/. Routes are defined in src/App.tsx.")
    pdf.table(
        ["What", "Where to change it"],
        [
            ["Routes / screens", "src/App.tsx"],
            ["Pages (Map, Search, Lake, Login, Guide, Reports, Regs)", "src/pages/"],
            ["UI components", "src/components/"],
            ["Auth / Firebase / Firestore helpers", "src/services/"],
            ["Data hooks", "src/hooks/"],
            ["TypeScript data models", "src/types/"],
            ["Brand colors", "tailwind.config.cjs"],
            ["App entry + styles", "src/main.tsx, src/index.css"],
        ],
        col_widths=[usable * 0.48, usable * 0.52],
    )

    pdf.h3("Screens today")
    pdf.table(
        ["Route", "Page", "Purpose"],
        [
            ["/login", "Login", "Email/password signup & sign-in"],
            ["/", "MapHome", "Map of lakes"],
            ["/search", "LakeSearch", "Find lakes"],
            ["/lake/:id", "LakeDetail", "Lake overview + reports"],
            ["/lake/:id/live", "AILiveEngine", "Live AI fishing intel"],
            ["/regulations", "Regulations", "Fishing regulations"],
            ["/submit-report", "SubmitReport", "Angler reports"],
            ["/guide", "GuidePortal", "Guide business portal"],
        ],
        col_widths=[usable * 0.28, usable * 0.28, usable * 0.44],
    )
    pdf.body("Coming-soon placeholders: fisheries, contours, border waters, ice mode.")

    pdf.h2("3. Backend (Cloud Functions)")
    pdf.table(
        ["Area", "Folder", "What it does"],
        [
            ["Function exports", "functions/src/index.ts", "Master list of deployed functions"],
            ["Scheduled ingestion", "functions/src/ingestion/", "RSS, DNR lakes, water quality, ice"],
            ["Data APIs", "functions/src/services/", "Lakes, geo search, surveys, regs, reports"],
            ["AI", "functions/src/ai/", "Claude summarization, live intel, winterkill"],
            ["Guide / contours / structures", "functions/src/v12/", "Guide portal, contours, similar lakes, sonar"],
            ["Notifications", "functions/src/background/", "Alert dispatch"],
            ["Claude client", "functions/src/utils/anthropicClient.ts", "Anthropic API wiring"],
        ],
        col_widths=[usable * 0.28, usable * 0.34, usable * 0.38],
    )
    pdf.body("Functions region: us-central1")

    pdf.h2("4. Database (Firestore)")
    pdf.body("Collection names are defined in src/services/firestore.ts.")
    pdf.table(
        ["Collection", "Contents"],
        [
            ["lakes", "Lake records"],
            ["angler_reports", "User fishing reports"],
            ["species_registry, lures_colors", "Species & lure data"],
            ["regulations, statewide_defaults, regulation_alerts, border_waters", "Rules"],
            ["netting_surveys, electrofishing_surveys, creel_surveys, water_quality", "Surveys / science"],
            ["stocking_events, winterkill_events, aeration_events", "Events"],
            ["users, guide_portal_users", "Accounts & guides"],
            ["weather_cache, live_intelligence_cache, similar_lakes", "Cached AI/weather"],
            ["ice_reports, ice_roads", "Ice fishing"],
            ["lake_contour_metadata, lake_structures, contour_update_log", "Contours / structures"],
        ],
        col_widths=[usable * 0.55, usable * 0.45],
    )
    pdf.bullet("Security rules: firestore.rules")
    pdf.bullet("Indexes: firestore.indexes.json")
    pdf.bullet("File uploads: Firebase Storage rules in storage.rules")

    pdf.h2("5. Scripts & seed data")
    pdf.table(
        ["Script", "Command", "Purpose"],
        [
            ["Seed lakes/species/regs/reports", "npm run seed:all", "Load starter data"],
            ["Create guide account", "npm run create:guide -- --email ...", "Provision guide user"],
            ["Ingest DNR data", "npm run ingest:dnr", "Pull DNR lake data"],
        ],
        col_widths=[usable * 0.36, usable * 0.36, usable * 0.28],
    )
    pdf.body("Scripts live in scripts/.")

    pdf.h2("6. Deploy & hosting")
    pdf.table(
        ["Action", "Command / place"],
        [
            ["Local app", "npm run dev"],
            ["Deploy website", "npm run deploy:hosting"],
            ["Deploy functions", "npm run deploy:functions"],
            ["Rules / indexes / storage", "firebase deploy --only firestore:rules,firestore:indexes,storage"],
            ["Firebase project pointer", ".firebaserc -> castiq-app"],
            ["Hosting / emulator config", "firebase.json"],
        ],
        col_widths=[usable * 0.38, usable * 0.62],
    )
    pdf.body("Typical live URLs (confirm in Firebase Console -> Hosting):")
    pdf.bullet("https://castiq-app.web.app")
    pdf.bullet("https://castiq-app.firebaseapp.com")

    pdf.h2("7. Accounts, logins & secrets")
    pdf.body(
        "Real passwords and API keys are NOT stored in this repository (by design). "
        "They live in vendor dashboards or Firebase Secrets. Share this PDF freely; "
        "share actual secrets only via a password manager - never in GitHub, email, or Slack."
    )

    pdf.h3("App user logins (Firebase Auth)")
    pdf.table(
        ["Item", "Details"],
        [
            ["How users log in", "Email + password on /login"],
            ["Where accounts live", "Firebase Console -> castiq-app -> Authentication"],
            ["Who can create accounts", "Anyone via signup in the app"],
            ["Guide accounts", "Created with npm run create:guide (sets role: guide)"],
            ["README example (template only)", "guide@example.com / TempPass123! - only if that script was run"],
            ["Script default if password omitted", "CastIQ-Guide-ChangeMe1 (change immediately)"],
            ["Password reset", "Forgot password on login -> Firebase email reset"],
        ],
        col_widths=[usable * 0.38, usable * 0.62],
    )
    pdf.body(
        "There is no shared master app username/password in the codebase. "
        "Each person has their own Firebase Auth user."
    )

    pdf.h3("External software / API access")
    pdf.table(
        ["Service", "Used for", "Where credentials live", "Login"],
        [
            ["GitHub", "Source code", "Repo access for swehrcustoms/CastIQ-App", "github.com"],
            ["Firebase / Google Cloud", "Auth, DB, hosting, functions", "Console project castiq-app", "console.firebase.google.com"],
            ["Mapbox", "Lake map", "VITE_MAPBOX_ACCESS_TOKEN in .env / build secrets", "account.mapbox.com"],
            ["Anthropic (Claude)", "AI fishing intel", "Firebase Secret ANTHROPIC_API_KEY (server only)", "console.anthropic.com"],
            ["Tomorrow.io", "Weather", "Firebase Secret TOMORROW_IO_API_KEY", "Tomorrow.io dashboard"],
            ["Fishbrain / Navionics", "Optional partners", "Partner API keys in env (if enabled)", "Partner portals"],
            ["Firebase Admin (local seeds)", "Running seed scripts", "serviceAccountKey.json (never commit)", "Firebase -> Service accounts"],
        ],
        col_widths=[usable * 0.20, usable * 0.20, usable * 0.35, usable * 0.25],
    )

    pdf.body("Frontend env template: .env.example -> copy to .env (gitignored).")
    pdf.body("Set Cloud Function secrets with:")
    pdf.code(
        "firebase functions:secrets:set ANTHROPIC_API_KEY\n"
        "firebase functions:secrets:set TOMORROW_IO_API_KEY"
    )

    pdf.h2('8. "I need to change X - where do I go?"')
    pdf.table(
        ["Goal", "Go here"],
        [
            ["Change UI / screens", "src/pages/ + src/components/"],
            ["Change colors / look", "tailwind.config.cjs"],
            ["Change login flow", "src/pages/Login.tsx, src/services/auth.ts"],
            ["Change map", "src/components/map/MapView.tsx + Mapbox token"],
            ["Change AI behavior", "functions/src/ai/ + Anthropic key"],
            ["Change weather", "functions/ weather/cache paths + Tomorrow.io key"],
            ["Add/edit lake data", "Firestore lakes or scripts/seedLakes.ts"],
            ["Change who can read/write data", "firestore.rules"],
            ["Add a guide business", "npm run create:guide + Firebase Auth"],
            ["Deploy a new website build", "npm run deploy:hosting"],
            ["Deploy backend logic", "npm run deploy:functions"],
            ["Invite a business partner to code", "GitHub repo settings -> Collaborators"],
            ["Invite to Firebase / keys", "Firebase Console -> Users & permissions"],
        ],
        col_widths=[usable * 0.42, usable * 0.58],
    )

    pdf.h2("9. Credentials checklist for the partner")
    pdf.body("Hand these off outside this document (password manager):")
    for i, item in enumerate(
        [
            "GitHub invite (or org access) to CastIQ-App",
            "Firebase / Google Cloud access to project castiq-app",
            "Mapbox account (or token)",
            "Anthropic API key (Firebase secret, not frontend)",
            "Tomorrow.io API key (Firebase secret)",
            "Any seeded test accounts (email/password) that were actually created",
            "Optional: service account JSON for local seeding (keep offline)",
        ],
        1,
    ):
        pdf.bullet(f"{i}. {item}")

    pdf.ln(6)
    pdf.set_fill_color(241, 245, 249)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(71, 85, 105)
    pdf.multi_cell(
        0,
        5,
        "This overview matches the CastIQ-App repository layout. Secrets are intentionally omitted. "
        "For the latest code and deploy steps, see README.md in the repo.",
        fill=True,
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
