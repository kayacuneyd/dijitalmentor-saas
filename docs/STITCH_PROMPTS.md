# saaskaya — Google Stitch UI Prompt Chain

> **Purpose:** Feed these prompts sequentially into Google Stitch to generate each page's UI.
> Each prompt is self-contained — Stitch can build the page from it alone.
> The prompts follow the actual codebase structure (SvelteKit routes, DaisyUI components, Zod schema).

---

## 0. Project Overview (feed this first as context)

```
Build a SaaS web application called "saaskaya" — a WaaS (Website-as-a-Service) / progressive CMS platform.

CORE IDEA:
A person describes themselves in a chat → an AI generates a multilingual website as validated JSON → they preview it live in 3 viewports (mobile/tablet/desktop) → edit the copy → publish it on their own domain.

TECH STACK:
- SvelteKit + TailwindCSS + DaisyUI (component library)
- Zod schema as the single contract (AI fills JSON, never writes HTML)
- PostgreSQL (central) + per-tenant SQLite
- Claude AI (tool-use, schema-constrained generation)
- Stripe (billing), Caddy (on-demand TLS), Resend (email), Cloudflare R2 (media)

DESIGN SYSTEM:
- Framework: DaisyUI (TailwindCSS plugin) — use DaisyUI component classes (btn, card, badge, alert, input, textarea, select, tabs, chat-bubble, hero, collapse, menu, join, toggle, loading)
- Themes: 3 niche presets (law, psych, dental) with different color palettes + fonts + corner radius
- Responsive: mobile-first, 3 viewport widths (375px / 768px / 100%)
- Multilingual: TR / EN / DE — all content has per-locale variants
- Dark mode ready (DaisyUI base-100/base-200/base-300 color system)

COLOR PRESETS:
- Law:      primary=#1e3a5f, secondary=#b08d57, accent=#27548a, fonts: Playfair Display + Inter, radius: sm
- Psych:    primary=#2f6f6a, secondary=#9ec5ab, accent=#e8998d, fonts: Lora + Open Sans, radius: lg
- Dental:   primary=#0e7490, secondary=#38bdf8, accent=#f59e0b, fonts: Poppins + Roboto, radius: md

BLOCK LIBRARY (fixed component set — sites are composed only from these):
1. Hero      — variants: centered, split | backgrounds: plain, gradient, image
2. About     — variants: text, text-image
3. Services  — variants: grid, list | columns: 2-4
4. Gallery   — variants: grid, carousel
5. Contact   — variants: form, split | fields: email, phone, address
6. CTA       — variants: banner, boxed
7. FAQ       — variants: accordion, list
8. Team      — variants: grid, cards
9. Footer    — variants: simple, columns

SITE SCHEMA (the JSON contract):
Site = { id, tenantId, domain?, defaultLocale, locales[], theme, nav, pages[], settings }
Page = { slug, title:{tr,en,de}, sections: Section[] }
Section = { id, type, props:{variant, layout, ...}, content:{tr:{...}, en:{...}, de:{...}} }
Theme = { preset, colors:{primary,secondary,accent}, fonts:{heading,body}, radius }

USER ROLES:
- Visitor: can browse landing page, demo sites, sign in
- User (tenant owner): dashboard, editor, messages, billing
- Admin: everything + settings panel (credentials, system status)
```

---

## 1. Landing Page (`/`)

```
Build the landing/home page for "saaskaya".

LAYOUT:
- Centered, max-width 2xl (672px), full viewport height, padding 8
- Top-right nav: if logged in show user email + "Dashboard" button; else "Sign in" ghost button
- H1: "saaskaya" (4xl, bold)
- Subtitle: "WaaS / progressive CMS — describe yourself, get a multilingual site as validated JSON, edit it live, publish it on your own domain." (base-content/70)
- Primary CTA button (btn-primary btn-lg): "Describe yourself → get your site" → links to /new
- Section label: "Demo sites" (sm, uppercase, tracking-wide, base-content/60)
- Demo site list: 3 cards (one per niche preset: law, psych, dental)
  Each card shows:
  - Site name (link, font-semibold) + preset badge (badge-primary)
  - Page count + locale badges (TR/EN/DE) as outline badges
  - "Edit" button (btn-primary btn-xs) → /editor/{id}

STYLE:
- DaisyUI: btn, btn-sm, btn-ghost, btn-lg, btn-primary, card, card-border, badge, badge-primary, badge-outline, badge-sm, link, link-hover
- Background: default (base-100)
- Text colors: base-content, base-content/70, base-content/60, base-content/50
- Centered flex column, justify-center, min-h-screen

INTERACTIONS:
- Clicking site name opens preview
- Clicking locale badge opens preview with that locale
- Clicking Edit opens editor
```

---

## 2. New Site / Describe Yourself (`/new`)

```
Build the "Describe yourself" page where users describe their business and the AI generates a site.

LAYOUT:
- Centered, max-width 2xl, full viewport height, padding 8, flex column, justify-center, gap-6
- Back link: "← saaskaya" (sm, base-content/50, hover:underline) → /
- H1: "Describe yourself" (3xl, bold)
- Description paragraph: "Who are you, what do you do, who are your clients? Write it in your own language — the AI builds a multilingual site (TR/EN/DE) from it. You can edit everything afterwards." (base-content/70)
- Large textarea (8 rows, w-full, text-base) with placeholder:
  "Örn: Ben Av. Zeynep Demir. İstanbul'da 12 yıldır aile hukuku ve boşanma davalarına bakıyorum. Ofisim Kadıköy'de…"
- Error alert (alert-error, hidden by default)
- Generate button (btn-primary btn-lg, full width):
  - Default state: "Generate my site"
  - Busy state: loading spinner + "Building your site — this takes about a minute…"
  - Disabled when text < 30 characters or busy
- Helper text (xs, base-content/50): "The AI fills a fixed, validated site structure — it never writes code. Generation uses your monthly AI budget; direct text and color edits in the editor are always free."

STYLE:
- DaisyUI: textarea, btn, btn-primary, btn-lg, alert, alert-error, loading, loading-spinner
- Clean, focused, single-purpose page
- The textarea is the hero element — large and inviting

INTERACTIONS:
- Button disabled until ≥30 chars typed
- On submit: POST to /api/sites with { description }, on success redirect to /editor/{id}
- Show error alert on failure
```

---

## 3. Login / Magic Link (`/login`)

```
Build the sign-in page using magic-link (passwordless) authentication.

LAYOUT:
- Centered, max-width md (448px), full viewport height, padding 8, flex column, justify-center, gap-6
- Back link: "← saaskaya" (sm, base-content/50, hover:underline) → /
- H1: "Sign in" (3xl, bold)
- Description: "No password — we email you a one-time sign-in link. First sign-in creates your account." (base-content/70)

TWO STATES:

State A — Form (default):
- Email input (input-lg, w-full, type=email, required, placeholder "you@example.com")
- Error message if any (text-error, sm)
- Submit button (btn-primary btn-lg, w-full): "Email me a sign-in link"
  - Busy state: loading spinner
- Form is enhanced (no full page reload)

State B — Link sent (after submit):
- Success alert (alert-success): "Sign-in link sent to {email}. It is valid for 15 minutes."
- Dev mode note (if applicable, alert, xs): "Dev mode: open your sign-in link" with a link

STYLE:
- DaisyUI: input, input-lg, btn, btn-primary, btn-lg, alert, alert-success, loading, loading-spinner, link
- Minimal, trustworthy, no distractions
- Single email field is the only input

INTERACTIONS:
- Submit sends POST with email
- On success: show "link sent" state
- Link expires in 15 minutes
```

---

## 4. Dashboard (`/dashboard`)

```
Build the user dashboard — lists all sites for the logged-in user with billing and domain management.

LAYOUT:
- Centered, max-width 3xl (768px), min-h-screen, padding 8, flex column, gap-6

HEADER:
- Back link: "← saaskaya" (sm, base-content/50)
- H1: "Your sites" (3xl, bold)
- User email (sm, base-content/60)
- Action buttons (flex-wrap, gap-2):
  - "+ New site" (btn-primary) → /new
  - "⚙ Settings" (btn-outline, admin only) → /admin/settings
  - "Sign out" (btn-ghost, form POST to /logout)

PLAN SECTION (card, bg-base-200):
- "Plan:" label + badge:
  - Active: badge-success "Pro"
  - Grace: badge-warning "Pro · grace" + helper text about grace period end date
  - Free: badge-ghost "Free" + "Custom domains need the Pro plan."
- If not active + billing configured: "Upgrade to Pro" button (btn-primary btn-sm, POST to /api/billing/checkout)
- If billing not configured: "Billing not configured yet." (xs, base-content/50)

ALERTS (conditional):
- Published: success alert "Published {name} as v{version}"
- Unpublished: alert "Unpublished {name}"
- Domain attached: success alert "{domain} attached. {provision message}"
- Domain detached: alert "Domain removed from {name}"

EMPTY STATE:
- Card (bg-base-200) with centered content:
  "No sites yet. Describe yourself and the AI builds your first one."
  "Create your first site" button (btn-primary) → /new

SITE LIST (if sites exist):
- Vertical list (flex-col, gap-3), each site is a card (card-border, bg-base-200):
  Card body:
  - Top row: site name (truncate, font-semibold) + site id + updated date (xs, base-content/50)
    + status badge: "live · v{version}" (badge-success) or "draft only" (badge-ghost)
  - Action buttons (flex-wrap, gap-2):
    - "Edit" (btn-sm btn-primary) → /editor/{id}
    - "Preview" (btn-sm btn-ghost, new tab) → /preview/{id}
    - "Publish" / "Republish" (btn-sm, form POST)
    - "View live ↗" (btn-sm btn-ghost, if published) → live URL
    - "Unpublish" (btn-sm btn-ghost text-error, if published)
    - "✉ Messages" (btn-sm btn-ghost) → /dashboard/{id}/messages + unread count badge
    - "⬇ Export" (btn-sm btn-ghost, download) → /api/sites/{id}/export
  - Domain section (border-t, pt-3):
    - If domain exists: show domain (link, font-mono) + "Remove" button (btn-xs btn-ghost text-error)
    - If no domain: input (input-sm, w-52, font-mono, placeholder "yourdomain.com")
      + "Attach my domain" button (btn-sm, disabled if free plan)
      + "Register & attach" button (btn-sm btn-outline, if Porkbun configured, disabled if free plan)

STYLE:
- DaisyUI: card, card-border, badge, badge-success, badge-warning, badge-ghost, badge-primary, badge-sm, badge-xs
- btn, btn-sm, btn-primary, btn-ghost, btn-outline, btn-xs
- input, input-sm, alert, alert-success, alert-error, link, font-mono
- flex-wrap for responsive button rows

INTERACTIONS:
- All publish/unpublish/domain actions are form POSTs with enhance
- Domain attach requires Pro plan (disabled on free)
- Export downloads JSON
```

---

## 5. Messages (`/dashboard/[siteId]/messages`)

```
Build the messages page — shows contact-form submissions for a specific site.

LAYOUT:
- Centered, max-width 3xl, min-h-screen, padding 8, flex column, gap-6

HEADER:
- Back link: "← dashboard" (sm, base-content/50)
- H1: "Messages" (3xl, bold)
- Subtitle: "Contact-form submissions for {siteName}" (sm, base-content/60)

EMPTY STATE:
- Card (bg-base-200) with centered text: "No messages yet."

MESSAGE LIST (if messages exist):
- Vertical list (flex-col, gap-3), each message is a card (card-border, bg-base-200):
  Card body (gap-2, py-4):
  - Top row: sender name (font-semibold) + date + locale badge (xs, base-content/50)
  - Email link (link, link-hover, sm) — mailto:{email}
  - Message body (sm, whitespace-pre-line)

STYLE:
- DaisyUI: card, card-border, link, link-hover
- Clean, readable, email-inbox feel
- Messages sorted newest first

INTERACTIONS:
- Click email opens mail client
- No reply UI (read-only view)
```

---

## 6. Editor (`/editor/[siteId]`) — THE COMPLEX PAGE

```
Build the site editor — a full-screen 2-panel layout with sidebar tabs and live iframe preview.

LAYOUT:
- Full screen (h-screen, overflow-hidden, bg-base-200)
- Two panels: left sidebar (w-96, fixed) + right preview section (flex-1)

LEFT SIDEBAR (aside, w-96, shrink-0, border-r, bg-base-100, flex-col):

  HEADER (border-b, px-4, py-3):
  - Top: "saaskaya" link (xs, base-content/50) → /
  - Site name (truncate, font-semibold)
  - Save status badge (badge-sm):
    - saved → badge-success "Saved"
    - dirty → badge-warning "Unsaved"
    - saving → badge-info "Saving…"
    - error → badge-error "Save failed"

  TAB BAR (tabs-box, m-3, shrink-0):
  - 6 tabs: Chat, Content, Theme, Pages, Languages, Settings
  - Active tab highlighted (tab-active)
  - Each tab is a button (tab, grow, px-2, text-xs)

  TAB CONTENT (flex-1, overflow-y-auto, px-4, pb-6):
  Switches based on active tab:

  TAB: Chat
  - Helper text (xs, base-content/50): "Ask for creative or structural changes. Plain text and color edits are faster in the Content and Theme tabs — they never use the AI."
  - Chat message list (flex-col, gap-2, overflow-y-auto, min-h-32, flex-1):
    - User messages: chat-end, chat-bubble-primary, text-sm
    - Assistant messages: chat-start, chat-bubble, text-sm
    - Error messages: alert-error, px-3, py-2, text-xs
    - Loading: chat-start with loading-dots
  - Input form (flex, gap-2):
    - Text input (input-sm, flex-1, placeholder "e.g. Add a pricing FAQ…")
    - "Send" button (btn-primary btn-sm, disabled when empty or busy)

  TAB: Content
  - Page selector (select-sm, w-full): shows page title + slug for each page
  - Helper text (xs): "Editing {LOCALE} copy — switch the locale in the toolbar. Edits go straight to the draft (no AI)."
  - Section list: each section is a collapse (collapse-arrow, bg-base-200):
    - Summary: section type (capitalize, font-semibold) + section id (xs, base-content/40)
    - Content: editable fields for the current locale's content (text inputs, textareas depending on field type)

  TAB: Theme
  - Niche preset selector (select-sm): law, psych, dental
  - Brand colors fieldset (border, rounded-field, p-3):
    - 3 color pickers: primary, secondary, accent
    - Each: label (capitalize) + hex code (xs, font-mono) + color input (h-8, w-12, rounded)
  - Fonts fieldset (border, rounded-field, p-3):
    - Heading font input (input-sm)
    - Body font input (input-sm)
  - Corner radius selector (select-sm): none, sm, md, lg, full

  TAB: Pages
  - Page list (menu, bg-base-200, rounded-box, w-full):
    - Each page: button with title (truncate) + slug (xs, base-content/40)
    - Active page highlighted (menu-active)
  - "Add page" fieldset (border, rounded-field, p-3):
    - Slug input (input-sm, placeholder "about-us")
    - 3 title inputs: TR, EN, DE (input-sm each)
    - Error text if validation fails (text-error, xs)
    - "Add page" button (btn-primary btn-sm)
    - Helper: "New pages start with a hero section and are added to the navigation."

  TAB: Languages
  - "Editing locale" fieldset (border, rounded-field, p-3):
    - Join button group: TR / EN / DE (active = btn-primary, else btn-ghost)
    - Helper: "The Content tab and the preview follow this locale."
  - Default locale selector (select-sm)
  - Enabled locales: badge-outline for each (TR, EN, DE)
  - Helper: "All sites ship with TR/EN/DE content; per-site locale toggles arrive with publishing."

  TAB: Settings
  - Site name input (input-sm)
  - Contact email input (input-sm, type=email)
  - "Powered by saaskaya" badge toggle (toggle-primary, toggle-sm)
  - Domain display: domain or "No domain yet — real domain registration arrives in M5." (xs, base-content/50)

RIGHT PREVIEW SECTION (flex-1, flex-col, min-w-0):

  TOOLBAR (border-b, bg-base-100, flex-wrap, justify-between, px-4, py-2):
  - Left: viewport toggle (join group):
    - "Mobile" (375px) / "Tablet" (768px) / "Desktop" (100%)
    - Active = btn-primary, else btn-ghost
  - Right (flex, gap-2):
    - Locale selector (select-sm): TR / EN / DE
    - "Save now" button (btn-sm)
    - "Open ↗" link (btn-ghost btn-sm, new tab) → preview URL
    - Publish button (btn-sm btn-success):
      - If not published: "Publish"
      - If published: "Republish (v{version} live)"
      - Busy state: loading spinner

  PREVIEW AREA (flex-1, justify-center, overflow-auto, p-4):
  - Container div with dynamic width (375px / 768px / 100%), transition-[width] duration-200
  - Rounded-lg, shadow-lg, overflow-hidden, h-full, bg-base-100
  - iframe inside (h-full, w-full) showing the live site preview
  - Width animates smoothly when switching viewports

STYLE:
- DaisyUI: tabs, tab, tab-active, tabs-box, btn, btn-sm, btn-primary, btn-ghost, btn-success, btn-xs, btn-lg
- badge, badge-sm, badge-success, badge-warning, badge-info, badge-error, badge-primary, badge-outline
- input, input-sm, textarea, select, select-sm, card, collapse, collapse-arrow, menu, menu-active
- chat, chat-end, chat-start, chat-bubble, chat-bubble-primary, loading, loading-dots, loading-spinner
- toggle, toggle-primary, toggle-sm, join, join-item, rounded-field, rounded-box, rounded-lg
- shadow-lg, shadow-sm, border-base-300, bg-base-100, bg-base-200, bg-base-300

INTERACTIONS:
- Tab switching updates the sidebar content
- Viewport toggle animates the iframe container width
- Locale selector changes both the editing locale and preview locale
- All text/theme edits postMessage to the iframe for live re-render (no reload)
- Autosave (debounced) + "Save now" button
- Publish creates an immutable published snapshot
- Chat sends messages to /api/sites/{id}/chat, receives updated site JSON
```

---

## 7. Admin Settings (`/admin/settings`)

```
Build the admin settings panel — credentials management + system status.

LAYOUT:
- Centered, max-width 3xl, min-h-screen, padding 8, flex column, gap-6

HEADER:
- Back link: "← dashboard" (sm, base-content/50)
- H1: "Credentials & settings" (3xl, bold)
- Description (sm, base-content/60): "Values saved here live in the database and win over .env — no redeploy needed. Secrets are write-only: once saved, only the last characters are shown."

ALERTS (conditional):
- Saved: alert-success "Saved {key}."
- Cleared: alert "Cleared {key} (env fallback applies)."
- Error: alert-error "{message}"

SYSTEM STATUS SECTION (card, bg-base-200):
- Header row: "System status" (lg, font-semibold) + health badge:
  - healthy → badge-success
  - degraded → badge-error
- Status grid (grid-cols-2, sm:grid-cols-3, gap-x-6, gap-y-2, text-sm):
  - Database: status + DB size (formatted: KB/MB)
  - Disk: status
  - App uptime: formatted (Xd Yh or Xh Ym)
  - Sites / users: count
  - Last backup: timestamp or "none yet — scripts/backup.sh runs nightly via cron"

CREDENTIALS SECTIONS (5 groups, each a card bg-base-200):
Groups: AI, Email, Billing, Domains, Ops

Each group card:
- H2: group name (lg, font-semibold)
- For each setting in the group:
  - Label (sm, font-medium) + key (xs, font-mono, base-content/40) + source badge if from db
  - Input row (flex, gap-2):
    - Form with hidden key + value input:
      - type=password if secret, type=text otherwise
      - input-sm, flex-1, font-mono
      - placeholder shows current value or "not set"
      - autocomplete=off
    - "Save" button (btn-sm btn-primary)
    - "Clear" button (btn-sm btn-ghost text-error, only if source=db)
  - Help text (xs, base-content/50) if available

STYLE:
- DaisyUI: card, badge, badge-success, badge-error, badge-ghost, badge-xs
- input, input-sm, btn, btn-sm, btn-primary, btn-ghost, text-error
- alert, alert-success, alert-error, font-mono, link
- grid, grid-cols-2, sm:grid-cols-3

INTERACTIONS:
- Each setting has its own save form (POST ?/save with key + value)
- Clear removes the DB value (POST ?/clear with key), falls back to env
- Secrets are write-only (password field, placeholder shows masked value)
- No page reload (enhance forms)
```

---

## 8. Public Site — Rendered Blocks (the actual websites)

```
Build the public-facing website renderer — this is what visitors see when they visit a published site.

STRUCTURE:
- SiteHeader: navigation bar with site name + nav links (one per page) + locale switcher
- Page sections: rendered sequentially from the Site JSON
- Each section is one of 9 block types (see below)
- "Powered by saaskaya" badge in footer if enabled

SITE HEADER:
- Sticky top bar, bg-base-100, border-b
- Left: site name (font-semibold)
- Center/right: nav items (links to pages, locale-prefixed)
- Locale switcher: TR / EN / DE dropdown or badges

BLOCK 1: HERO
Variants:
  centered (default):
  - Full-width section, min-h-[60vh]
  - Backgrounds: plain (base-100), gradient (from-primary/15 via-base-100 to-secondary/25), image (with overlay)
  - Centered content: H1 (4xl/5xl bold) + optional subheadline (lg, opacity-85) + optional CTA button (btn-primary btn-lg)
  split:
  - 2-column grid (md:grid-cols-2), bg-base-200
  - Left: H1 + subheadline + CTA button
  - Right: image (aspect-4/3, rounded, object-cover)

BLOCK 2: ABOUT
Variants:
  text:
  - Centered section, max-w-6xl, py-16
  - H2 (3xl bold) + body paragraph (opacity-80)
  text-image:
  - 2-column: text + image side by side

BLOCK 3: SERVICES
Variants:
  grid (default):
  - Centered title + optional intro
  - Grid of cards (sm:grid-cols-2, lg:grid-cols-{2-4})
  - Each card: name (card-title) + description + optional price badge (badge-secondary badge-outline)
  list:
  - Centered title + optional intro
  - Divided list (divide-y), each row: name + description (left) + price badge (right)

BLOCK 4: GALLERY
Variants:
  grid (default):
  - Optional title
  - Responsive image grid
  carousel:
  - Optional title
  - Horizontal scrollable image row

BLOCK 5: CONTACT
Variants:
  form (default):
  - Centered title + optional description
  - Contact form (max-w-xl): name, email, message, submit
  - Form disabled in preview mode (only works on published site)
  - Success/error states
  split:
  - 2-column: contact info (email, phone, address) + form
  - Form same as above

BLOCK 6: CTA
Variants:
  banner:
  - Full-width banner, primary background
  - Centered: title + optional subtitle + button (btn-primary or btn-neutral)
  boxed:
  - Centered card with title + subtitle + button

BLOCK 7: FAQ
Variants:
  accordion (default):
  - Optional title
  - Collapsible items (collapse-arrow), click to expand
  list:
  - Optional title
  - Simple Q&A list

BLOCK 8: TEAM
Variants:
  grid (default):
  - Optional title
  - Grid of member cards: photo + name + role + optional bio
  cards:
  - Optional title
  - Card-style members with shadow

BLOCK 9: FOOTER
Variants:
  simple (default):
  - Footer text + optional links
  columns:
  - Multi-column footer with links

STYLE:
- All blocks use DaisyUI theme variables (primary, secondary, accent, base-100/200/300)
- Theme colors applied via CSS variables from the Theme schema
- Fonts loaded from Theme.fonts (heading + body)
- Corner radius from Theme.radius (none/sm/md/lg/full → DaisyUI rounded-* classes)
- Responsive: all blocks work at 375px, 768px, and desktop
- No horizontal overflow at 375px

LOCALE BEHAVIOR:
- All text comes from content[locale] — the renderer picks the right locale
- Nav links are locale-prefixed (/en/about, /de/kontakt, etc.)
- Contact form labels are localized (platform UI dictionary, not tenant content)
```

---

## 9. Responsive Behavior Summary

```
ALL PAGES must be responsive across 3 breakpoints:

MOBILE (375px):
- Single column layouts
- Editor sidebar becomes full-width overlay or collapsible
- Dashboard cards stack vertically
- Button rows wrap (flex-wrap)
- Nav becomes hamburger menu
- No horizontal overflow

TABLET (768px):
- 2-column grids where applicable
- Editor sidebar visible, preview takes remaining width
- Dashboard site cards show full action rows

DESKTOP (100%):
- Full multi-column layouts
- Editor: fixed 384px sidebar + flexible preview
- Dashboard: max-width 768px centered
- Public site: max-width 6xl (1152px) content containers

TRANSITIONS:
- Viewport width changes animate smoothly (transition-[width] duration-200)
- Tab switches are instant
- Theme color changes apply live (no reload)
```

---

## Usage Instructions

1. **Feed prompt 0 first** as project context
2. **Feed prompts 1-8 sequentially** — each builds one page
3. **Prompt 8** covers the public site blocks (can be split further if Stitch needs per-block prompts)
4. **Prompt 9** is a reference for responsive behavior across all pages

Each prompt is designed to be **self-contained** — Stitch can generate the page UI from it without needing the other prompts. The project context (prompt 0) should be provided once at the start.

The generated UI should use **DaisyUI component classes** exclusively (not raw Tailwind for components) to match the actual codebase. Colors and fonts come from the 3 niche presets.
