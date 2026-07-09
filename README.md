# saaskaya

WaaS / progressive CMS: describe yourself in a chat, an AI generates a **multilingual website as
validated JSON (never raw HTML)**, preview it live in three viewports, edit the copy, publish it on
your own domain.

Canonical docs: [`CLAUDE.md`](./CLAUDE.md) (entry point) · [`docs/CONSTITUTION.md`](./docs/CONSTITUTION.md) ·
[`docs/PLAN.md`](./docs/PLAN.md) · [`docs/PROGRESS.md`](./docs/PROGRESS.md) ·
[`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md)

## Stack

SvelteKit · TailwindCSS 4 · DaisyUI 5 · Zod 4 (the schema contract) · Drizzle ORM (SQLite first
slice) · Vitest · adapter-node.

## Develop

```sh
npm install
npm run dev        # dev server
npm test           # unit tests (siteSchema.safeParse fixtures)
npm run check      # svelte-check / TypeScript
npm run build      # production build (adapter-node)
```

Copy `.env.example` to `.env` (`DATABASE_URL=local.db`) before using the Drizzle scripts
(`npm run db:push` etc.).

## Where things live

- `src/lib/schema/site.ts` — the Zod `Site` schema, **the single contract** (AI, editor and
  renderer all derive from it).
- `src/lib/seed/` — hand-authored demo Sites (law / psych / dental, TR·EN·DE).
- `src/lib/server/db/` — Drizzle schema + client (first slice: one local SQLite).

The AI never writes HTML/CSS — it only fills the schema. See `docs/CONSTITUTION.md` before
changing anything.
