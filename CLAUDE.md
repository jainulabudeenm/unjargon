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

Currently a scaffold. The intended product is a glossary of development terminology for designers. All application code lives under `app/` using the App Router file-system routing convention.

- `app/layout.tsx` — root layout with Geist Sans + Geist Mono fonts and Tailwind base styles
- `app/page.tsx` — home page (replace with glossary UI)
- `app/globals.css` — global styles entry point for Tailwind v4
