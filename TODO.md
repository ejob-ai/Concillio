# TODO – Concillio Launch Roadmap

## Status Update — 2025-09-18
- Pricing v1 NOW – ✅ Styles live & sitemap cleaned (4 unique URLs + lastmod). Deployed to Pages. Verified sitemap redirect, pricing visuals, canonical and OG tags.
- Step 2 shipped: Checkout pre-fills ?plan from sessionStorage.last_plan (default starter) when missing; pricing CTAs store data-plan and click handler persists last_plan.
- Step 3 stub ready: /api/billing/checkout returns 501 when STRIPE_SECRET missing; client posts {plan, utm} and follows URL. CTA texts updated.

## NOW

- [ ] Thank-you (fallback)
  - [ ] Lägg in GET /thank-you i `src/index.tsx` (jsxRenderer) ➜ 200 med rubrik och plan
  - [ ] Minimal CSS i `public/static/style.css` (centrerad layout)
- [ ] Stripe Checkout (stub – verifiera URL:er)
  - [ ] Bekräfta att stubben skickar `plan` + `utm` och använder success/cancel enligt spec
- [ ] Deploy & sanity
  - [ ] Deploy prod
  - [ ] `curl -I https://concillio.pages.dev/thank-you?plan=pro` → 200
  - [ ] `curl -I https://concillio.pages.dev/pricing-new` → 301 → /pricing

## ✅ Tier 1 – Prelaunch Implementation

NOW: SEO: canonical/OG för /checkout ✅
NOW: Checkout autofill: förifyll plan från sessionStorage.last_plan om query saknas ✅
NOW: Council-limits uppdaterade till 5/20/100 (Starter/Pro/Legacy) ✅

NEXT: Billing-stub /api/billing/checkout (501 om ej konfigurerad), POST med {plan, utm}; klient startCheckout(plan); mappa plan→priceId
NEXT: Rendera checkout-features från PLANS (delvis klart) och visa uppgraderingstips om fel UPGRADE_REQUIRED

LATER: Riktig Stripe-session (test-läge), UTM→metadata, tack-sida + kvitto-mail

- [ ] Pricing page redesign (modern premium design, responsive)
- [ ] Tiered plans: Freemium, Starter, Pro, Legacy (direct purchase, no sales calls)
- [x] Removed legacy pricing route (301 → /)
- [x] Home OG → static PNG (+ og:image:width/height)
- [ ] Apply static PNG OG on remaining top-level pages (About, Contact, etc.)
- [ ] SEO setup: canonical, sitemap, robots, OG images
- [ ] Social previews validation (Twitter/X, FB)
- [ ] Accessibility audit (focus rings, aria labels, reduced motion)
- [ ] Sticky header polish across all views
- [ ] Deploy final Tier 1 build to production
- [ ] QA checklist: 
  - Desktop browsers (Chrome, Firefox, Safari, Edge)  
  - Mobile browsers (iOS Safari, Android Chrome)  
  - Screenreader / reduced motion  

---

## 🔜 Tier 2 – Language Expansion

- [ ] Reintroduce Pricing v1 (Freemium/Starter/Pro) — shipping now
  - [x] Remove 301 redirect for /pricing
  - [x] Restore /pricing route with premium layout and Pro highlight
  - [x] Canonical + static PNG OG for /pricing
  - [x] Add /pricing to sitemap and header/menu
  - [x] Wire CTA flows (signup for Free; checkout for Starter/Pro)
  - [x] Basic analytics events for pricing CTAs
  - [ ] Define gating/feature flags per tier in code (limits, exports, integrations)
  - [x] UTM tracking/forwarding on /pricing traffic

- [ ] Add language switcher UI (header + footer)
- [ ] Implement localization framework (e.g. JSON/YAML language files)
- [ ] Translate Tier 1 pages into key Tier 2 languages:
  - 🌍 English (default)
  - 🇸🇪 Swedish
  - 🇪🇸 Spanish
  - 🇫🇷 French
  - 🇩🇪 German
  - 🇧🇷 Portuguese (BR)
  - 🇯🇵 Japanese
- [ ] Update SEO:
  - hreflang for all supported languages
  - localized meta descriptions & OG tags
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
- [ ] Route helpers to resolve lang from query/cookie consistently
- [ ] SSR head: localized titles/descriptions per route
- [ ] Copy review pass with native speakers
- [ ] QA per language: layout overflows, truncations, RTL readiness (future)
