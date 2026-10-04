# CardCap — Complete Publishing & Deployment Guide

This document provides step-by-step instructions for:
1. **Production Web Deployment**: Hosting the CardCap Next.js web application and Supabase Cloud database.
2. **Community Card Publishing Workflow**: How users create/edit cards and how administrators approve and publish cards to the Community Catalog.

---

## Part 1: Web Application Deployment to Production

### Step 1: Push Local Code to GitHub

Your local git branch contains the latest features, quiet luxury redesign, admin governance, and unified catalog.

```bash
git push origin main
```

*(Repository remote is configured to `https://github.com/msawad08/ccr.git`)*

---

### Step 2: Set Up Supabase Cloud Database

If you want persistent multi-device cloud synchronization alongside offline Local Storage:

1. **Create a Free Project**:
   * Navigate to [https://supabase.com](https://supabase.com) and sign in.
   * Click **New Project**, choose an organization, database password, and your nearest region (e.g. `ap-south-1` Mumbai / Singapore).

2. **Run Database Migrations**:
   * Go to the **SQL Editor** tab in your Supabase dashboard.
   * Open or copy the contents of [`supabase/migrations/20261003000000_init_schema.sql`](file:///D:/Workspace/ccr/supabase/migrations/20261003000000_init_schema.sql) and click **Run**.
   * Open or copy the contents of [`supabase/migrations/20261004000000_admin_roles_feedback.sql`](file:///D:/Workspace/ccr/supabase/migrations/20261004000000_admin_roles_feedback.sql) and click **Run**.
   * *This configures tables for user cards, transactions, custom card templates, submissions, user roles, feedback, and Row Level Security (RLS) policies.*

3. **Retrieve API Credentials**:
   * Go to **Project Settings** > **API**.
   * Copy the following two keys:
     * **Project URL**: e.g. `https://xyzproject.supabase.co`
     * **Project API Anon Key**: `eyJhbGciOi...` (public anon key)

4. **(Optional) Configure Google OAuth in Supabase**:
   * Go to **Authentication** > **Providers** > **Google**.
   * Toggle **Enable Google provider**.
   * Enter your Google OAuth **Client ID** and **Client Secret** (from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)).
   * Add the Supabase Callback URL provided in the dashboard into your Google Cloud Console Authorized Redirect URIs:
     `https://<your-project-ref>.supabase.co/auth/v1/callback`

---

### Step 3: Deploy to Vercel (Recommended)

Vercel is the native hosting platform for Next.js and provides zero-config builds, global edge CDN, and instant preview deployments:

1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** > **Project**.
3. Import the `msawad08/ccr` GitHub repository.
4. In the **Environment Variables** section, add the following variables:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Cloud API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Public Anon Key |
| `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` | `msawad08@gmail.com` | Super Admin email(s) |

5. Click **Deploy**.
6. Vercel will build the Next.js app in ~60 seconds and assign a live production URL (e.g. `https://ccr-alpha.vercel.app`).
7. **Add Vercel Domain to Supabase Auth Redirects**:
   * In Supabase Cloud Dashboard, go to **Authentication** > **URL Configuration**.
   * Add your Vercel production URL (e.g. `https://ccr-alpha.vercel.app` and `https://ccr-alpha.vercel.app/auth/callback`) to **Site URL** and **Redirect URLs**.

---

### Step 4: Alternative Self-Hosting with Docker

You can also self-host CardCap on any VPS (AWS EC2, DigitalOcean, Hetzner, etc.) using Docker:

```bash
# 1. Build and start standalone stack
docker compose up -d --build

# 2. View running containers
docker compose ps
```

The application will be accessible at port `3000` with local PostgreSQL running on port `54322`.

---

## Part 2: Community Card Publishing & Approval Workflow

CardCap features a curated community governance model: standard users can create and propose credit cards, while administrators verify the bank terms and reward calculations before publishing.

```
┌─────────────────────────────────┐
│     User Creates / Edits Card    │
│  (Custom Rules, Caps & Multipliers) │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       "Save & Apply Rules"      │
│  (Immediately active in wallet) │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      "Request to Publish"       │
│  (Enters Admin Review Queue)    │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    Admin Inspects Submission    │
│   (Admin Panel > Submissions)   │
└────────┬───────────────┬────────┘
         │               │
  Approve│               │Reject
         ▼               ▼
┌─────────────────┐ ┌───────────────┐
│ Published to    │ │ Returned with │
│ Community       │ │ Reviewer      │
│ Catalog         │ │ Feedback      │
└─────────────────┘ └───────────────┘
```

### Flow A: How a User Creates, Customizes & Publishes a Card

1. **Open the Community Catalog**:
   * Click **Catalog** in the top navigation bar.
2. **Choose an Action**:
   * **To create a new card**: Click **`+ Create Card / AI Studio`** in the Catalog header.
   * **To edit an existing card**: Click **`Edit`** on any card in the catalog grid.
3. **Configure Card Rules**:
   * **Multiplier Rules**: Set accelerated category rewards (e.g., 5X SmartBuy, 10X dining).
   * **Cap Groups**: Define monthly/daily caps and specify whether bonus-only or total points are capped.
   * **Milestones**: Configure quarterly lounge access spend thresholds, fee waivers, or high-spend vouchers.
   * **AI Studio (JSON5)**: Generate prompts for Gemini/ChatGPT or paste JSON5 templates directly.
4. **Save Locally ("His rules update for him")**:
   * Click **`Save & Apply Rules`**.
   * The updated card rules are saved to your local library. If the card is in your wallet, all reward meters, daily cap inspector charts, and milestone calculations reflect these rules immediately.
5. **Submit to Community Catalog**:
   * In the card editor modal, click **`Request to Publish`**.
   * Enter your **Creator Credit Name** (e.g. `@yourname` or real name).
   * Enter a short summary of the rules or bank devaluations in the **Release Notes**.
   * Click **`Submit for Review`**.

---

### Flow B: How Admins Review, Approve & Publish Cards

1. **Log in as Administrator**:
   * Sign in with `msawad08@gmail.com` (or any email promoted by the Super Admin).
   * The **`Admin`** badge will appear in the top navigation bar with a golden shield icon.
2. **Access Admin Panel**:
   * Click **`Admin`** in the navigation bar.
   * Select the **Submissions** tab.
3. **Review Submissions**:
   * View pending cards submitted by community members.
   * Inspect the submitted multipliers, cap limits, and author notes.
4. **Approve or Reject**:
   * Click **`Approve & Publish`**: The card is stamped with official community status and published immediately to the **Community Catalog** for all users.
   * Click **`Reject`**: Enter feedback explaining required corrections (e.g. "Cap needs to be 4,000 RP per bank notification dated Oct 2026").
5. **Direct Publishing (Admins Only)**:
   * When an administrator edits or creates a card in the card editor, the button reads **`Publish to Catalog`**. Clicking it bypasses the review queue and publishes the card instantly to all users.

---

### Flow C: Deleting Cards from the Catalog (Admin Only)

1. Open **Catalog** while signed in as Admin.
2. Every card card displays an exclusive red **`Delete`** button alongside the Edit button.
3. Click **`Delete`** and confirm the dialog (`Are you sure you want to delete "[Card Name]" from the Community Catalog?`).
4. The template is removed from both the local catalog and the Supabase cloud registry. Standard users cannot view or trigger this action.

---

## Part 3: Production Checklist & Verification

Before launching to your users:

- [x] **0 TypeScript Errors**: Verified with `npm run build` using Next.js 16 Turbopack.
- [x] **No Debug Banners in Production**: Technical diagnostic banners and internal credentials are suppressed in production mode.
- [x] **Default Super Admin**: Configured as `msawad08@gmail.com`.
- [x] **Row Level Security (RLS)**: Users can only read/write their own transactions and cards, while catalog templates and submissions follow role-based policies.
- [x] **Local Storage Fallback**: Even without internet connectivity or Supabase configuration, the app runs offline via browser Local Storage.
