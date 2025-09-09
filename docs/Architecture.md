# Concillio – Arkitektur

En översikt av ramverkets komponenter, dataflöden och driftmodell. Fokus: enkel att förstå, enkel att drifta, enkel att utöka.

## 1) Huvudkomponenter

- **Cloudflare Pages/Workers (Edge)**
  - Kör Hono-appen (SSR + API).
  - Middleware: CSP, Rate limit, Idempotency, Request-ID.
- **Cloudflare D1 (SQLite)**  
  - `minutes`, `analytics_council`, `lineups_*`, `admin_audit` m.fl.
- **Cloudflare KV**
  - `PROGRESS_KV` för rådets körstatus.
  - `KV_RL`/`RL_KV` för rate-limit.
- **LLM-providerlager (`src/llm/`)**
  - `openai` (strict JSON, auto-repair, usage/kost) eller `mock`.
- **Roll-plugins (`src/plugins/roles/*`)**
  - Varje roll har `systemPrompt`, `schemaName`, `version`, `buildUserPrompt`.
- **Orkestrering (`src/utils/orchestrator.ts`)**
  - `callRole` → roller, `callSummarizer` → weighted consensus.
- **SSR & sidor**
  - `/council/*`, `/council/ask`, `/minutes/:id`, `/lineups*`, admin-vyer.
- **Delning & SEO**
  - `/og` (SVG-bild), `<meta>` för OG/Twitter.

## 2) Översikt (ASCII)



Browser ──▶ Cloudflare Pages (Hono/Workers)
│ │
│ ├── SSR HTML (rollsidor, minutes, admin)
│ ├── API: /api/council/consult ──────────▶ LLM Provider (OpenAI/Mock)
│ │ /api/lineups/* ▲
│ │ /api/analytics/council │ usage/tokens/cost
│ │ /api/progress/* │
│ │
│ ├── KV (rate-limit, progress)
│ └── D1 (minutes, analytics, lineups, audit)


## 3) Dataflöde – Rådssession (end-to-end)

1. **Klient** POST `/api/council/consult` med fråga + lineup (preset/custom/user).
2. **Middleware**: Request-ID, idempotency, rate-limit, CSP.
3. **Lineup**: normaliseras, snapshot byggs (källa, vikter).
4. **Orkestrering**:
   - `callRole` för STRATEGIST, FUTURIST, PSYCHOLOGIST, ADVISOR via `completeJSON()`.
   - `onUsage` registrerar `prompt_tokens`, `completion_tokens`, `model`, `cost_usd`.
5. **Summarizer**: vägd konsensus med lineup-vikter.
6. **Persist**: `minutes` + `lineup_snapshot` + versioner.
7. **Progress**: `roles → consensus → saved` i `PROGRESS_KV`.
8. **UI**: redirect till `/minutes/:id`.

## 4) Datamodell (D1 – nyckeltabeller)

- `minutes(id, question, context_json, roles_json, consensus_json, lineup_snapshot, lineup_preset_id, lineup_preset_name, prompt_version, schema_version, created_at)`
- `analytics_council(id, req_id, event, role, model, prompt_tokens, completion_tokens, cost_usd, latency_ms, schema_version, prompt_version, created_at)`
- `lineups_presets`, `lineups_preset_roles` (publika), `user_lineups`, `user_lineup_roles` (per uid)
- `admin_audit(id, req_id, ip_hmac, route, status, error, created_at)`

## 5) Miljövariabler (urval)

- **Providers**
  - `OPENAI_API_KEY`, `LLM_PROVIDER=openai|mock`
- **Säkerhet/ops**
  - `DEV=true` eller `ADMIN_IP_ALLOWLIST=ip1,ip2`
  - `AUDIT_HMAC_KEY`
- **Kost/alert**
  - `COST_LIMIT_USD`, `COST_WEBHOOK_URL`

Se `docs/Env.md` för full referens.

## 6) Säkerhet & Skydd

- **CSP**: strikt, endast nödvändiga källor.
- **Rate-limit**:
  - `/api/council/consult`: 2/s burst + 5/10 min per (ip+uid).
  - `/api/analytics/council`: 30/min per IP.
- **Idempotency**: på `/api/*`.
- **PII-scrub**: endast i analytics.
- **Admin-vyer**: DEV/IP-guard.

## 7) Observability

- **X-Request-Id** på alla svar.
- **Analytics**: events `role_done`, `consensus_done`, `minutes_saved` + versionsfält.
- **Admin**: health, analytics, cost, run-example.

## 8) Utbyggnad

- **Ny roll**: plugin under `src/plugins/roles/`, registrera i `src/plugins/index.ts`.
- **Ny provider**: implementera `LLMProvider` i `src/llm/providers/`.

## 9) Deployment

- **Build**: `npm run build`
- **Deploy**: `wrangler pages deploy dist --project-name concillio`
- **Migrations**: `wrangler d1 migrations apply concillio-production`
- **KV**: skapa/binda namespaces i `wrangler.jsonc`

## 10) Felhantering

- Global `app.onError`: loggar till `admin_audit`, svarar JSON + CSP/Referrer-Policy.
- `consult`: strikt JSON, auto-repair (1), snällt 501 om API-nyckel saknas.

## 11) Prestanda

- SSR först, liten klient-JS.
- /static/* → immutable cache.
- OG-SVG med lång cache.

---