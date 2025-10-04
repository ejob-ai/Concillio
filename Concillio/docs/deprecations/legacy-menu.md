# Deprecate legacy menu (`#site-menu-panel`) & remove fallback

**Target date:** 2025-09-30  
**Status:** Planned (legacy off in prod, allowed in dev)  
**Owners:** @ejob-ai  
**Labels:** chore, deprecation, frontend, a11y

## Background
- Data-menu-mönstret är nu standard i produktion (`html.menu-open` + `[data-menu]` + `[data-menu-overlay]`).
- Legacy-vägen (`#site-menu-panel`) är **avstängd i prod** (flagga), men tillåten i **dev** för test.
- Dev varnar i konsolen vid legacy-trigger; prod kan sända telemetri‐event.

## Goal
Fullt avveckla legacy-menyn och all återstående CSS/JS-fallback när vi bekräftat **0 triggers** under observationsperioden.

## Scope
- **In scope:** menu.js (remove legacy path), CSS för `#site-menu-panel`, markupsöknings-städ, små refactors.
- **Out of scope:** nya features i menyn, större designändringar.

## Plan
1) **Observation (nu → 2025-09-30)**
   - Övervaka dev-varningar och ev. prod-telemetri `menu_legacy_triggered`.
2) **Removal (efter 0 träffar)**
   - Ta bort legacy-kodväg i `public/static/menu.js`.
   - Rensa återstående `#site-menu-panel`-regler i `public/static/style.css`.
   - Sök & ta bort döda legacy-hooks i TSX/JS.
3) **Hårdvalidering**
   - QA desktop/mobil med endast data-menu.

## Telemetry
- **Dev:** console.warn `[menu] Legacy path triggered.`
- **Prod (valfritt):** POST `/api/analytics/council { event: 'menu_legacy_triggered', path, ua }`
- **Exit-kriterium:** 0 triggers under observationsperioden.

## Acceptance Criteria
- Ingen legacy-kod kvar i `menu.js` och `style.css`.
- Menyn fungerar oförändrat (öppna/stäng via trigger/overlay/ESC, ankar-klick stänger efter scroll, fokusfälla, inert/aria-hidden).
- Lighthouse/axe: inga regressions i A11y.

## Test Plan
- **Desktop & mobil:**
  - Trigger → panel “slide in”, `html.menu-open` sätts.
  - Overlay-klick/ESC → stänger och återställer fokus.
  - `.menu-link[href^="#"]` → smooth scroll → fokus på sektion → panel stängs → `aria-current` + hash uppdateras.
  - `prefers-reduced-motion` → inga CSS-transitioner, men korrekt state/URL.
  - Ingen layoutskift (tack `scrollbar-gutter: stable both-edges`).
- **iOS:** ingen bakgrunds-“rubber-band” vid öppen meny (om `overscroll-behavior: contain` används).

## Risks & Rollback
- **Risk:** dold vy beroende av legacy.  
- **Mitigation:** behåll branch med legacy; snabb rollback via flagga.  
- **Rollback:** Re-enable legacy flag i `menu.js` och återställ CSS från tidigare tag.

## Checklist
- [ ] Verifiera 0 dev-varningar och 0 prod-telemetri-träffar t.o.m. **2025-09-30**.
- [ ] Ta bort legacy-vägen i `public/static/menu.js`.  
- [ ] Rensa `#site-menu-panel` i `public/static/style.css`.  
- [ ] Sök & rensa `site-menu-panel|menu-open-legacy|no-scroll-block` i källan.  
- [ ] QA enligt “Test Plan”.  
- [ ] Merge → Deploy.  
- [ ] Stäng denna issue.

---

Notes
- Flagga: `USE_LEGACY_IF_PRESENT = false` i prod, true i dev.  
- TODO kvar i koden: `/* TODO(vX.Y+1): Remove legacy #site-menu-panel code path if no telemetry hits */`.
