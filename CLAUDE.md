# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.1** with App Router — has breaking changes from v15; read `node_modules/next/dist/docs/` before making assumptions
- **React 19.2.4**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`) — config syntax differs significantly from v3; no `tailwind.config.js`
- **TypeScript** with strict mode

## Next.js 16 Breaking Changes to Keep in Mind

- Route interception middleware is now `proxy.ts` (not `middleware.ts`), placed at the same level as `app/`
- All request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`
- Turbopack is the default bundler; config lives at top-level in `next.config.ts`, not under `experimental.turbopack`
- Use `'use cache'` Cache Components instead of PPR

## Path Aliases

`@/*` maps to the project root (e.g., `@/app/...`, `@/components/...`).

## Architecture

A shipped glossary of development terminology for designers, live at
https://unjargon.vercel.app. All application code lives under `app/` using the
App Router file-system routing convention.

- `app/page.tsx` is the whole UI, one client component. It holds both view modes
  (`dictionary` and `flashcards`), search, theme, the keyboard shortcut handler,
  the editor gate, and the add-term modal. The ten category ids are defined here
  in `baseCategories` and are the source of truth the API route is handed.
- `app/api/generate/route.ts` takes a term plus the current category list and
  calls Gemini 2.5 Flash through the Vercel AI SDK with a zod schema, returning
  an analogy, a description, and a category id. If nothing fits it coins a new
  kebab-case id and title, so the taxonomy is self-extending. It generates a
  draft only; the insert happens separately after review.
- `app/api/keep-alive/route.ts` is hit by the Vercel cron in `vercel.json` to
  stop the free-tier Supabase project pausing.
- `app/layout.tsx` is the root layout: Geist Sans, Geist Mono and JetBrains Mono,
  plus Tailwind base styles and launch metadata.
- `app/globals.css` is the global styles entry point for Tailwind v4.

Storage is a single Supabase table, `terms`, with `name`, `analogy`,
`description` and `category_id`. Reads come straight from the browser with the
anon key because the glossary is public. Writes do not: they go through
`POST /api/terms`.

## Authorisation

`lib/admin-auth.ts` is the only thing that decides whether a write is allowed.
Both write routes call `requireAdmin(req)`, which compares the `x-admin-key`
header against `ADMIN_KEY` using a timing-safe digest compare and fails closed
when the variable is unset.

Rules to keep:

- **Never give the admin key a `NEXT_PUBLIC_` prefix.** That prefix inlines the
  value into the browser bundle, which is exactly what made the old gate
  cosmetic. Same for `SUPABASE_SERVICE_ROLE_KEY`.
- **Never import `lib/admin-auth.ts` into a client component.** It is server only.
- `isAdmin` in `app/page.tsx` reveals the modal and nothing more. Treat it as
  cosmetic and never as permission. The server re-checks every write.
- The insert uses the service role so the `terms` table can enable RLS with a
  select-only policy for anon. If writes start failing with a permissions error,
  check `SUPABASE_SERVICE_ROLE_KEY` before touching the policy.

After changing anything on those paths:

```bash
ADMIN_KEY=test-key npm run dev
./scripts/check-auth.sh http://localhost:3000 test-key
```

## Known weak spots

Do not treat these as done.

- No test runner. `scripts/check-auth.sh` covers the auth paths on the two write
  routes and nothing else, so the shortcut handler and the category-matching
  logic have no regression net.
- `/api/generate` is gated by the admin key rather than rate limited, so an
  authorised editor can still burn tokens in a loop.
- `baseCategories` lives in `app/page.tsx`, not the database. A category the
  model coins is saved on the term but does not appear in the sidebar until that
  array is updated by hand.
