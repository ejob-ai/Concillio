# TODO – Concillio Launch Roadmap

> 📘 See also: [ROADMAP.md](./ROADMAP.md) for high-level goals & beta milestones.

## Status Update — 2025-09-18
- Pricing v1 NOW – ✅ Styles live & sitemap cleaned (4 unique URLs + lastmod). Deployed to Pages. Verified sitemap redirect, pricing visuals, canonical and OG tags.
- Step 2 shipped: Checkout pre-fills ?plan from sessionStorage.last_plan (default starter) when missing; pricing CTAs store data-plan and click handler persists last_plan.
- Step 3 stub ready: /api/billing/checkout returns 501 when STRIPE_SECRET missing; client posts {plan, utm} and follows URL. CTA texts updated.

## NOW

- [x] Thank-you (fallback) — implemented in src/index.tsx; tests in tests/thank-you.spec.ts (SSR + X-Robots-Tag noindex,nofollow; DOM marker)
  - [x] Lägg in GET /thank-you i `src/index.tsx` (jsxRenderer) ➜ 200 med rubrik och plan (src/index.tsx)
  - [x] Minimal CSS i `public/static/style.css` (centrerad layout) (public/static/style.css)
- [~] Stripe Checkout (stub – verifiera URL:er) — GET /api/billing/checkout/start implemented; 302 to Stripe when configured, 501 otherwise; UTM propagated (src/routes/billing.ts)
  - [x] Bekräfta att stubben skickar `plan` + `utm` och använder success/cancel enligt spec (src/routes/billing.ts)
- [~] Deploy & sanity — preview deploy + CI checks present; prod verification pending
  - [ ] Deploy prod
  - [~] `curl -I https://concillio.pages.dev/thank-you?plan=pro` → 200 — route in place; verify on prod (src/index.tsx)
  - [x] `curl -I https://concillio.pages.dev/pricing-new` → 301 → /pricing — redirect implemented (src/index.tsx)
- [new] Billing Portal endpoints implemented (src/routes/billing.ts: GET /api/billing/portal/start; POST /api/billing/portal)
- [new] CI/CD hardening & Access preflight wired (preview-e2e.yml ✓, smoke-e2e.yml ✓)
- [new] Branch protection workflow present (requires ADMIN_TOKEN to apply) (.github/workflows/set-branch-protection.yml)

## ✅ Tier 1 – Prelaunch Implementation

NOW: SEO: canonical/OG för /checkout ✅  
NOW: Checkout autofill: förifyll plan från sessionStorage.last_plan om query saknas ✅  
NOW: Council-limits uppdaterade till 5/20/100 (Starter/Pro/Legacy) ✅

NEXT: Billing-stub /api/billing/checkout (501 om ej konfigurerad), POST med {plan, utm}; klient startCheckout(plan); mappa plan→priceId  
NEXT: Rendera checkout-features från PLANS (delvis klart) och visa uppgraderingstips om fel UPGRADE_REQUIRED

LATER: Riktig Stripe-session (test-läge), UTM→metadata, tack-sida + kvitto-mail

- [~] Pricing page redesign (modern premium design, responsive) — v1 implemented; further polish pending (src/routes/pricing.tsx)
- [x] Tiered plans: Freemium, Starter, Pro, Legacy (direct purchase, no sales calls) (src/routes/pricing.tsx; config/stripe-prices)
- [x] Removed legacy pricing route (301 → /) (implemented as /pricing-new → /pricing in src/index.tsx)
- [x] Home OG → static PNG (+ og:image:width/height) (public/static/og/*)
- [~] Apply static PNG OG on remaining top-level pages (About, Contact, etc.) — home/pricing done; others pending (public/static/og/*)
- [~] SEO setup: canonical, sitemap, robots, OG images — robots.txt + sitemap.xml present; canonical/OG on key pages; expand coverage (public/robots.txt, public/sitemap.xml, route heads)
- [ ] Social previews validation (Twitter/X, FB) — pending validation runs
- [~] Accessibility audit (focus rings, aria labels, reduced motion) — partial in menu/controls; full sweep pending (src/index.tsx UI)
- [~] Sticky header polish across all views — PageIntro implemented; apply across remaining routes (src/index.tsx)
- [ ] Deploy final Tier 1 build to production
- [ ] QA checklist: 
  - Desktop browsers (Chrome, Firefox, Safari, Edge)  
  - Mobile browsers (iOS Safari, Android Chrome)  
  - Screenreader / reduced motion  

---

## 🔜 Tier 2 – Language Expansion

- [ ] Reintroduce Pricing v1 (Freemium/Starter/Pro) — shipping now
  - [x] Remove 301 redirect for /pricing
  - [x] Restore /pricing route with premium layout and Pro highlight (src/routes/pricing.tsx)
  - [x] Canonical + static PNG OG for /pricing (route head + public/static/og)
  - [x] Add /pricing to sitemap and header/menu (public/sitemap.xml; src/index.tsx menu)
  - [x] Wire CTA flows (signup for Free; checkout for Starter/Pro) (src/routes/pricing.tsx)
  - [x] Basic analytics events for pricing CTAs
  - [~] Define gating/feature flags per tier in code (limits, exports, integrations) — partial via middleware/plan.ts (src/middleware/plan.ts)
  - [x] UTM tracking/forwarding on /pricing traffic (src/routes/billing.ts)
- [~] Add language switcher UI (header + footer) — implemented in menu overlay; header/footer optional (src/index.tsx)
- [~] Implement localization framework (e.g. JSON/YAML language files) — inline strings exist; no external i18n files yet (src/index.tsx)
- [~] Translate Tier 1 pages into key Tier 2 languages:
  - 🌍 English (default) — [~] (inline)
  - 🇸🇪 Swedish — [~] (inline)
  - 🇪🇸 Spanish — [ ] 
  - 🇫🇷 French — [ ]
  - 🇩🇪 German — [ ]
  - 🇧🇷 Portuguese (BR) — [ ]
  - 🇯🇵 Japanese — [ ]
- [ ] Update SEO:
  - hreflang for all supported languages — [ ]
  - localized meta descriptions & OG tags — [~] (partial via route heads)
- [ ] QA checklist:
  - Language switcher works without reload issues
  - All Tier 1 content available in each language
  - SEO hreflang validates in Google Search Console
  - Social previews re-validated (X Card Validator, FB Debugger) for / and /docs/*
- [ ] Deploy Tier 2 build globally

---

## ⏰ Reminder – Legacy Fallback Cutoff
- [ ] 2025-10-02: check localStorage counter __legacyMenuTriggered__.
  - If 0 → remove legacy menu code & CSS, remove associated overlay hooks.

---

## 📌 Backlog / Tier 3+ (future ideas)
- More languages (Chinese, Hindi, Arabic, Russian)
- Premium support refinements (SLA tiers)
- Enterprise integrations (Slack, Teams, SSO)
- Analytics dashboard for user activity

---

## Tier 2 language expansion tasks (detailed)
- [ ] i18n source files scaffold (en, sv initially) under src/i18n/
- [x] Route helpers to resolve lang from query/cookie consistently — implemented getLang()/cookies (src/index.tsx)
- [~] SSR head: localized titles/descriptions per route — many routes set c.set('head'); expand coverage (various routes)
- [ ] Copy review pass with native speakers
- [ ] QA per language: layout overflows, truncations, RTL readiness (future)
