# Concillio

AI-driven rådslagstjänst med roller (Strategist, Futurist, Psychologist, Senior Advisor, Summarizer) och executive consensus.

---

## Production

- **Prod URL:** [https://concillio.pages.dev](https://concillio.pages.dev)
- **Branch:** `main`
- **D1 binding:** `concillio-production`
- **Notes:**  
  - Prompts/versioner styrs från D1 (ENV-overrides avstängda)  
  - **Media-generering (audio/video) är avstängd** – API-guards returnerar 405

---

## Post-deploy checklist

Kör dessa efter varje deploy för att säkerställa att allt fungerar.

### 1) Media guards (ska svara 405)

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://concillio.pages.dev/api/media/test
curl -s -o /dev/null -w "%{http_code}\n" https://concillio.pages.dev/api/generate-audio
curl -s -o /dev/null -w "%{http_code}\n" https://concillio.pages.dev/api/generate-video
```

### 2) Prompts & version-pin

```bash
curl -i "https://concillio.pages.dev/api/prompts/concillio-core?locale=en-US" \
  | sed -n 's/Set-Cookie: .*concillio_version.*/&/p'
```

### 3) Skapa minutes (v2-mock)

```bash
curl -i "https://concillio.pages.dev/demo?mock=1&mock_v2=1&lang=en&q=Demo&ctx=Ctx"
# → ger 302 Location:/minutes/{ID}?lang=en
```

### 4) Konsensus & SA-bullets (öppna i browser)

https://concillio.pages.dev/minutes/{ID}?lang=en

Senior Advisor visar alltid bullets

Badge derived syns om &sa_derived=1 i /demo

https://concillio.pages.dev/minutes/{ID}/consensus?lang=en

Badge “v2 schema ✅” när consensus_validated=1

Decision, bullets, risks/conditions visas med asLine

### 5) PDF export

```bash
curl -i "https://concillio.pages.dev/api/minutes/{ID}/pdf"
# Content-Type: text/html (fallback) eller application/pdf om BROWSERLESS_TOKEN är satt
```

---

## Development quick start

```bash
npm run build
pm2 start ecosystem.config.cjs
```
