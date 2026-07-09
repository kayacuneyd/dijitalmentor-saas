# Conventions — saaskaya

How code is written and changes are verified here. Complements `CONSTITUTION.md` (the _why_) with the
_how_.

## Project layout

```
src/lib/schema/site.ts        # Zod Site schema — THE contract (types inferred from it)
src/lib/blocks/               # section components + registry.ts
src/lib/presets/              # 3 niche theme + template presets
src/lib/seed/                 # hand-authored demo Site JSON
src/lib/render/               # SiteRenderer.svelte
src/lib/server/ai/            # Claude tool-use generation + repair + patch + token usage
                              # (server-only — the API key must never reach the client)
src/lib/stores/               # editor draft store + postMessage bridge
src/lib/server/db/            # Drizzle schemas + repository layer
src/routes/new/               # self-description → generate → editor
src/routes/editor/[siteId]/   # editor shell (sidebar + iframe)
src/routes/preview/[siteId]/  # iframe target: SSRs draft, listens for postMessage
src/routes/dashboard/         # admin panel (M4)
src/routes/(site)/            # published tenant site + locale routes (M4)
src/hooks.server.ts           # tenant-by-Host resolution
```

## Naming & style

- TypeScript everywhere; `strict` on. Types are **inferred from Zod**, not hand-written in parallel.
- Components `PascalCase.svelte`; utilities/modules `camelCase.ts`; routes lowercase per SvelteKit.
- Tailwind + DaisyUI for styling; theme via DaisyUI theme tokens + CSS variables — **no per-tenant custom CSS**.
- Keep functions small and named for what they do. Match the surrounding code's idiom.

## How to add a new block component (the one pattern that repeats)

1. Add/extend the section type in `src/lib/schema/site.ts` (props + per-locale content shape).
2. Create `src/lib/blocks/<Name>.svelte` with its `variant`s; read `props` + `content` via typed props.
3. Register it in `src/lib/blocks/registry.ts` (`type → component`).
4. Add it to the relevant niche preset(s) in `src/lib/presets/` and to a seed Site.
5. Confirm the AI tool schema still round-trips (the block is now generatable) and add a fixture.

## Git

- Branch off `main` (`master` locally) per milestone/task: `mN-short-topic`.
- Commit messages: imperative, scoped — e.g. `M1: add Hero block + registry`. Commit/push only when asked.
- One milestone = a reviewable set of small commits, not one giant diff.

## Error & verification protocol (min-error loop)

Never guess a fix. For every bug or failing check:

1. **Reproduce** — get a deterministic repro (a command, a route, an input).
2. **Capture the real signal** — the actual stack trace / console / server log / test output. Read it fully.
3. **Locate root cause** — trace to the specific line/assumption; don't patch symptoms.
4. **Minimal fix** — smallest change that addresses the cause.
5. **Verify end-to-end** — re-run the repro + the `verify` / `run` skill; confirm the behavior, not just the type-check.
6. **Log it** — add an entry to the **Error log** in `PROGRESS.md`: incident → root cause → fix → prevention.

## Testing

- Unit-test `siteSchema.safeParse` on good **and** bad fixtures — the contract must reject malformed AI output.
- Test the AI generator against its schema (mock the API in unit tests; a small live smoke test for real output).
- Drive UI flows (generate → preview → edit → publish) with the `run` / `verify` skills, not by assumption.

## AI-generation specifics

- Generation is **tool-use constrained to the Zod schema**; validate every output; repair once, else surface a friendly error.
- Text/color edits are **direct model writes**, never an AI call (token discipline).
- Track token usage per tenant; enforce the monthly limit; degrade gracefully on provider errors.
- At build time, confirm model id + params via the **`claude-api` skill** — do not hardcode from memory.
