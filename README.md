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
GOOGLE_GENERATIVE_AI_API_KEY=
ADMIN_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The last two have no `NEXT_PUBLIC_` prefix on purpose. That prefix inlines a value into the browser bundle, so anything used to authorise a write has to stay without it.

Storage is a single Supabase table, `terms`, with columns `name`, `analogy`, `description`, and `category_id`. The category ids are listed in `app/page.tsx`.

Reads go straight from the browser with the anon key, since the glossary is public. Writes go through `POST /api/terms`, which checks `ADMIN_KEY` server side and then inserts with the service role. That means the table itself should refuse anon writes:

```sql
alter table terms enable row level security;

create policy "public read" on terms
  for select using (true);
```

With RLS on and only a select policy defined, the anon key can read and cannot insert, update or delete. The service role bypasses RLS, which is why the server route still works.

To check the auth paths after changing them:

```bash
ADMIN_KEY=test-key npm run dev
./scripts/check-auth.sh http://localhost:3000 test-key
```

## Known limitations

- No test runner. `scripts/check-auth.sh` covers the auth paths on the two write routes and nothing else, so the keyboard handler and the category matching have no regression net.
- `/api/generate` is behind the admin key rather than a rate limiter. That stops anonymous token burn, but an authorised editor can still call it in a loop.
- The category list lives in `app/page.tsx` rather than the database, so a category coined by the model is stored on the term without being added to the sidebar until the array is updated by hand.

## License

MIT
