-- ==============================================================================
-- Rewards & Milestone Tracker Web App - Supabase PostgreSQL Schema & RLS Policies
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Supported Cards Table
create table if not exists cards (
  id text primary key, -- 'regalia_gold', 'amex_mrcc', 'infinia_metal', etc.
  name text not null,
  issuer text not null,
  currency text default 'INR',
  point_name text default 'RP',
  point_value_inr numeric default 0.50,
  statement_ceiling_points integer,
  created_at timestamptz default now()
);

-- Seed Default Cards
insert into cards (id, name, issuer, point_name, point_value_inr, statement_ceiling_points)
values
  ('regalia_gold', 'HDFC Regalia Gold', 'HDFC Bank', 'RP', 0.65, 50000),
  ('amex_mrcc', 'Amex Membership Rewards Credit Card', 'American Express', 'MR Points', 0.25, null),
  ('infinia_metal', 'HDFC Infinia Metal', 'HDFC Bank', 'RP', 1.00, 100000)
on conflict (id) do update set
  name = excluded.name,
  issuer = excluded.issuer,
  point_name = excluded.point_name,
  point_value_inr = excluded.point_value_inr;

-- 2. Card Templates (JSONB column for fully configurable rules, caps, and milestones)
create table if not exists card_templates (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade, -- null for global defaults, set for custom user templates
  template_json jsonb not null,
  is_custom boolean default false,
  updated_at timestamptz default now()
);

alter table card_templates enable row level security;
create policy "Allow read global and own card templates"
  on card_templates for select
  using (user_id is null or (auth.uid() is not null and auth.uid() = user_id));

create policy "Allow user modify own card templates"
  on card_templates for all
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- 3. User Cards (Which cards a user holds)
create table if not exists user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id text references cards(id) not null,
  nickname text,
  last4 text,
  billing_cycle_day integer check (billing_cycle_day between 1 and 31),
  template_override jsonb,
  created_at timestamptz default now(),
  unique(user_id, card_id)
);

alter table user_cards enable row level security;
create policy "Users can manage their own cards" 
  on user_cards for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- 4. Spend Categories & Multiplier Definitions
create table if not exists reward_rules (
  id text primary key,
  card_id text references cards(id) not null,
  category_name text not null,
  base_rate_points numeric not null,
  base_rate_spend numeric not null,
  bonus_multiplier numeric default 0,
  daily_bonus_cap integer,
  monthly_bonus_cap integer,
  cap_group text,
  tracks_by text default 'posting_date'
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
  ('rg_exempt_0x', 'regalia_gold', 'Exempt / Fuel / Rent / Gov (0X)', 0, 200, 0, 0, 0, 'exempt')
on conflict (id) do nothing;

-- Seed Amex MRCC Rules
insert into reward_rules (id, card_id, category_name, base_rate_points, base_rate_spend, bonus_multiplier, daily_bonus_cap, monthly_bonus_cap, cap_group) values
  ('mrcc_standard', 'amex_mrcc', 'Standard Spends', 1, 50, 0, null, null, 'mrcc_general'),
  ('mrcc_fuel_utility', 'amex_mrcc', 'Fuel & Utilities (Milestone Eligible Only)', 0, 50, 0, null, null, 'mrcc_milestone_only')
on conflict (id) do nothing;

-- 5. Transactions Ledger
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_card_id uuid references user_cards(id) on delete cascade not null,
  rule_id text not null,
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

-- Create Indexes for fast querying
create index if not exists idx_transactions_user_card on transactions(user_card_id);
create index if not exists idx_transactions_posting_date on transactions(posting_date);
create index if not exists idx_transactions_transaction_date on transactions(transaction_date);
