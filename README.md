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

### 3. Interactive Daily Cap Inspector & Timeline Charts
* **Day-by-Day Cap Inspection:** Interactive date selector to evaluate daily cap utilization for any day of the month.
* **Active Daily Activity Bar Chart:** Visual timeline highlighting active spend days, daily cap headroom, and peak spend dates.
* **Exceeded Cap Alerts:** Instant visual indicators when daily or monthly thresholds are breached.

### 4. Multi-Month Cap Comparison & Utilization Report
* **Comparative Metric Strip:** Side-by-side view of total spends, refunds, points accrued, and reward value in INR across past months.
* **Cap Status Highlights:** Identifies which months reached cap (`Cap Reached`), came close (`Near Cap`), or remained underutilized.
* **One-Click Jump:** Direct navigation to inspect historical months in detail.

### 5. AI Template Studio (JSON5) & Prompt Generator
* **One-Click Gemini / ChatGPT Prompt:** Generates a complete prompt tailored to any credit card name with the exact CardCap schema specification.
* **JSON5 Specification:** Supports comments (`//`), unquoted keys, and trailing commas from LLM outputs without syntax errors.
* **Download Schema (.json5):** Export the schema specification file to reference offline or upload to LLMs.
* **Export / Import:** Instantly copy existing cards as JSON5 or paste new AI-generated templates to install them immediately.

### 6. Local-First Offline Storage + Cloud Sync
* Works completely offline out-of-the-box using `localStorage`.
* Seamlessly syncs with Supabase PostgreSQL when credentials (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are provided.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.17 or higher, v20+ recommended)
* `npm` or `pnpm` or `yarn`

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

3. **Set up environment variables (Optional for Cloud Sync):**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase project URL and anon key if you wish to enable cloud sync:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(If omitted, CardCap automatically runs in full offline local storage mode).*

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

## 🤖 Creating Cards with AI (Gemini / ChatGPT)

Adding a new card or updating an existing one takes under 60 seconds:

1. Open CardCap in your browser and click **Card Rules** in the top navigation bar.
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
* **Icons:** [Lucide React](https://lucide.dev/)
* **Date Utilities:** [date-fns](https://date-fns.org/)
* **JSON5 Parsing:** [json5](https://json5.org/)
* **Database & Auth:** [Supabase](https://supabase.com/) (Optional cloud sync)
* **Confetti Animations:** [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 📁 Project Structure

```
ccr/
├── src/
│   ├── app/                    # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   ├── components/             # Reusable UI Components
│   │   ├── CardTemplateEditorModal.tsx  # Full rule editor + AI Studio tab
│   │   ├── DailyCapInspector.tsx        # Daily limit inspector & bar chart
│   │   ├── GenericCardDashboard.tsx     # Dynamic dashboard for any card
│   │   ├── MilestoneCardSection.tsx     # Quarterly/annual loyalty & lounge tracker
│   │   ├── MonthlyReportModal.tsx       # Multi-month comparative cap utilization
│   │   ├── Navbar.tsx                   # Top navigation with quick actions
│   │   ├── QuickTransactionModal.tsx    # Fast transaction entry modal
│   │   ├── RegaliaGoldDashboard.tsx     # Specialized Regalia Gold dashboard
│   │   └── TransactionLedger.tsx        # Transaction history & refund manager
│   ├── data/
│   │   └── defaultTemplates.ts # Default bank card templates (HDFC, Amex, SBI)
│   ├── lib/
│   │   ├── json5CardHelper.ts  # JSON5 schema spec, Gemini prompt generator, parser
│   │   ├── rewardsEngine.ts    # Core reward calculation, capping & milestone engine
│   │   ├── storage.ts          # Local-first repository & Supabase sync
│   │   ├── supabase.ts         # Supabase client initialization
│   │   └── utils.ts            # Formatting helpers (INR currency, points)
│   └── types/
│       └── card.ts             # TypeScript interfaces for rules, caps, milestones
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL schema with RLS policies
├── LICENSE                     # MIT License
├── package.json
└── README.md
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
