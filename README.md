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
