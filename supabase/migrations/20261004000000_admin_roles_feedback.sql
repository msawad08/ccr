-- ==============================================================================
-- Migration: Profiles, User Roles, Card Submissions & Feedback
-- ==============================================================================

-- 1. Profiles & Roles Table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text default 'user' check (role in ('user', 'admin', 'super_admin')),
  is_blocked boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Allow users to read own profile or admins to read all"
  on profiles for select
  using (
    auth.uid() = id or 
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

create policy "Allow admins and super admins to update profiles"
  on profiles for update
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- Auto-create profile trigger on auth.users signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id, 
    new.email,
    case when lower(new.email) = 'msawad08@gmail.com' then 'super_admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Card Submissions Queue Table
create table if not exists card_submissions (
  id text primary key,
  template_id text not null,
  template_json jsonb not null,
  submitted_by_id uuid references auth.users(id) on delete set null,
  submitted_by_email text not null,
  creator_name text not null,
  submission_type text default 'new_card' check (submission_type in ('new_card', 'card_update')),
  original_card_id text,
  change_summary text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);

alter table card_submissions enable row level security;

create policy "Allow users to view own submissions, and admins to view all"
  on card_submissions for select
  using (
    auth.uid() = submitted_by_id or
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  );

create policy "Allow authenticated users to insert card submissions"
  on card_submissions for insert
  with check (auth.uid() is not null);

create policy "Allow admins to update card submissions"
  on card_submissions for update
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  );

-- 3. Feedbacks Table (App & Card-Specific Feedback)
create table if not exists feedbacks (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  type text not null check (type in ('app', 'card')),
  card_template_id text,
  card_name text,
  category text default 'general',
  message text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  admin_notes text,
  created_at timestamptz default now()
);

alter table feedbacks enable row level security;

create policy "Allow users to submit feedback"
  on feedbacks for insert
  with check (true);

create policy "Allow admins to view and manage feedback"
  on feedbacks for select
  using (
    auth.uid() = user_id or
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  );

create policy "Allow admins to update feedback status"
  on feedbacks for update
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  );
