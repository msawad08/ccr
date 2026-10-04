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

### 7. Google OAuth Login Setup (Optional)
To test or use "Continue with Google":

#### For Local Supabase Docker:
1. Create an OAuth 2.0 Web Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Set **Authorized JavaScript origins**: `http://localhost:3000` and `http://127.0.0.1:3000`
   - Set **Authorized redirect URIs**: `http://127.0.0.1:54321/auth/v1/callback`
2. Add your Google OAuth credentials to your `.env` or `.env.local` file (this file is gitignored, so your secret stays completely safe):
   ```env
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=GOCSPX-your-google-client-secret
   ```
3. In `supabase/config.toml`, set `enabled = true`. Notice it references the environment variables safely using `env(...)` so no secrets are ever committed to Git:
   ```toml
   [auth.external.google]
   enabled = true
   client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
   secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
   skip_nonce_check = true
   ```
4. Restart local Supabase: `npx supabase stop && npx supabase start`.

#### For Supabase Cloud:
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), set Authorized redirect URI to:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
2. In Supabase Dashboard -> **Authentication** -> **Providers** -> **Google**:
   - Toggle **Enable Google provider** to ON.
   - Enter your Client ID and Client Secret, then click **Save**.
3. In CardCap Settings, click **Continue with Google** to sign in instantly!

---

## 🐳 Option 2: Standalone Docker Compose

If you prefer running via Docker Compose directly:
```bash
docker compose up -d
```
* **PostgreSQL:** Port `54322` (pre-loaded with `supabase/schema.sql`)
* **Inbucket Email Catcher:** [http://localhost:54324](http://localhost:54324)
