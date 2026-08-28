# AZ Multi

AI-powered social media management and automation workspace based on the supplied product plan.

## Current build — Phase 2

The project now includes a working frontend product flow rather than placeholder pages:

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
- Settings and production-readiness guidance
- Local persistence for brand profile, scheduled posts, integration demo state and theme
- `.env.example` with security guidance for future backend integration

## Important: demo vs live features

The UI and local workflows are functional, but social publishing, analytics, messaging and AI image/content generation cannot be live until the corresponding external APIs, OAuth permissions, backend and credentials are configured.

Do **not** put Meta/TikTok/X access tokens or AI secret keys directly in React/Vite browser code. Production secrets must be stored server-side (for example in Vercel Functions, Supabase Edge Functions or another protected backend).

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

1. Real authentication + database
2. Brand/user data persistence
3. Meta OAuth for Facebook + Instagram
4. Publishing + scheduler backend jobs
5. Analytics sync
6. Unified inbox APIs where permissions allow
7. AI text/image provider through protected server routes
8. TikTok and X integrations
9. Future video editor/generation integration

The frontend is intentionally structured so these services can replace the current demo/localStorage layer without changing the visual design.
