# Backlog spec — per-tenant installable PWAs

**Status: backlog — deliberately NOT implemented.** Scoped out of the 2026-07 mobile
optimization roadmap by operator decision ("SaaS now, tenant PWA later").

## Context

The 2026-07 mobile roadmap shipped PWA support for the SaaS app only. All emission points are
gated on `locals.isTenantHost` (set in `src/hooks.server.ts` from the unit-tested
`resolveHostReroute()`):

1. manifest link / theme-color / apple-touch-icon in `src/routes/+layout.svelte`,
2. the `/manifest.webmanifest` endpoint (404 on tenant hosts),
3. manual service-worker registration (SvelteKit auto-registration disabled via
   `serviceWorker.register: false` in `vite.config.ts`).

Tenant origins (`*.saaskaya.com`, custom domains) therefore get **no** PWA today. Because a
service worker and manifest are scoped per-origin, every tenant site is an independent
installability candidate — a tenant-branded PWA is technically clean to add later.

## What "tenant PWA" would mean

- **Tenant-branded dynamic manifest** — a per-host `/manifest.webmanifest` generated from the
  tenant's `Site` data: `name`/`short_name` from `settings.siteName`, `theme_color`/
  `background_color` from the tenant theme tokens, `start_url: '/'` on the tenant origin.
- **Icons** — requires a tenant icon/logo slot. This **touches the Zod `Site` schema**
  (`src/lib/schema/site.ts` — the platform's single contract) plus editor UI (media upload via
  the existing R2 pipeline, `src/lib/server/media.ts`) and a raster pipeline for 192/512/
  maskable sizes. This is the main cost driver and the reason this is separately scoped.
- **Service worker (optional, later)** — tenant sites are mostly static published snapshots, so
  an offline-cache SW is plausible, but versioning must key on the published site version, and
  the SW must be served per-origin. Not needed for installability alone (manifest + icons
  suffice for Add-to-Home-Screen on Android; iOS uses apple-touch-icon).

## Suggested milestones (when picked up)

1. Schema + editor: optional `settings.icon` (R2 media reference) with quality checks.
2. Host-branched manifest endpoint: replace the tenant-host 404 with a tenant manifest built
   from the published snapshot; keep the SaaS manifest on the app host.
3. Icon rasterization at publish time (or on-demand with caching).
4. (Optional) per-origin SW with published-version cache keys.

## Constraints to respect

- Constitution: no per-tenant custom code/CSS; everything flows through the shared renderer
  and the `Site` schema.
- `requestProbes.ts` treats `apple-touch-icon*` 404s as benign — revisit once tenant icons
  exist so real misses surface.
