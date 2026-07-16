# Two-Layer AI Gatekeeper Spec — saaskaya

> **Revisions (2026-07-08, approved & implemented — Phase 1).** The review against the live code
> and current model pricing changed several decisions below; where this block and the original
> text disagree, this block wins:
>
> 1. **Layer 1 = Claude Haiku 4.5, not Groq.** The gate rides the existing `runToolCall` seam
>    with a `model` override (`GATEKEEPER_MODEL` setting, default `claude-haiku-4-5`) — no
>    provider files, no third-party data flow (KVKK/GDPR), no constitution amendment needed
>    (every layer stays Claude tool-use). `providers/groq.ts`, `providers/claude-haiku.ts`,
>    `GROQ_API_KEY` and `GATEKEEPER_PROVIDER` were dropped; the model setting is the future
>    escape hatch, and switching to a non-Claude provider WILL require the §2 amendment then.
> 2. **Layer 2 is risk-routed.** Low risk → `AI_MODEL_LIGHT` (default `claude-sonnet-5`);
>    medium/high risk, force-sends and generation → `AI_MODEL` (default `claude-opus-4-8`).
>    The safety guarantee comes from `siteSchema.safeParse` + one repair, not from the model.
> 3. **Prompt caching added** (missing from the original spec): `cache_control` on the system
>    block caches the tools+system prefix across all tenants — reads bill ~0.1×.
> 4. **Honest risk framing:** chat edits change the **draft**, never the live site (publish is a
>    separate action). The approval card exists for budget consciousness and intent confirmation.
>    Consequently low-risk edits auto-apply with one-click **Geri Al** (undo); the card shows
>    only for medium/high risk. Questions are answered by the gate itself (0 Layer-2 tokens).
> 5. **Credits replace the "×0.1 token weight" idea** (which contradicted the plan table):
>    1 applied edit = 1 edit credit, 1 generation = 1 generation credit; gate calls are free;
>    `AI_MONTHLY_TOKEN_LIMIT` stays as an abuse backstop. Limits: `AI_EDITS_FREE/PRO` (10/50),
>    `AI_GENERATIONS_FREE/PRO` (1/5). Admins bypass credits (smoke tests), never the backstop.
> 6. **Telemetry added:** `ai_gate_log` table + admin Ops-card counters validate the off-topic /
>    approval-rate assumptions the cost model rests on. Cancels = proposed − approved.
> 7. **Confirm is stateless:** the client resends `{message, approvedPrompt, riskLevel}`; the
>    distilled prompt AND the original message both go to Layer 2 (no information loss). Chat
>    history lives client-side only; the last ~6 turns are sent to the gate per request.
> 8. Expected saving vs. the original ~50%: roughly **75–85%** once routing + caching +
>    gate-answered questions are counted (telemetry will measure the real number).
>
> Phase 2 (top-up + `topups` idempotency table, human-help flow, 🟢🟡🔴 budget dot, Premium
> tier via a second Stripe price, auto-approve toggle, response streaming) remains as specced.

## Goal

Add a conversational onboarding + two-layer AI architecture to control token costs, improve user
experience, and open monetization channels (top-up AI budget, human help). Layer 1 (gatekeeper)
classifies intent, distills the user's request into a structured prompt, and assesses risk before
the expensive Layer 2 (Claude agent) runs. Users approve the distilled prompt before any site
mutation occurs.

## Motivation

- **Cost control:** every chat message currently calls Claude Opus (~$0.10–0.30/msg). Off-topic or
  low-value messages burn the tenant's monthly budget for nothing.
- **User experience:** a conversational onboarding feels natural ("tell me about your site") instead
  of a raw prompt box. The approval card makes AI changes transparent and reviewable.
- **Risk awareness:** users must understand that chat edits change their live site — this is not a
  toy. The approval step enforces conscious consent.
- **Monetization:** exhausted budgets can be topped up (+€10). Premium users can request human help.
  Direct text/color edits remain free forever (no AI, no token cost).
- **Constitution alignment:** `PRODUCT_VISION_V2.md` §4.1 says "Chat-first, editor-second." §4.6
  says "Payment-gated power." §6 lists "human review/help request" under Premium. This spec
  implements those directions.

## Architecture

```
User message (chat)
    │
    ▼
Layer 1 — Gatekeeper (Groq Llama 3.3 70B / Claude Haiku fallback)
  • Classify: relevant | off-topic | help_request
  • Distill: structured prompt summarizing the concrete change
  • Risk: low | medium | high (theme change, page delete, etc.)
  • Token cost: ~500–1000 (cheap)
    │
    ├─ off-topic → polite refusal (0 Layer-2 tokens)
    ├─ help_request → human help flow (see Monetization)
    │
    ▼  (relevant)
Approval card in ChatTab:
  "Anladığım kadarıyla: [distilled prompt]. Onaylıyor musun?"
  [✓ Uygula]  [✗ İptal]  [✎ Düzenle]
    │
    ▼  (user approves)
Layer 2 — Agent (Claude Opus, existing patch_site / create_site)
  • Constitutional system prompt includes the distilled + approved prompt
  • Tool-use constrained to Zod schema (constitution §2 unchanged)
  • One repair round-trip on validation failure
  • Token cost: ~8000 (existing)
    │
    ▼
Validated patch applied → draft updated → preview re-renders
```

### Provider strategy

| Layer     | Primary                                    | Fallback                  | Why                                                                                         |
| --------- | ------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------- |
| 1 (gate)  | Groq Llama 3.3 70B (free tier, ~500 tok/s) | Claude Haiku ($0.001/msg) | Gate is text-only classification — any JSON-capable model works. Groq is free + fast.       |
| 2 (agent) | Claude Opus (existing)                     | —                         | Constitution §2 requires Claude tool-use for schema-constrained generation. Non-negotiable. |

Provider selection is runtime-configurable via `/admin/settings` (`GATEKEEPER_PROVIDER` setting,
DB → env fallback, same pattern as existing credentials). This avoids lock-in and lets the operator
switch providers without a redeploy.

### Constitution amendment (to be logged in `docs/PROGRESS.md`)

Current §2: "Generation uses Claude tool-use constrained to the schema."

Amended interpretation:

> Schema-constrained generation (Layer 2) uses Claude tool-use. Intent classification and prompt
> distillation (Layer 1) may use any provider that returns valid JSON, provided the output is
> validated against the gatekeeper Zod schema before use.

This is a clarification, not a principle change — the safety guarantee (no invalid output ever
reaches the renderer) is preserved because Layer 1 never produces site mutations.

## User-facing surfaces

### ChatTab — conversational onboarding

First message in a fresh chat session:

> Merhaba! Siten hakkında konuşalım. Ne değiştirmek istersin?

After each user message, the gatekeeper response renders as an **approval card**:

```
┌──────────────────────────────────────────┐
│ 📋 Anladığım kadarıyla:                  │
│                                          │
│ 1. Tüm site renklerini sıcak tonlara     │
│    güncelleyeceğim                       │
│ 2. Hizmetlere fiyat göstergesi ekleyeceğim│
│                                          │
│ ⚠️ Bu değişiklikler siteni etkileyecek.  │
│    Onaylıyor musun?                      │
│                                          │
│  [✓ Uygula]  [✗ İptal]  [✎ Düzenle]     │
└──────────────────────────────────────────┘
```

Risk-aware copy:

- **Low risk** (text tweak): `ℹ️ Bu değişiklik sitenin metnini güncelleyecek.`
- **Medium risk** (theme/structure): `⚠️ Bu değişiklik sitenin görünümünü değiştirecek.`
- **High risk** (page delete / full theme swap): `⚠️ DİKKAT: Bu değişiklik büyük. Yayınlamadan önce preview'da kontrol et.`

Persistent helper text below the chat input:

> ℹ️ Sohbetin siteni değiştirir. Her istek onaylandıktan sonra uygulanır. İptal edersen hiçbir şey
> değişmez. AI bütçeni sadece onayladığın değişiklikler tüketir.

### Dashboard — budget indicator

A colored dot next to the site name (no exact token count shown to the user):

- 🟢 `AI bütçen: bol`
- 🟡 `AI bütçen: azaldı` (helper: "bu ay az kaldı")
- 🔴 `AI bütçen: bitti` (helper: "önümüzdeki ay sıfırlanır")

When red, the dashboard shows options:

> 🔴 Bu ayki AI bütçen doldu.
>
> Seçeneklerin:
> • Önümüzdeki ay bekle (otomatik sıfırlanır)
> • +10€ ile ek bütçe al [Satın al →]
> • Direct metin/renk düzenlemeleri her zaman ücretsiz
> • Bizimle iletişime geç, yardım isteyin [İletişim →]

### Off-topic handling

If the gatekeeper classifies a message as off-topic (not about the user's site), the chat shows a
polite redirect — **no Layer-2 call, no token burn**:

> Bu konu sitenle ilgili değil gibi — site inşası için yardımcı olabilirim. Renk, metin, sayfa,
> hizmetler gibi konularda sorabilirsin.

The user can still force-send with a "yine de gönder" option, but that path consumes Layer-2 tokens
and is logged.

## Monetization

### AI budget top-up (+€10)

- Stripe one-time payment (`src/routes/api/billing/topup/+server.ts`).
- Adds a `topUpTokens` column to `aiUsage` (or a separate `aiTopUps` table).
- Top-up tokens do not expire at month reset (unlike the monthly quota).
- Top-up is plan-agnostic: Free, Pro, and Premium users can all buy extra budget.

### Human help request

- Gatekeeper detects `help_request` intent.
- UI offers:
  - Premium users: 1 free session/month, then paid.
  - Other users: €25/session.
- On approval, an email is sent to the operator with a distilled conversation summary.
- `src/routes/api/billing/help/+server.ts` handles the request + payment.

### Plan-based limits (aligned with `PRODUCT_VISION_V2.md` §6)

| Feature                  | Free  | Pro   | Premium   | Top-up       |
| ------------------------ | ----- | ----- | --------- | ------------ |
| Site generation          | 1/mo  | 5/mo  | unlimited | —            |
| Chat edits               | 10/mo | 50/mo | 200/mo    | +10€ = +50   |
| Direct edit (text/color) | ∞     | ∞     | ∞         | —            |
| Custom domain            | —     | ✓     | ✓         | —            |
| Badge removal            | —     | —     | ✓         | —            |
| Human help               | —     | —     | ✓ (1/mo)  | +25€/session |
| Extra AI budget          | —     | —     | —         | +10€         |

## Cost model

| Scenario (1000 msgs/mo)        | Old (single layer) | New (two-layer)           | Saving  |
| ------------------------------ | ------------------ | ------------------------- | ------- |
| 40% off-topic (rejected by L1) | 400 × $0.20 = $80  | 400 × $0 (Groq) = $0      | $80     |
| 50% approved → L2 runs         | 500 × $0.20 = $100 | 500 × ($0 + $0.20) = $100 | $0      |
| 10% cancelled at approval      | 100 × $0.20 = $20  | 100 × $0 (Groq) = $0      | $20     |
| **Total**                      | **$200**           | **$100**                  | **%50** |

With Groq free tier for Layer 1, the gatekeeper cost approaches $0. Fallback to Claude Haiku only
when Groq rate-limits or is unavailable.

## Implementation checklist

### Phase 1 — gatekeeper + approval flow (this milestone)

- [ ] `src/lib/server/ai/providers/groq.ts` — Groq API client (OpenAI-compatible, `response_format: json_object`)
- [ ] `src/lib/server/ai/providers/claude-haiku.ts` — Haiku fallback for Layer 1
- [ ] `src/lib/server/ai/gatekeeper.ts` — provider abstraction + intent classify + distill + risk assess
- [ ] `src/lib/server/ai/schemas.ts` — add `gatekeeperSchema` (relevant, distilledPrompt, riskLevel, intent, ops summary)
- [ ] `src/lib/server/ai/llm.ts` — comment update: "Layer 2 = Claude, Layer 1 = multi-provider"
- [ ] `src/lib/server/config.ts` — add `GROQ_API_KEY`, `GATEKEEPER_PROVIDER` settings
- [ ] `src/routes/api/sites/[siteId]/chat/+server.ts` — two-stage: gate → return distilled prompt → wait for `confirm` → agent
- [ ] `src/routes/api/sites/[siteId]/chat/+server.ts` — add `confirm` endpoint (approved prompt → Layer 2 agent)
- [ ] `src/routes/editor/[siteId]/ChatTab.svelte` — approval card UI + risk warnings + off-topic redirect
- [ ] `src/lib/server/ai/usage.ts` — Layer 1 tokens counted at ×0.1 weight (cheap gate shouldn't eat budget)
- [ ] `docs/POLICY.md` — add "AI Budget Policy" + "Top-up Policy" + "Human Help Policy" sections
- [ ] `docs/CONSTITUTION.md` — log amendment in `docs/PROGRESS.md` (multi-provider Layer 1)
- [ ] `docs/PROGRESS.md` — record the decision + rationale

### Phase 2 — monetization + dashboard (next milestone)

- [ ] `src/lib/server/db/schema.ts` — `aiUsage.topUpTokens` column (or `aiTopUps` table)
- [ ] `src/routes/api/billing/topup/+server.ts` — Stripe one-time payment for AI top-up
- [ ] `src/routes/api/billing/help/+server.ts` — human help request (email to operator)
- [ ] `src/routes/dashboard/+page.svelte` — budget dot (🟢🟡🔴) + top-up/help buttons
- [ ] `src/routes/editor/[siteId]/+page.svelte` — budget dot in editor toolbar
- [ ] Plan-tier enforcement in `assertWithinQuota()` (Free/Pro/Premium limits)
- [ ] `docs/PRODUCT_VISION_V2.md` — update V2.2 with conversational onboarding + approval flow

## Risks and mitigations

| Risk                                        | Mitigation                                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Gatekeeper wrongly rejects a valid request  | User can "yine de gönder" (force-send) — costs L2 tokens, logged                              |
| Approval step feels heavy for trivial edits | Low-risk edits show a compact card; "auto-approve" toggle for theme-only changes (future)     |
| Groq free-tier rate limit                   | Automatic fallback to Claude Haiku; fallback chain: Groq → Haiku → retry                      |
| Groq outage                                 | Fallback chain; operator can switch `GATEKEEPER_PROVIDER` to `claude-haiku` in admin settings |
| Layer 1 Turkish quality lower than Claude   | System prompt includes Turkish examples; Zod validation catches malformed output              |
| JSON format errors from Groq                | `response_format: json_object` + `gatekeeperSchema.safeParse` + one retry                     |
| Provider lock-in                            | Abstraction layer — single config change swaps provider                                       |

## Verification

- Unit test `gatekeeperSchema.safeParse` on good/bad fixtures (relevant, off-topic, help_request).
- Unit test the distill output format (structured prompt, risk level).
- E2E: send an off-topic message → no Layer-2 call, polite redirect shown.
- E2E: send a relevant message → approval card → approve → site changes → preview updates.
- E2E: cancel at approval → no site change, no Layer-2 token burn.
- E2E: Groq unavailable → Haiku fallback fires → same UX.
- `npm run check`, `npm run test`, `npm run build` all pass.
- Log the outcome in `docs/PROGRESS.md`.

## Open questions

- Exact monthly token limit per plan (Free/Pro/Premium) — needs operator decision.
- Groq free-tier daily request cap — needs testing under real load.
- Should the approval card support editing the distilled prompt before sending to Layer 2? (Phase 1:
  no; Phase 2: maybe.)
- Should "auto-approve" be available for low-risk edits to reduce friction? (Future iteration.)

## 2026-07-16 provider routing revision

The production default is now **DeepSeek V4 Flash → Groq fallback** for Layer 1. DeepSeek Flash is
used for cheap intent/risk classification and distillation; Groq is used once only after a transient,
rate-limit, network or malformed-tool-output failure. Authentication, balance and permanent 400/422
configuration errors do not silently fall through.

Layer 2 remains DeepSeek: low-risk copy edits use Flash, while medium/high-risk and structural edits
use DeepSeek V4 Pro. All output still passes the existing Zod schema, one-repair boundary and publish
quality gate. Provider/model/fallback metadata is recorded in `ai_gate_log` (migration v32).

The emergency rollback is configuration-only: set `GATEKEEPER_PROVIDER=groq` and optionally
`GATEKEEPER_FALLBACK_PROVIDER=deepseek` in `/admin/settings`. The exact provider prices and Groq
account limits remain operator-managed; Groq is not assumed to be permanently free.
