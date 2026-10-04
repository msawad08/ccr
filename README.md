# CardCap — Credit Card Rewards & Milestone Tracker

CardCap is a modern, high-performance web application designed to help credit card enthusiasts track reward points, complex category caps, daily limits, multi-period milestones (monthly, quarterly, and annual), airport lounge access passes, and fee waivers across all Indian and international credit cards.

No reward rules or bank terms are hardcoded — every card, category multiplier, cap hierarchy, and milestone goal is fully configurable and adaptable to bank devaluations via the built-in **AI Template Studio (JSON5)**.

---

## ✨ Features

### 1. Fully Configurable Rewards & Capping Engine
* **No hardcoded bank formulas:** All rules, multipliers, steps, and caps are defined as structured templates.
* **Base Accrual Modes:**
  * **Direct Percentage / Divide:** For cashback cards like SBI Cashback (e.g. 5% on ₹137 = ₹6.85 exact calculation, non-multiples supported).
  * **Floor:** Standard bank tier logic (e.g. `Math.floor(spend / 150) * 4` for HDFC Regalia Gold).
  * **Proportional / Round:** Support for fractional points or rounding to nearest spend step.
* **Capping Target Scope:**
  * **Bonus Only:** Caps only the bonus multiplier points while base points remain uncapped (e.g., HDFC SmartBuy 4X bonus capped at 4,000 RP/month).
  * **Total Points / Cashback:** Caps the entire reward earned in a category (e.g., SBI Cashback 5% online capped at ₹5,000/month).
* **Hierarchical Sub-Cap Nesting:** Supports parent/child cap relationships (e.g. SmartBuy overall 4,000 bonus RP limit with a 3,000 RP sub-cap for vouchers).

### 2. Multi-Period Milestone & Loyalty Benefit Tracker
* **Multiple Evaluation Periods:**
  * **Calendar Month:** e.g., Amex MRCC 4x ₹1,500 swipes (1,000 bonus MR) & ₹20,000 monthly spend (1,000 bonus MR).
  * **Quarterly (Q1 Jan–Mar, Q2 Apr–Jun, Q3 Jul–Sep, Q4 Oct–Dec):**
    * Regalia Gold ₹1.5L spend for ₹1,500 flight/shopping vouchers (Marriott, M&S, etc.).
    * Complimentary Airport Lounge Access: Spend ₹50,000 in a quarter to unlock 2 free domestic lounge passes.
  * **Annual (Calendar Year / Card Anniversary):**
    * Annual Fee Waiver: e.g. ₹4,00,000 spend to waive ₹2,500 renewal fee.
    * High-Spend Vouchers: e.g. ₹5,00,000 spend for ₹5,000 flight voucher, and ₹7,50,000 spend for an additional ₹5,000 flight voucher.
* **Live Airport Lounge Pass Tracker:** Computes unlocked passes and remaining spend required in the current period based on historical transactions.
* **Granular Rule Inclusion/Exclusion:** Milestones allow selective inclusion (e.g., utilities count toward a milestone spend while fuel and wallet transactions are excluded).

### 3. Storage & Sync Options: Local Storage vs. Supabase Cloud Sync
* **Choice of Storage Mode in UI:**
  * **Local Storage (Device-Specific Only):** Fast, zero-setup, full privacy. All data is kept directly in your browser. *(Note: Clearing browser cookies or cache will erase records; does not sync across devices).*
  * **Supabase Cloud / Local Server Sync:** Automatic cloud backup to PostgreSQL protected with **Row Level Security (RLS)**. Access your same cards and live cap meters seamlessly across your phone, tablet, and PC.
* **Built-in Authentication:**
  * Email & Password sign-up and sign-in.
  * Passwordless Magic Link authentication.
  * Google OAuth support.
  * Auto-sync and manual "Sync Now" buttons.
* **Zero UI Credentials Clutter:** Supabase URLs and public keys are configured securely via `.env.local` — no sensitive credentials are typed into browser form fields.

### 4. Excel (XLSX), CSV, and JSON5 Export / Import
* **Microsoft Excel (.xlsx) Export:** One-click export to a multi-sheet spreadsheet containing:
  * **Transactions Sheet:** Formatted ledger with dates, cards, merchants, category rules, base/bonus/total points, and monetary values in INR.
  * **My Cards Sheet:** Wallet inventory with nicknames, issuers, networks, and cycle days.
  * **Summary Sheet:** Net spend volumes, refunds, and overall reward totals.
* **JSON5 Full Backup & Cross-Device Import:** Export your entire database (cards, custom templates, multipliers, caps, transactions) as `.json5` to backup or restore on any other device.
* **Universal CSV Export:** Direct transaction ledger export for Google Sheets or custom financial tools.

### 5. Interactive Daily Cap Inspector & Timeline Charts
* **Day-by-Day Cap Inspection:** Interactive date selector to evaluate daily cap utilization for any day of the month.
* **Active Daily Activity Bar Chart:** Visual timeline highlighting active spend days, daily cap headroom, and peak spend dates.
* **Exceeded Cap Alerts:** Instant visual indicators when daily or monthly thresholds are breached.

### 6. Multi-Month Cap Comparison & Utilization Report
* **Comparative Metric Strip:** Side-by-side view of total spends, refunds, points accrued, and reward value in INR across past months.
* **Cap Status Highlights:** Identifies which months reached cap (`Cap Reached`), came close (`Near Cap`), or remained underutilized.
* **One-Click Jump:** Direct navigation to inspect historical months in detail.

### 7. Community Card Catalog & Publishing Workflow
* **Community-Powered Card Catalog:** Browse and discover credit cards crafted and maintained by the community.
* **1-Click "Add to Wallet":** Instantly clone any published card into your personal wallet with complete reward rules, daily/monthly caps, and loyalty milestones intact.
* **Creator Credits & Authorship:** Published cards prominently display author credits (`Created by ...`), card version, and approval timestamps.
* **Submit for Admin Review:** Standard users can create private cards, test them in their wallet, and submit them for publication.
* **Propose Updates & Bank Devaluations:** When banks devalue a card or alter capping terms, any user can propose updated configurations for administrative verification.

### 8. Admin Panel & Role-Based Governance
* **Default Super Admin:** `msawad08@gmail.com` is configured as the default Super Admin (customizable via `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` in `.env.local`).
* **Role Hierarchy:**
  * **Super Admin:** Appoint or demote administrators, block abusive accounts, and oversee submissions and private feedbacks.
  * **Admin:** Review, approve, or reject card submissions/updates, and directly publish official card templates.
  * **User:** Create custom cards for personal wallet tracking, request catalog publishing, and submit feedbacks.
* **Admin-Exclusive Inbox:** Private portal for inspecting community submissions, viewing feedback reports, and managing team access.

### 9. Dual Feedback System (General App & Card-Specific)
* **General App Feedback:** Report bugs, request UI enhancements, and suggest new functional capabilities.
* **Card-Specific Devaluation Reporting:** Dedicated reporting channel linked directly to specific cards (e.g. reporting revised SmartBuy caps or lounge eligibility rule changes).
* **Strict Admin Confidentiality:** User feedback is stored securely and accessible exclusively to administrators through the Admin Panel.

### 10. Warm Editorial Minimalism & Quiet Luxury UI/UX
* **Aesthetic Philosophy:** Inspired by Japandi functionalism and high-contrast editorial typography, replacing generic multicolored gradients with refined digital craftsmanship.
* **Palette:** Warm obsidian and espresso backdrops (`#0C0A09`, `#141210`) with hairline stone dividers (`border-stone-800/80`).
* **Accents:** Champagne gold (`#C5A880`), alabaster typography (`#EAE4DC`), and muted earth-tone status badges (sage green, warm ochre, and terracotta).
* **Tactile Micro-interactions:** Physics-based active touch responses (`active:scale-[0.98]`) on buttons and wallet cards.
* **Zero Production Debug Clutter:** Suppressed technical logs, credentials, and debug badges in production builds.

### 11. AI Template Studio (JSON5) & Prompt Generator
* **One-Click Gemini / ChatGPT Prompt:** Generates a complete prompt tailored to any credit card name with the exact CardCap schema specification.
* **JSON5 Specification:** Supports comments (`//`), unquoted keys, and trailing commas from LLM outputs without syntax errors.
* **Download Schema (.json5):** Export the schema specification file to reference offline or upload to LLMs.
* **Export / Import:** Instantly copy existing cards as JSON5 or paste new AI-generated templates to install them immediately.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.17 or higher, v20+ recommended)
* [Docker Desktop](https://www.docker.com/) (Optional: only needed for local Supabase Docker testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ccr.git
   cd ccr
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(If you wish to run in Local Storage Mode without Supabase, you can leave `.env.local` empty).*

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🐳 Testing with Local Supabase Docker & Auth

CardCap supports a complete, local offline Supabase stack powered by Docker.

### Method 1: Using Official Supabase CLI (Recommended)

1. **Start the local Docker containers:**
   ```bash
   npx supabase start
   ```
   This automatically downloads and starts PostgreSQL, Supabase Auth (GoTrue), Kong API Gateway, Supabase Studio, and Inbucket.

2. **Copy local credentials to `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Endpoints available:**
   * **App:** [http://localhost:3000](http://localhost:3000)
   * **Supabase Studio (Database Dashboard):** [http://127.0.0.1:54323](http://127.0.0.1:54323)
   * **Inbucket (Email Sandbox to view sign-up & magic link emails):** [http://127.0.0.1:54324](http://127.0.0.1:54324)

4. **Stop local Supabase:**
   ```bash
   npx supabase stop
   ```

### Method 2: Using Docker Compose

You can also run the bundled `docker-compose.yml`:
```bash
docker compose up -d
```
* **PostgreSQL:** Port `54322` (pre-initialized with `supabase/schema.sql`)
* **Inbucket Email Catcher:** [http://localhost:54324](http://localhost:54324)

For detailed information, check the [Local Supabase Docker Guide](supabase/LOCAL_DOCKER_GUIDE.md).

---

## 🤖 Creating Cards with AI (Gemini / ChatGPT)

Adding a new card or updating an existing one takes under 60 seconds:

1. Open CardCap in your browser and click **Catalog** in the top navigation bar, then click **Create Card / AI Studio** (or click **Edit** on any existing catalog card).
2. Navigate to the **AI Studio (JSON5)** tab.
3. Type the card name (e.g. `Axis Atlas`, `Tata Neu Infinity`, or `Infinia Metal`) and click **Copy AI Prompt**.
4. Paste the prompt into [Google Gemini](https://gemini.google.com) or [ChatGPT](https://chatgpt.com).
5. Copy the returned JSON5 configuration block.
6. Paste it into the **Paste & Install JSON5 Template** box in CardCap and click **Validate & Install Card**.
7. The new card will immediately appear with its custom multipliers, caps, and milestone meters!

---

## 💳 Pre-Configured Default Cards

* **HDFC Regalia Gold:**
  * 4 RP per ₹150 base spend.
  * 5X SmartBuy flights & hotels (capped at 4,000 bonus RP/month).
  * SmartBuy vouchers (sub-capped at 3,000 bonus RP/month).
  * 5X Partners: Myntra, Nykaa, Reliance, Marks & Spencer (dedicated 5,000 bonus RP/month cap).
  * Essential Category Hard Caps: Grocery (2,000 RP), Utilities (2,000 RP), Insurance (2,000 RP monthly / 2,000 RP daily).
  * Quarterly ₹1,500 voucher on ₹1.5L spends & 2 complimentary airport lounge passes on ₹50k spends.
  * Annual fee waiver on ₹4L spends; ₹5L and ₹7.5L flight milestone vouchers.
* **Amex Membership Rewards Credit Card (MRCC):**
  * 1 MR point per ₹50 base spend.
  * 1,000 bonus MR points on 4 transactions of ₹1,500+.
  * 1,000 bonus MR points on ₹20,000 monthly spend.
  * Granular exclusion rules for non-rewarding categories.
* **SBI Cashback Credit Card:**
  * 5% exact direct cashback on online merchants (capped at ₹5,000 total per monthly cycle).
  * 1% unlimited cashback on offline retail.
  * Direct percentage divide calculation (exact calculation on non-multiples of ₹100).
  * Annual fee waiver on ₹2,00,000 spends.

---

## 🛠 Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **UI Library:** [React 19](https://react.dev/)
* **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
* **Spreadsheet & Data Export:** [SheetJS (xlsx)](https://docs.sheetjs.com/)
* **JSON5 Parsing:** [json5](https://json5.org/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Date Utilities:** [date-fns](https://date-fns.org/)
* **Database & Auth:** [Supabase](https://supabase.com/) (Cloud or Local Docker)
* **Confetti Animations:** [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 📁 Project Structure

```
ccr/
├── docker-compose.yml          # Standalone Docker Compose stack for local testing
├── src/
│   ├── app/                    # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   ├── components/             # Reusable UI Components
│   │   ├── AdminPanelModal.tsx          # Super admin user management, card approvals & feedback
│   │   ├── CardSelector.tsx             # Card carousel and wallet selector
│   │   ├── CardTemplateEditorModal.tsx  # Full rule editor + AI Studio tab + publish workflow
│   │   ├── CommunityCatalogModal.tsx    # Browse community cards, 1-click install & update requests
│   │   ├── DailyCapInspector.tsx        # Daily limit inspector & bar chart
│   │   ├── FeedbackModal.tsx            # App feedback & card-specific devaluation reporting
│   │   ├── GenericCardDashboard.tsx     # Dynamic dashboard for any card
│   │   ├── MilestoneCardSection.tsx     # Quarterly/annual loyalty & lounge tracker
│   │   ├── MonthlyReportModal.tsx       # Multi-month comparative cap utilization
│   │   ├── Navbar.tsx                   # Top navigation with quiet luxury theme & admin badges
│   │   ├── PeriodSelector.tsx           # Billing cycle & calendar month picker
│   │   ├── RegaliaGoldDashboard.tsx     # Specialized Regalia Gold dashboard
│   │   ├── SettingsModal.tsx            # Storage switcher, Auth & Excel/JSON5 export
│   │   ├── TransactionEntryModal.tsx    # Transaction entry with live calculation
│   │   ├── TransactionLedger.tsx        # Transaction history & refund manager
│   │   └── UserCardSettingsModal.tsx    # Card nickname & billing cycle configuration
│   ├── data/
│   │   └── defaultTemplates.ts # Default bank card templates (HDFC, Amex, SBI)
│   ├── lib/
│   │   ├── adminAuth.ts        # Super admin verification, roles & user blocking
│   │   ├── communityCatalog.ts # Catalog submissions, approval workflows & feedback store
│   │   ├── exportImportHelper.ts # Excel (.xlsx), CSV, and JSON5 export/import
│   │   ├── json5CardHelper.ts  # JSON5 schema spec, Gemini prompt generator, parser
│   │   ├── rewardsEngine.ts    # Core reward calculation, capping & milestone engine
│   │   ├── storage.ts          # Local-first repository & Supabase sync
│   │   ├── supabaseClient.ts   # Supabase client, auth methods, and mode management
│   │   └── utils.ts            # Formatting helpers (INR currency, points)
│   └── types/
│       ├── admin.ts            # AppUser, CardSubmission, and FeedbackItem types
│       └── card.ts             # TypeScript interfaces for rules, caps, milestones
├── supabase/
│   ├── LOCAL_DOCKER_GUIDE.md   # Step-by-step local Supabase Docker testing guide
│   ├── config.toml             # Supabase CLI local configuration
│   ├── migrations/             # Database migrations (RLS, roles, catalog, feedback)
│   └── schema.sql              # Supabase PostgreSQL schema with RLS policies
├── LICENSE                     # MIT License
├── package.json
└── README.md
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
