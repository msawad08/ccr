# Rewards & Milestone Tracker Web App Specification

## 1. System Architecture & Tech Stack

This project is planned as a serverless single-page/client-first application built with **Next.js (App Router)** or **React (Vite)**, utilizing **Supabase** directly via client SDK (`@supabase/supabase-js`) for identity, persistence, and data privacy. A dedicated custom backend server is unnecessary; all data operations, user associations, and access controls are handled via Supabase Auth and PostgreSQL Row Level Security (RLS).

```
+-------------------------------------------------------------+
|             Client Layer: Next.js / React (Vite)            |
| - React Hook Form + Zod (Validation & Quick Add)            |
| - TanStack Query / SWR (State & Caching)                    |
| - Tailwind CSS + shadcn/ui (UI Components & Progress Bars)  |
| - Client-side Cap & Threshold Simulation Engine             |
+-------------------------------------------------------------+
                              |
                     HTTPS / Supabase Client
                              |
+-------------------------------------------------------------+
|                BaaS Layer: Supabase (Free Tier)             |
| - Google OAuth Provider (User-isolated tenant context)      |
| - PostgreSQL with Row Level Security (auth.uid() = user_id) |
| - PostgreSQL Views / Functions for ledger aggregation       |
+-------------------------------------------------------------+

```

---

## 2. Multi-Card Scope & Extensibility

The system decouples generic spend entries from card-specific rule engines. The initial release supports two cards with distinct reward mechanisms:

### HDFC Regalia Gold

* **Base Accrual:** 5 RP per ₹200 spent on eligible retail categories.
* **SmartBuy Acceleration:**
* Instant/Brand Vouchers (GyFTR/Woohoo): 5X (1X base + 4X bonus). Bonus capped at **3,000 RP per calendar month**.
* Flights: 5X (1X base + 4X bonus). Bonus capped within the shared SmartBuy limit.
* Hotels: 10X (1X base + 9X bonus). Bonus capped within the shared SmartBuy limit.
* Trains / Other: 3X (1X base + 2X bonus).
* **Overall SmartBuy Cap:** 4,000 bonus RP per calendar month; 2,000 bonus RP per calendar day.


* **5X Partner Brands (Myntra, Nykaa, Reliance Digital, Marks & Spencer):** 5X (1X base + 4X bonus). Dedicated bonus cap of **5,000 RP per calendar month**.
* **Essential Category Hard Caps:**
* Grocery: 2,000 RP / calendar month.
* Utilities & Telecom: 2,000 RP / calendar month.
* Education: 2,000 RP / calendar month.
* Insurance: 2,000 RP / day and 2,000 RP / calendar month.


* **Exclusions (0 RP):** Fuel, Wallet loads, Rent, Government transactions.
* **Statement Ceiling:** Max 50,000 RP accrued per statement cycle.

### American Express Membership Rewards Credit Card (MRCC)

* **Base Accrual:** 1 MR point per ₹50 spent (excluding fuel, utilities, insurance, cash transactions).
* **Monthly Milestones:**
* **4x ₹1,500 Transactions:** 1,000 bonus MR points per calendar month upon completing at least 4 individual settled transactions of ₹1,500 or more.
* **₹20,000 Total Monthly Spend:** 1,000 bonus MR points per calendar month on crossing ₹20,000 in eligible cumulative spends.
* *Note:* Fuel and utility transactions, while ineligible for base point accrual, count toward the spend thresholds for these monthly milestones.



---

## 3. Database Schema & Row Level Security

All data rows are strictly partitioned per user using PostgreSQL RLS policies tied to Supabase Google Auth.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Supported Cards
create table cards (
  id text primary key, -- 'regalia_gold', 'amex_mrcc'
  name text not null,
  issuer text not null,
  currency text default 'INR'
);

insert into cards (id, name, issuer) values
  ('regalia_gold', 'HDFC Regalia Gold', 'HDFC Bank'),
  ('amex_mrcc', 'Amex Membership Rewards Credit Card', 'American Express');

-- 2. User Cards (Which cards a user holds)
create table user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id text references cards(id) not null,
  nickname text,
  billing_cycle_day integer check (billing_cycle_day between 1 and 31),
  created_at timestamptz default now(),
  unique(user_id, card_id)
);

alter table user_cards enable row level security;
create policy "Users can manage their own cards" 
  on user_cards for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- 3. Spend Categories & Multiplier Definitions
create table reward_rules (
  id text primary key,
  card_id text references cards(id) not null,
  category_name text not null,
  base_rate_points numeric not null,      -- e.g., 5 points
  base_rate_spend numeric not null,       -- per 200 spend
  bonus_multiplier numeric default 0,     -- e.g., 4 (for 5X)
  daily_bonus_cap integer,               -- e.g., 2000
  monthly_bonus_cap integer,             -- e.g., 3000, 4000, 5000
  cap_group text,                        -- 'smartbuy', 'smartbuy_voucher', 'partner_5x', 'grocery', etc.
  tracks_by text default 'posting_date'  -- 'posting_date' or 'transaction_date'
);

-- Seed Regalia Gold Rules
insert into reward_rules (id, card_id, category_name, base_rate_points, base_rate_spend, bonus_multiplier, daily_bonus_cap, monthly_bonus_cap, cap_group) values
  ('rg_retail_1x', 'regalia_gold', 'Standard Retail (1X)', 5, 200, 0, null, null, 'general'),
  ('rg_sb_voucher', 'regalia_gold', 'SmartBuy Vouchers (5X)', 5, 200, 4, 2000, 3000, 'smartbuy_voucher'),
  ('rg_sb_flight', 'regalia_gold', 'SmartBuy Flights (5X)', 5, 200, 4, 2000, 4000, 'smartbuy'),
  ('rg_sb_hotel', 'regalia_gold', 'SmartBuy Hotels (10X)', 5, 200, 9, 2000, 4000, 'smartbuy'),
  ('rg_sb_train', 'regalia_gold', 'SmartBuy Trains/Other (3X)', 5, 200, 2, 2000, 4000, 'smartbuy'),
  ('rg_partner_5x', 'regalia_gold', '5X Partner Brands (Myntra/Nykaa/Reliance/M&S)', 5, 200, 4, null, 5000, 'partner_5x'),
  ('rg_grocery', 'regalia_gold', 'Grocery (Capped)', 5, 200, 0, null, 2000, 'grocery'),
  ('rg_utility', 'regalia_gold', 'Utilities (Capped)', 5, 200, 0, null, 2000, 'utility'),
  ('rg_exempt_0x', 'regalia_gold', 'Exempt / Fuel / Rent / Gov (0X)', 0, 200, 0, 0, 0, 'exempt');

-- Seed Amex MRCC Rules
insert into reward_rules (id, card_id, category_name, base_rate_points, base_rate_spend, bonus_multiplier, daily_bonus_cap, monthly_bonus_cap, cap_group) values
  ('mrcc_standard', 'amex_mrcc', 'Standard Spends', 1, 50, 0, null, null, 'mrcc_general'),
  ('mrcc_fuel_utility', 'amex_mrcc', 'Fuel & Utilities (Milestone Eligible Only)', 0, 50, 0, null, null, 'mrcc_milestone_only');

-- 4. Transactions Ledger
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_card_id uuid references user_cards(id) on delete cascade not null,
  rule_id text references reward_rules(id) not null,
  transaction_date date not null,
  posting_date date,
  merchant text not null,
  amount numeric(12, 2) not null,
  is_refund boolean default false,
  related_transaction_id uuid references transactions(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

alter table transactions enable row level security;
create policy "Users can manage their own transactions" 
  on transactions for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

```

---

## 4. Edge Cases & Business Logic Specifications

### 1. Transaction Date vs. Posting/Settlement Date

* **HDFC SmartBuy & Partner Multipliers:** Tracked strictly by **calendar month of posting/settlement date**. Transactions occurring on the final day of a month that settle on the 1st of the following month roll into the next month's cap.
* **Amex MRCC Milestones:** Milestones evaluate strictly based on transactions settled within the calendar month. Transactions swiped on the 30th/31st that do not settle until the next month do not satisfy the closing month's milestone thresholds.
* **App Implementation:** The data entry modal allows entering both `transaction_date` and `posting_date` (defaulting to the same day if left empty, with a single toggle for "Pending Settlement"). Dashboard aggregations default to `coalesce(posting_date, transaction_date)`.

### 2. Cancellations, Modifications, and Net Settled Returns

* When an order is cancelled or modified (e.g., SmartBuy Hotel change), two entries occur: the original debit, an offsetting credit (refund), and the new debit.
* **Net Balance Accounting:** Refund rows have `is_refund = true` with a negative or positive amount that offsets points earned in that rule/cap bucket.
* If a refund settles in the same calendar window, it reverses the spent bonus points, restoring the remaining spend capacity for the rebooked transaction.

### 3. Shared vs. Dedicated Sub-Caps

* **SmartBuy Voucher Sub-Cap:** Capped at 3,000 bonus RP. Vouchers consume both the 3,000 voucher limit and the 4,000 overall SmartBuy limit.
* **SmartBuy Daily Cap:** Capped at 2,000 bonus RP across all SmartBuy spends occurring on the same settlement day.
* **5X Partner Brands:** The 5,000 bonus RP allowance is isolated from the SmartBuy quota and operates independently.

### 4. Amex MRCC Milestone Logic

* **4x ₹1,500 Rule:** Count of distinct transactions where `amount >= 1500` and `is_refund = false` must be $\ge 4$ in a calendar month.
* **₹20,000 Rule:** Sum of all net settled transactions in a calendar month must be $\ge ₹20,000$.
* Both eligible standard spends and exempt categories (fuel/utility) contribute to the spend sum and transaction counts.

---

## 5. UI/UX Wireframe & Component Structure

### Dashboard Screen

* **Card Selector:** Top dropdown or swipeable card carousel switching between *HDFC Regalia Gold* and *Amex MRCC*.
* **Month / Cycle Picker:** Quick stepper (`< September 2026 >`) with a toggle switch between *Posting Date (Default)* and *Transaction Date*.
* **Metric Cards:**
* Total Points Accrued (Base Points + Bonus Points).
* Live Remaining Spend Capacities (Rupee values remaining today and this month).


* **Cap Capacity Meters (Regalia Gold):**
* SmartBuy Instant Vouchers: `[████████░░] ₹13,639 / ₹30,000 (Remaining: ₹16,361)`
* Total SmartBuy Allowance: `[██████░░░░] 1,360 / 4,000 Bonus RP`
* 5X Partner Brands: `[░░░░░░░░░░] ₹0 / ₹50,000 (Remaining: ₹50,000)`


* **Milestone Progress Cards (Amex MRCC):**
* 4x ₹1,500 Transactions: `3 / 4 completed` (Chips displaying amounts: `₹1,850`, `₹2,100`, `₹1,500`).
* ₹20,000 Total Monthly Spend: `₹14,500 / ₹20,000 (Remaining: ₹5,500)`.



### Transaction Entry Drawer / Modal

* Amount input (₹) with dynamic preview banner displaying:
* Calculated Base RP.
* Multiplier Bonus RP.
* Cap check indicator (e.g., `"Exceeds today's SmartBuy 2,000 bonus RP limit by 340 RP"`).


* Fields: Category dropdown, Merchant name, Transaction Date, Posting Date, and a "Mark as Refund/Reversal" toggle.

---

## 6. Implementation Milestones

### Phase 1: Authentication & Schema Baseline

* Set up a Next.js 14+ (or Vite + React) repository with Tailwind CSS and shadcn/ui.
* Initialize the Supabase project, execute the SQL schema with RLS policies, and enable the Google OAuth provider.
* Configure the base Supabase browser client with persistent session handling.

### Phase 2: Transaction Ledger & Calculation Engine

* Build the Transaction Log view with paginated table listing, edit/delete actions, and category tags.
* Implement the client-side rewards calculation library (`rewardsEngine.ts`) capable of evaluating daily caps, monthly sub-caps, and net refund balances.
* Create the quick-add transaction dialog with real-time cap warning feedback.

### Phase 3: Regalia Gold Dashboard & Capacity Meters

* Build the month and date-filter selectors.
* Render the dynamic remaining rupee spend capacity cards for SmartBuy Vouchers, Hotels, Flights, and 5X Partner brands.
* Validate calculations against refund reversals and cross-month posting date scenarios.

### Phase 4: Amex MRCC Milestone Tracker Integration

* Add the Amex card option to user profiles.
* Implement the milestone evaluators: 4x ₹1,500 transaction count tracker and ₹20,000 cumulative monthly spend progress bar.
* Verify inclusion of fuel and utility categories for milestone spends while excluding them from base MR calculations.