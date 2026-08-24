# unjargon

A plain-language glossary of the tools developers talk about, written for designers. Every entry leads with an analogy, then a two-sentence explanation. No prerequisites.

Live at **[unjargon.vercel.app](https://unjargon.vercel.app)**

Most explanations of dev tooling assume you already know the thing. A designer who needs to know what a bundler is does not need the docs, they need one good sentence.

---

## Two modes

**Dictionary.** Ten categories, from core languages through to deployment. Full-text search across names and descriptions. The sidebar tracks whatever section you have scrolled to.

**Flashcards.** The same glossary as a deck. Front is the term, back is the analogy and the explanation. For when you want to actually retain it rather than look it up again next week.

## Keyboard

Built to be driven without a mouse.

| Key | Does |
|---|---|
| `D` / `1` | Dictionary mode |
| `F` / `2` | Flashcard mode |
| `/` or `⌘K` | Focus search |
| `T` | Toggle light and dark |
| `←` `→` or `H` `L` | Previous and next card |
| `Space` / `Enter` | Flip the card |

## How entries get written

Adding a term is one input. The rest is generated and reviewed before it saves.

The `/api/generate` route sends the term to Gemini 2.5 Flash through the Vercel AI SDK, with a zod schema that forces a structured response: an analogy, a description, and a category id. The model is handed the current category list and has to place the term in one of them. If nothing fits, it coins a new kebab-case category and titles it, so the taxonomy grows with the content instead of being fixed up front.

Nothing saves automatically. The generated draft goes into an editable form first.

## Stack

Next.js 16.2 (App Router, Turbopack), React 19.2, Tailwind v4, TypeScript in strict mode, Supabase for storage, Vercel AI SDK with `@ai-sdk/google`, zod for the response schema, shadcn and Radix for components.

## Run it locally

```bash
npm install
npm run dev
```

Then set these in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADMIN_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

Storage is a single Supabase table, `terms`, with columns `name`, `analogy`, `description`, and `category_id`. The category ids are listed in `app/page.tsx`.

## Known limitations

- The editor gate is client side, so write access needs to be enforced by Supabase row level security rather than by the app. Moving the insert behind a server route is the fix.
- `/api/generate` has no rate limiting, which matters because it spends tokens.
- No tests yet.

## License

MIT
