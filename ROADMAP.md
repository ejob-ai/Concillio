# ✅ Concillio — Development & Launch Roadmap

> Status: Stabil grund klar — nu börjar uppbyggnaden av kärnlogiken och affärsstrukturen.
>
> Total progress: ~70%
>
> Mål: Public beta inom 6 veckor.

---

## 🧩 FAS 1 — Dataskikt & Orchestrator-bas (v.1–2)

Mål: Få rådet att leva — kunna skapa, lagra och spela upp en sessionskedja.

### ⚙️ Teknik (Backend)
- [ ] Skapa D1-databas (schema + migrations)
  - [ ] Tabeller: `sessions`, `steps`, `messages`, `outcomes`, `audits`
  - [ ] Lägg till `d1_databases` och `kv_namespaces` i `wrangler.toml`
- [ ] Bygg `repo/`-lager (SELECT/INSERT/update helpers)
- [ ] Sätt upp KV-namespaces för idempotency & rate limiting
- [ ] Implementera `migrate` + `seed`-skript
- [ ] Testa D1-lagring lokalt (`wrangler dev` + minitest)

### 💡 Affär & strategi
- [ ] Definiera vad en “session” representerar (t.ex. beslut, analys, strategi)
- [ ] Skapa 3–5 prototypfall (”rådsfrågor”)
  - [ ] Investeringsbeslut
  - [ ] Produktstrategi
  - [ ] Riskbedömning
  - [ ] Organisationsförändring
  - [ ] Kommunikationsplan

🕐 Tidsestimat: ~1 vecka  
🎯 Milstolpe: DB/KV ready

---

## ⚙️ FAS 2 — API & Orchestrator (v.2–3)

Mål: Concillio ska kunna driva en fullständig rådsprocess (intro → analysis → synthesis → consensus).

### ⚙️ Teknik (Backend)
- [ ] Implementera API-endpoints:
  - [ ] `POST /api/sessions` — skapa nytt råd
  - [ ] `POST /api/sessions/:id/run` — kör nästa steg
  - [ ] `GET /api/sessions/:id/outcome` — hämta resultat
  - [ ] `GET /api/sessions/:id/protocol.md` — exportera protokoll
- [ ] Skapa orchestrator-modul:
  - [ ] Definiera `states` och `events`
  - [ ] Implementera deterministiska övergångar
  - [ ] Lägg till auditlogg + metrics
  - [ ] Implementera replay (återuppta session)
- [ ] Unit-tester för orchestratorn (state machine + D1)

### 💡 Affär & strategi
- [ ] Brainstorma roller i rådet (Strateg, Risk Officer, Jurist, m.fl.)
- [ ] Definiera beslutslogik (majoritet, konsensus, rådgivande)
- [ ] Beskriv berättelsen/metaforen för “rådet”

🕐 Tidsestimat: ~1–1.5 veckor  
🎯 Milstolpe: Orchestrator v1 running

---

## 🧠 FAS 3 — UI & Auth (v.4–5)

Mål: Användaren kan skapa en session, följa processen och hämta resultat.

### 🖥️ Teknik (Frontend)
- [ ] SSR-sidor: `/app/sessions`, `/app/sessions/:id`
- [ ] Minimal state manager (Zustand / Signals)
- [ ] Koppla UI → API (fetch hooks)
- [ ] Auth (GitHub OAuth eller Magic link via Cloudflare Access)
- [ ] Sessioncookies i KV/D1
- [ ] E2E: skapa → köra → läsa protokoll

### 💡 Affär & UX
- [ ] Designa onboarding-flöde: “Starta ett råd”
- [ ] Identifiera användarsegment (entreprenörer, rådgivare, investerare)
- [ ] Namnge rådets roller (”The Strategist”, ”The Innovator”, osv.)

🕐 Tidsestimat: ~1.5 veckor  
🎯 Milstolpe: Interactive UI + Auth flow

---

## 📄 FAS 4 — Exporter, observabilitet & beta-polish (v.6–7)

Mål: Skapa leveransformat och observabilitet för public beta.

### ⚙️ Teknik
- [ ] Export till Markdown och PDF
  - [ ] PDF via Browserless/R2
  - [ ] Signerade delningslänkar
- [ ] Logging & metrics
  - [ ] Latens, felgrad, retries
  - [ ] Discord/webhook alerts
- [ ] Secrets-rotation i Cloudflare Pages
- [ ] Final smoke/E2E på main

### 💡 Affär
- [ ] Bygg beta-landningssida med “Join waitlist”
- [ ] Definiera beta success criteria
- [ ] Skapa kort sälj-copy + demo-video

🕐 Tidsestimat: ~1 vecka  
🎯 Milstolpe: Public Beta ready

---

## 🔮 FAS 5 — Growth & kommersiell lansering (v.8+)

Mål: Förbereda produkt, marknad och team för lansering.

### ⚙️ Teknik
- [ ] Versionering (semver + changelog)
- [ ] Feature flags (early access)
- [ ] A/B-tester för rådssammansättning

### 💡 Affär
- [ ] Prisstrategi (freemium / prenumeration / per-session)
- [ ] GDPR & Privacy statement (LICENSE_COMMERCIAL.md)
- [ ] “Concillio for Teams” – delade sessioner
- [ ] Pitchdeck + investerardemo

🕐 Tidsestimat: löpande efter beta  
🎯 Milstolpe: Commercial launch readiness

---

## 🔁 Arbetsrutin (weekly)

| Vecka | Moment | Resultat |
|:--:|:--|:--|
| 🧠 Brainstorm | Nya idéer, roller, affärscase | Kreativ inriktning |
| ⚙️ Build | Fokus på veckans milstolpe | Färdig feature |
| ✅ Review | Demo + green smoke | Stabil release |
| 🗒️ Dokumentation | README, CHANGELOG, TODO | Spårbarhet |

---

## 🧭 Översikt (nuvarande status)

| Delområde | Klart | Status |
|:--|:--:|:--|
| Teknisk grund | ✅ | 90% |
| Kärnlogik | ⚙️ | 35% |
| UI & Auth | 🧠 | 60% |
| Drift & säkerhet | 🔒 | 70% |
| Dokumentation & licens | 📝 | 95% |
| **Total progress** |  | **≈70%** |

---

📌 Nästa steg:
1. Implementera D1-schema och KV-namespaces  
2. Påbörja orchestrator-modulen  
3. Förbered API-kontrakt (/sessions, /run, /outcome)  
4. Starta brainstorming kring roller och affärscase  

---

© 2025 Concillio — “Where Intelligence Meets Judgment”
