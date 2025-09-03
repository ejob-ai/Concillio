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
- Injected in base layout (SSR). Listens globally for clicks on [data-cta] and POSTs { cta, source, href, ts } to /api/analytics/council (fire-and-forget).

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

