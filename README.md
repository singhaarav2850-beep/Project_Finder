# Huddle — find your project partner

A tiny internet product for one specific problem: a student has a side
project and is missing one skill (design, backend, ML, whatever) to move it
forward, and has no good way to find someone at their own university who has
that skill and wants in.

Huddle is a noticeboard. You pin a project with the skills it needs.
Other students search the board, and send a short note asking to join.
You accept the right person and take it from there.

**Live demo:** _add your deployed Vercel URL here_
**Video walkthrough:** _add your short screen recording link here_

---

## Why this product, and not just a CRUD app

The brief asks for a product, not a website — so the design choices below are
all in service of the one thing that makes or breaks a partner-finder: **can
someone tell in five seconds whether they're a fit?** That's why:

- Skills are the primary unit everywhere — on the card, in search, on a
  request — instead of being a buried form field.
- The board is the home screen, not a dashboard. There's no empty "welcome"
  screen between login and finding a project.
- Requests carry a message and the requester's own skills, so a project owner
  can screen people without leaving the page.

## Architecture

```
Browser (React Client Components)
   │  - project board, search, request forms
   │  - realtime subscription for the notification badge
   ▼
Next.js 14 App Router
   │  - Server Components fetch initial data straight from Postgres
   │  - middleware.js guards private routes and refreshes the auth session
   ▼
Supabase
   ├── Postgres  → profiles / projects / join_requests (see supabase/schema.sql)
   ├── Auth      → email + password, session stored in httpOnly cookies
   ├── Storage   → "avatars" bucket, one file per user folder
   └── Realtime  → join_requests table broadcasts changes to the navbar badge
```

**Why Server Components for the first paint, Client Components after that:**
the board, project detail, requests inbox, and profile pages all fetch their
*initial* data on the server (fast first paint, no loading-spinner flash, and
it works even before any client JS has hydrated). Everything a user actually
*does* — searching, submitting a request, accepting someone, uploading an
avatar — happens in a Client Component talking directly to Supabase, so there's
no need to hand-roll a REST API layer for simple CRUD.

**Why Postgres Row Level Security instead of API-layer checks:** every table
enforces its own access rules at the database level (see `supabase/schema.sql`).
A user literally cannot fetch someone else's pending request or edit a
project they don't own, regardless of what the client sends — the security
boundary is the database, not any one code path in the app.

### Data model

| Table | Purpose |
|---|---|
| `profiles` | One row per user (auto-created on signup via a trigger). Name, bio, skills, avatar. |
| `projects` | A "looking for a partner" post: title, description, skills needed, open/closed. |
| `join_requests` | A student's ask to join a project, with a message and pending/accepted/rejected status. |

Full DDL, triggers, RLS policies, and storage policies are in
[`supabase/schema.sql`](./supabase/schema.sql) — it's a single idempotent-ish
script you run once.

### Feature checklist (bonus items from the brief)

- [x] Authentication (Supabase Auth, email + password)
- [x] Protected routes (`middleware.js` redirects signed-out users away from
      `/dashboard`, `/projects/new`, `/profile`, `/requests`)
- [x] User profile management (bio, skills, avatar)
- [x] Instant search (client-side filter over title/description/skills, no
      network round-trip per keystroke)
- [x] Notifications (live badge count of pending requests via Supabase
      Realtime — updates without a page refresh)
- [x] File uploads (avatar photo to Supabase Storage)

---

## Running it locally

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then open
**SQL Editor → New query**, paste the entire contents of
[`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates every
table, trigger, RLS policy, and the `avatars` storage bucket in one shot.

Then go to **Project Settings → API** and copy:
- Project URL
- `anon` public key

### 2. Configure the app

```bash
cp .env.local.example .env.local
# paste your Project URL and anon key into .env.local
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with any email —
Supabase's default email confirmation will require you to click a
confirmation link (check the Supabase Auth logs in the dashboard if you don't
receive it in dev, or disable "Confirm email" under **Authentication →
Providers → Email** while testing).

Sign up a second user in an incognito window to test the full request flow
(post a project as user A, request to join as user B, accept as user A).

### 4. Deploy

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the two env vars from `.env.local` in the Vercel project settings.
4. Deploy. Vercel gives you the live production URL for the submission.

---

## Project structure

```
huddle/
├── app/
│   ├── page.js                  landing page
│   ├── login/page.js
│   ├── signup/page.js
│   ├── dashboard/page.js        the board (server) + ProjectBoard (client)
│   ├── projects/new/page.js     post a project
│   ├── projects/[id]/page.js    project detail, requests, accept/reject
│   ├── profile/page.js
│   ├── requests/page.js         incoming + outgoing requests inbox
│   └── layout.js, globals.css
├── components/
│   ├── Navbar.js                auth state + live notification badge
│   ├── ProjectBoard.js
│   ├── ProjectDetailClient.js
│   └── ProfileForm.js           bio/skills form + avatar upload
├── lib/supabase/
│   ├── client.js                browser Supabase client
│   └── server.js                server Supabase client (Server Components)
├── middleware.js                session refresh + route protection
└── supabase/schema.sql          full DB schema, RLS, triggers, storage
```
