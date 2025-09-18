# TODO – Concillio Launch Roadmap

## ✅ Tier 1 – Prelaunch Implementation
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
  - [ ] UTM tracking/forwarding on /pricing traffic

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
