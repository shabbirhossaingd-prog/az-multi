# Supabase setup for AZ Multi

This folder contains the initial production database foundation.

## 1. Create a Supabase project

Create a project in Supabase, then copy the Project URL and anon/publishable key into Vercel environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The anon key is used by the browser together with Row Level Security. Never expose the service-role key in Vite/browser code.

## 2. Run the schema

Open Supabase SQL Editor and run `schema.sql` once.

It creates user-owned tables for:

- profiles
- brand profiles
- social accounts
- posts and scheduler state
- contacts / CRM
- conversations and messages
- organic campaigns
- ad campaigns and daily ad metrics
- AI generations

Row Level Security is enabled so signed-in users can only access rows where they are the owner.

## 3. Authentication

Enable Email authentication in Supabase Auth. The frontend service in `src/lib/auth.js` already includes helpers for:

- sign up
- email/password sign in
- sign out
- current session
- password reset email
- auth state changes

The existing demo login remains the UI fallback until the app screen is switched to these helpers.

## 4. Data layer

`src/lib/db.js` contains the first authenticated data helpers for brand profile, posts, contacts, campaigns and ad campaigns.

## 5. Social and Ads secrets

Meta, Google Ads, TikTok, X and AI secrets must live in protected server functions / environment variables. Do not save long-lived provider tokens in React localStorage.

Recommended next implementation:

1. Wire the login screen to Supabase Auth when configured.
2. Migrate Brand Profile and Scheduler from localStorage to Supabase.
3. Add server-side OAuth callback routes for Meta.
4. Add scheduled publishing jobs.
5. Add analytics/inbox sync jobs.
6. Add Ads API launch + metrics sync routes.
