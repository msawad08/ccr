# Local Supabase Testing Guide with Docker & Auth

This guide explains how to spin up a complete local Supabase instance using Docker to test CardCap's authentication, PostgreSQL database, Row Level Security (RLS), and real-time syncing.

---

## ⚡ Option 1: Official Supabase CLI (Recommended)

The Supabase CLI is already initialized in this repository. It automatically manages Docker containers for Postgres, GoTrue (Auth), PostgREST, Kong, Studio, and Inbucket with zero manual configuration.

### 1. Start Local Supabase
From the project root, run:
```bash
npx supabase start
```

On first run, Docker will download the official Supabase images and start all services. Once ready, it outputs your local endpoints:
```text
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Configure CardCap `.env.local`
Copy the local API URL and anon key into `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Apply Schema & Seed Data
Migrations in `supabase/migrations/` are automatically applied by the CLI. You can also re-apply or reset anytime:
```bash
npx supabase db reset
```

### 4. Test Authentication & Emails
* Open `http://localhost:3000` in your browser.
* Click **Settings** (or the sync badge in the navigation bar) and switch to **Supabase Sync Mode**.
* Click **Sign Up** and enter any test email (e.g. `test@example.com`) and password.
* Open the **Inbucket Local Email Sandbox** at:
  👉 [http://127.0.0.1:54324](http://127.0.0.1:54324)
* You will see the confirmation / magic link email immediately! Click the link to verify.
* Once logged in, your cards and transactions will automatically sync with Row Level Security (`auth.uid() = user_id`).

### 5. Inspect Data in Supabase Studio
Open the local web database dashboard:
👉 [http://127.0.0.1:54323](http://127.0.0.1:54323)
Here you can inspect the `cards`, `user_cards`, `card_templates`, and `transactions` tables live.

### 6. Stop Local Supabase
When you're done testing:
```bash
npx supabase stop
```

---

## 🐳 Option 2: Standalone Docker Compose

If you prefer running via Docker Compose directly:
```bash
docker compose up -d
```
* **PostgreSQL:** Port `54322` (pre-loaded with `supabase/schema.sql`)
* **Inbucket Email Catcher:** [http://localhost:54324](http://localhost:54324)
