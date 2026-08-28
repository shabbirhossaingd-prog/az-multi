# AZ Multi

AI-powered social media management and automation workspace based on the supplied product plan.

## Current build — Phase 2 + backend foundation

The project now includes a working frontend product flow plus the initial Supabase production data layer:

- Responsive Light / Dark / Future UI modes
- Demo sign-in screen with local session persistence
- Saved Brand Setup / AI brand context
- Dashboard with demo analytics, connected-channel state, upcoming posts and inbox preview
- Full Analytics screen ready for live API data
- Scheduler with content calendar, saved posts and delete flow
- Multi-platform post composer with platform selection, date, time and status
- Unified Inbox UI with conversation selection and demo replies
- AI Studio with brand-aware caption, image-prompt and video-concept demo generation
- Content library
- Campaign dashboard
- Contacts / simple social CRM screen
- Integrations page for Instagram, Facebook, TikTok and X
- Ads Manager planning UI with platform selection, budget, opportunity scoring, keyword/targeting suggestions and performance metric structure
- Settings and production-readiness guidance
- Local persistence for brand profile, scheduled posts, integration demo state and theme
- Supabase client/auth/data-access foundation
- Initial SQL schema with Row Level Security for profiles, brands, posts, contacts, conversations, campaigns, ads and AI generations
- `.env.example` with safe browser variables and server-secret guidance

## Backend foundation

Supabase files now live in `supabase/` and frontend helpers live in `src/lib/`.

Set these frontend-safe environment variables after creating a Supabase project:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Then run `supabase/schema.sql` in the Supabase SQL Editor.

The codebase can safely stay in demo mode while these values are empty. Once configured, the Supabase client initializes automatically and the next step is wiring the current login/brand/scheduler UI to the real auth and database helpers.

## Important: demo vs live features

The UI and local workflows are functional, but social publishing, analytics, messaging, ad launch and AI generation cannot be live until the corresponding external APIs, OAuth permissions, backend functions and credentials are configured.

Do **not** put Meta/Google/TikTok/X access tokens or AI secret keys directly in React/Vite browser code. Production secrets must be stored server-side (for example in Vercel Functions, Supabase Edge Functions or another protected backend).

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Recommended production connection order

1. Configure Supabase project and run the schema
2. Wire real authentication (signup/login/reset/session)
3. Migrate Brand Profile and Scheduler from localStorage to Supabase
4. Meta OAuth for Facebook + Instagram
5. Publishing + scheduler backend jobs
6. Analytics sync
7. Unified inbox APIs where permissions allow
8. AI text/image provider through protected server routes
9. Ads API launch + metrics sync for Meta/Google/TikTok/X as supported
10. Future video editor/generation integration

The frontend is intentionally structured so these services can replace the current demo/localStorage layer without changing the visual design.
