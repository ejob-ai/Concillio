# Concillio

This project is a Hono + Cloudflare Pages app. Build with `npm run build`, run in sandbox with PM2 using `ecosystem.config.cjs`, and deploy with Wrangler.

Build and run locally:
- npm run build
- pm2 start ecosystem.config.cjs
- curl http://localhost:3000

For Wrangler type generation:
- npm run cf-typegen

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

Key updates in this change:
- i18n: sv/en with cookie + query persistence and centralized t(lang)
- Council IA: /council, /council/:slug, /council/consensus
- Accessibility: whole-card anchors, premium hover with focus-visible ring, ARIA labels
- Minutes UX: cards and consensus block are anchors; CTA analytics
- Analytics events: council_card_hover, council_card_click, role_page_view, start_session_click
- Consensus page wired with consensus_get_items, consensus_example_quote, consensus_method_scope_items

## CTA Components (short)
- PrimaryCTA(props): { href: string; label: string; sublabel?; dataCta?; dataCtaSource? }
- SecondaryCTA(props): { href: string; label: string; dataCta?; iconLeft?; iconRight?; disabled?; dataCtaSource? }
- data-cta normalization:
  - If dataCta is provided and doesn’t start with primary-/secondary-, it is prefixed automatically.
  - If dataCta is omitted, it is derived from href path, e.g. /council/ask → primary-council-ask (or secondary-… for SecondaryCTA).
- data-cta-source convention (examples):
  - home:hero, home:ask, home:waitlist, home:contact
  - council:hero
  - role:<slug>:hero, role:<slug>:get
  - consensus:hero
  - pricing:individual | pricing:business | pricing:enterprise
  - cases:footer, blog:footer, resources:whitepaper (etc.)
- Forms use native <button> but share the same visual language and carry data-cta + data-cta-source when applicable (e.g., primary-waitlist, primary-contact, primary-resources-whitepaper).

## PageIntro (short)
- Shared sticky header + intro block used on: /about, /how-it-works, /pricing, /case-studies, /resources, /blog, /waitlist, /contact.
- Not used on /council/ask (per product spec).
- Scroll shadow is applied via a small script that toggles a data attribute on the header:
  - data-scrolled="true|false" → CSS adds a subtle shadow when scrolled.

## Minimal analytics listener
- Injected in base layout (SSR). Listens globally for clicks on [data-cta] and POSTs { cta, source, href, ts } to /api/analytics/council (CTA branch; fire-and-forget).

### analytics_cta (storage)
- Stores clicks from the global [data-cta] listener.
- Fields: cta, source, href, lang, path, session_id, ua, referer, ip_hash, ts_client, created_at.
- Convention: data-cta="primary-*" / "secondary-*" and data-cta-source="page:section".

### Analytics CTA – Quick Queries (D1)
Top CTAs (last 7 days)
```
SELECT cta, COUNT(*) AS hits
FROM analytics_cta
WHERE ts_server > datetime('now','-7 days')
GROUP BY cta
ORDER BY hits DESC, cta;
```

Funnel by source (last 7 / 30 / 90 days)
```
-- Last 7d
SELECT COALESCE(source,'(none)') AS source, COUNT(*) AS clicks
FROM analytics_cta
WHERE ts_server > datetime('now','-7 days')
GROUP BY source
ORDER BY clicks DESC;

-- Last 30d
SELECT COALESCE(source,'(none)') AS source, COUNT(*) AS clicks
FROM analytics_cta
WHERE ts_server > datetime('now','-30 days')
GROUP BY source
ORDER BY clicks DESC;

-- Last 90d
SELECT COALESCE(source,'(none)') AS source, COUNT(*) AS clicks
FROM analytics_cta
WHERE ts_server > datetime('now','-90 days')
GROUP BY source
ORDER BY clicks DESC;
```

Click-through by target (href)
```
SELECT href, COUNT(*) AS clicks
FROM analytics_cta
GROUP BY href
ORDER BY clicks DESC, href;
```

Per-lang split
```
SELECT lang, cta, COUNT(*) AS hits
FROM analytics_cta
GROUP BY lang, cta
ORDER BY lang, hits DESC;
```

Daily trend (last 30 days)
```
SELECT date(ts_server) AS day, COUNT(*) AS clicks
FROM analytics_cta
WHERE ts_server >= date('now','-30 days')
GROUP BY day
ORDER BY day ASC;
```

CTR proxy: source → (ask/waitlist) share
```
SELECT
  COALESCE(source,'(none)') AS source,
  SUM(CASE WHEN cta LIKE 'primary-council-ask%' THEN 1 ELSE 0 END) AS ask_clicks,
  SUM(CASE WHEN cta LIKE 'primary-waitlist%' THEN 1 ELSE 0 END) AS waitlist_clicks,
  COUNT(*) AS total_clicks,
  ROUND(1.0 * SUM(CASE WHEN cta LIKE 'primary-council-ask%' THEN 1 ELSE 0 END) / COUNT(*), 3) AS ask_share,
  ROUND(1.0 * SUM(CASE WHEN cta LIKE 'primary-waitlist%' THEN 1 ELSE 0 END) / COUNT(*), 3) AS waitlist_share
FROM analytics_cta
GROUP BY source
ORDER BY total_clicks DESC;
```

Unique sessions (privacy-safe)
```
SELECT date(ts_server) AS day, COUNT(DISTINCT session_id) AS sessions
FROM analytics_cta
WHERE session_id IS NOT NULL AND session_id <> ''
GROUP BY day
ORDER BY day ASC;
```

## Admin: Read-only Analytics (CTA)
Auth: All endpoints require Authorization: Bearer $ADMIN_KEY.
Scope: Read-only views into analytics_cta.
Defaults: days=7 unless specified.
Privacy: Returns aggregates only (no PII).

Common optional filters (apply to all endpoints below):
- lang: exact language code (sv | en)
- source: exact source match (e.g., home:hero)
- source_prefix: prefix match for source (e.g., home:)
- cta: exact CTA key (e.g., primary-council-ask)
- cta_prefix: prefix match (e.g., primary-)
- cta_suffix: suffix match (e.g., -start-session)
Note: When both exact and prefix/suffix are provided, prefix/suffix takes precedence as applicable.

1) Top CTAs (last N days)

GET /api/admin/analytics/cta/top?days=7&limit=25[&lang=sv][&source_prefix=home:][&cta_prefix=primary-]

Query:
- days (int, default 7)
- limit (int, default 25)
- Optional filters listed above

Returns: [{ cta, clicks }]

```bash
curl -s "https://<your-domain>/api/admin/analytics/cta/top?days=7&limit=25&lang=sv&source_prefix=home:&cta_prefix=primary-" \
  -H "Authorization: Bearer $ADMIN_KEY" | jq
```

2) Funnel by Source (last N days)

GET /api/admin/analytics/cta/source?days=30[&lang=en][&cta_suffix=-start-session]

Returns: [{ source, clicks }]

```bash
curl -s "https://<your-domain>/api/admin/analytics/cta/source?days=30&lang=en&cta_suffix=-start-session" \
  -H "Authorization: Bearer $ADMIN_KEY" | jq
```

3) Click-through by Target (href)

GET /api/admin/analytics/cta/href?days=30&limit=100[&source=pricing:business]

Query:
- days (int, default 30)
- limit (int, default 100)
- Optional filters listed above

Returns: [{ href, clicks }]

```bash
curl -s "https://<your-domain>/api/admin/analytics/cta/href?days=30&limit=100&source=pricing:business" \
  -H "Authorization: Bearer $ADMIN_KEY" | jq
```

4) Daily Trend (last N days)

GET /api/admin/analytics/cta/daily?days=30[&lang=sv][&cta_prefix=primary-]

Returns: [{ day, clicks }] where day = YYYY-MM-DD

```bash
curl -s "https://<your-domain>/api/admin/analytics/cta/daily?days=30&lang=sv&cta_prefix=primary-" \
  -H "Authorization: Bearer $ADMIN_KEY" | jq
```

Notes & Tips
- All endpoints filter by ts_server >= datetime('now','-<days> days') (index ensured at runtime with idx_cta_ts_server).
- Useful indexes:
  - CREATE INDEX IF NOT EXISTS idx_cta_created_at ON analytics_cta(created_at);
  - CREATE INDEX IF NOT EXISTS idx_cta_cta ON analytics_cta(cta);
  - CREATE INDEX IF NOT EXISTS idx_cta_source ON analytics_cta(source);
  - (Optional) CREATE INDEX IF NOT EXISTS idx_cta_ts_server ON analytics_cta(ts_server);
  - (Optional) CREATE INDEX IF NOT EXISTS idx_cta_lang_ts ON analytics_cta(lang, ts_server);
  - (Optional) CREATE INDEX IF NOT EXISTS idx_cta_source_ts ON analytics_cta(source, ts_server);
  - (Optional) CREATE INDEX IF NOT EXISTS idx_cta_cta_ts ON analytics_cta(cta, ts_server);
- Backward compatible: if lang/source/cta filters are absent, endpoints return the global view.

## Admin: Analytics Retention Cleanup

# Purge CTA analytics older than 180 days
```bash
curl -X POST "https://<your-domain>/api/admin/analytics/cleanup?days=180" \
  -H "Authorization: Bearer $ADMIN_KEY"
```

Notes:

days default = 180 (max 3650).
Uses ADMIN_KEY (or ANALYTICS_CLEANUP_KEY) secret.
