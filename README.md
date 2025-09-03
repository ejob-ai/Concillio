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
