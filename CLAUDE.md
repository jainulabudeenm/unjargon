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
`description` and `category_id`. It is read and written from the browser with
the anon key.

## Known weak spots

Do not treat these as done.

- The editor gate is client side. `NEXT_PUBLIC_ADMIN_KEY` ships in the bundle,
  and `handleUpload` does not check `isAdmin` before inserting, so write
  protection rests entirely on Supabase row level security. Moving the insert
  behind a server route is the fix.
- `/api/generate` has no auth and no rate limiting, and every call spends tokens.
- No test runner, so there is no regression net on the shortcut handler or the
  category-matching logic.
