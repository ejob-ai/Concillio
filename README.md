# Concillio

[![E2E (preview) – Summary](https://img.shields.io/github/checks-status/ejob-ai/Concillio/main?label=E2E%20%28preview%29%20%E2%80%93%20Summary)](../../actions)
[![E2E Smoke on main – Summary](https://img.shields.io/github/checks-status/ejob-ai/Concillio/main?label=E2E%20Smoke%20on%20main%20%E2%80%93%20Summary)](../../actions)
[![Status](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ejob-ai/Concillio/status/status.json)](STATUS.md)

## Innehåll
- [E2E (preview) – GitHub Actions & Cloudflare Pages](#e2e-preview--github-actions--cloudflare-pages)
- [E2E Smoke (main)](#e2e-smoke-main)
- [Branch protection (rekommenderas)](#branch-protection-rekommenderas)
- [Snabb verifiering](#snabb-verifiering)
- [Status dashboard](./STATUS.md)


AI-driven rådslagstjänst med roller (Strategist, Futurist, Psychologist, Senior Advisor, Summarizer) och executive consensus.

---

### Preview validation
This commit is used to validate preview deploy + Access login + JUnit artifacts.
Tag: `preview-validation-2025-09-26`
<!-- preview-validation-2025-09-26 -->

## E2E / CI test context (TEST_CONTEXT)

Repo:t använder en enkel flagga för att styra vilka E2E-tester som ska köras i olika pipelines.

| TEST_CONTEXT | Var sätts den?                          | Effekter                                                         |
|--------------|-----------------------------------------|------------------------------------------------------------------|
| `preview`    | `.github/workflows/preview-e2e.yml`     | Kör **preview-testet** (`preview-validation.spec.ts`).          |
| `smoke`      | `.github/workflows/smoke-e2e.yml`       | **Skippa** preview-testet; kör övriga E2E-tester (smoke).        |

Preview-testet är uttryckligen “preview-only” och skippas automatiskt utanför PR-previews:

```ts
// tests/e2e/preview-validation.spec.ts
const isPreview = process.env.TEST_CONTEXT === 'preview';
test.skip(!isPreview, 'Preview-only test (skippas på main/smoke).');
```

### Köra lokalt
Kör hela sviten men tvinga önskat beteende genom att sätta `TEST_CONTEXT`:

```bash
# macOS/Linux (bash/zsh)
TEST_CONTEXT=preview npx playwright test
TEST_CONTEXT=smoke   npx playwright test
```

```powershell
# Windows PowerShell
$env:TEST_CONTEXT = 'preview'; npx playwright test
$env:TEST_CONTEXT = 'smoke'  ; npx playwright test
```

### Felsökning – snabb checklista
* Preview-test körs på `main`? → Kontrollera att `TEST_CONTEXT=smoke` sätts i `smoke-e2e.yml`.
* Preview-test körs inte i PR? → Kontrollera att `TEST_CONTEXT=preview` finns i `preview-e2e.yml`.
* Behöver backa ändringen? → Ta bort blocken märkta `HOTFIX(TEST_CONTEXT)` i test/workflows eller revert:a committen.

## Limitations & Media Generation Policy

This project runs on Cloudflare Pages/Workers (edge runtime). Certain capabilities are intentionally disabled here:

- No server-side media generation (audio/video). CPU/binary/runtime limitations make this unsuitable.
- No long-running background jobs or WebSocket servers.
- No local filesystem access at runtime.

Enforced HTTP 405 guards:
- All /api/media/* → 405 Method Not Allowed
- /api/generate-audio → 405 Method Not Allowed
- /api/generate-video → 405 Method Not Allowed

Recommended alternatives for media generation:
- Use an async job service (e.g., ElevenLabs, OpenAI Realtime/Audio APIs, Runway, Kling, Resemble, Play.ht) to generate media outside the edge runtime.
- The webapp should initiate a job via a server-side Hono route, store the job ID (KV/D1), and poll or receive a webhook callback when the job completes. Then provide a signed URL from storage (R2/S3) to clients.

---

## Production

- Prod URL: https://concillio.pages.dev
- Branch: main
- D1 binding: concillio-production
- Config: wrangler.toml (Pages). Build via Vite + @hono/vite-build/cloudflare-pages → dist/_worker.js
- Notes:
  - Prompts/versions are controlled from D1
  - Media generation (audio/video) is disabled — API guards return 405

### Health checks

- Basic hello: curl -s https://concillio.pages.dev/api/hello
- Analytics ping: curl -s https://concillio.pages.dev/api/analytics/council

---

## Post-deploy checklist

Run these after every deploy to ensure everything still works.

1) Media guards (should return 405)

```
curl -s -o /dev/null -w "%{http_code}\n" https://concillio.pages.dev/api/media/test
curl -s -o /dev/null -w "%{http_code}\n" https://concillio.pages.dev/api/generate-audio
curl -s -o /dev/null -w "%{http_code}\n" https://concillio.pages.dev/api/generate-video
```

2) Prompts & version pin

```
curl -i "https://concillio.pages.dev/api/prompts/concillio-core?locale=en-US" \
  | sed -n 's/^[Ss]et-[Cc]ookie: .*concillio_version.*/&/p'
```

3) Create minutes (v2 mock) via demo redirect

```
curl -i "https://concillio.pages.dev/demo?mock=1&mock_v2=1&lang=en&q=Demo&ctx=Ctx"
# Expect: HTTP/1.1 302 and a Location: /minutes/{ID}?lang=en
```

4) Consensus page (open in browser)

- https://concillio.pages.dev/minutes/{ID}?lang=en
- https://concillio.pages.dev/minutes/{ID}/consensus?lang=en (v2 schema badge appears when consensus_validated=1)

5) PDF export (fallback)

```
curl -i "https://concillio.pages.dev/api/minutes/{ID}/pdf"
# Expect Content-Type: text/html (fallback) unless BROWSERLESS_TOKEN is set → then application/pdf
```

---

## D1 migrations (SQL)

Apply locally (auto-creates local SQLite DB) and in production:

```
# Local
yarn wrangler d1 migrations apply concillio-production --local

# Production
yarn wrangler d1 migrations apply concillio-production
```

### Prompt pack v2: concillio-core-10 (sv-SE)

Snabb kontroll (klistra & kör)

```bash
npx wrangler d1 execute concillio-production --remote \
  --command "SELECT id,name,locale,status FROM prompt_packs_v2 WHERE name='concillio-core-10' AND locale='sv-SE';"

# Byt <ID> nedan till pack_id:t du får från frågan ovan
npx wrangler d1 execute concillio-production --remote \
  --command "SELECT role_key, LENGTH(system_template) st, LENGTH(user_template) ut FROM prompt_pack_entries WHERE pack_id=<ID> ORDER BY role_key;"
```

- Ska ge 11 rader (10 roller + SUMMARIZER) och icke-noll längder.
- Tabeller: prompt_packs_v2 och prompt_pack_entries.

Schema files are in migrations/; for auth we use:

```sql
-- users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,          -- scrypt hash i base64
  password_salt TEXT NOT NULL,          -- slumpad salt i base64
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT,
  disabled INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                  -- crypto.randomUUID()
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,             -- ISO-8601
  ip_hash TEXT,                         -- valfritt (HMAC av IP)
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);
```

---

## Environment variables and secrets

These must be provided as Cloudflare Pages secrets in production (do NOT commit values):
- AUTH_PEPPER: long random string used as password pepper
- SESSION_TTL_DAYS: session lifespan in days (e.g., 14)
- AUDIT_HMAC_KEY: base64 key (HMAC) used for IP/user-agent hashing (optional)

Local development mirrors production via .dev.vars (not committed). Example keys are included there for local only.

Set in production (interactive):

```
wrangler pages secret put AUTH_PEPPER --project-name concillio
wrangler pages secret put SESSION_TTL_DAYS --project-name concillio
wrangler pages secret put AUDIT_HMAC_KEY --project-name concillio
```

---

## Auth endpoints

- POST /api/auth/signup { email, password } → creates user + session, sets sid cookie
- POST /api/auth/login { email, password } → verifies and sets sid cookie
- POST /api/auth/logout → clears session and cookie
- GET  /api/me → returns current user or null if no/expired session

Passwords use scrypt-js with a global pepper (AUTH_PEPPER) and per-user salt.

---

## Development quick start

- Install deps: npm ci
- Build: npm run build
- Run tests (includes media-guard harness): npm test
- Local dev server in sandbox (PM2 + wrangler pages dev):
  - npm run build
  - pm2 start ecosystem.config.cjs
  - curl http://localhost:3000/api/hello

### Docs (SSR)
- Roller: /docs/roller
- Line-ups: /docs/lineups
Visar baseline-vikter (procent). Viktning kan justeras dynamiskt av heuristik i konsultflödet.

---

## 💳 Billing & Stripe

### Checkout (GET-only) & Thank-you
- GET /api/billing/checkout/start?plan=starter|pro|legacy&quantity=1
  - 302 → Stripe Checkout när STRIPE_SECRET_KEY är satt; annars 501 (accepterat i deploy-checks)
  - UTM-parametrar i requesten propageras till Stripe metadata
- /checkout → 302 till GET-start, bevarar plan/quantity/utm_*
- /thank-you → SSR 200, X-Robots-Tag: noindex, analytics-beacon checkout_success

### Billing Portal & /app/billing
- GET /api/billing/portal/start → 302 till Stripe Billing Portal (prod: sessionens user.stripeCustomerId; dev: ?customerId)
- /app/billing → SSR-sida (noindex) med “Open Billing Portal”-knapp.
  - Prod-guard: oinloggad redirectas till /login?next=/app/billing

### Webhooks & dedup
- POST /api/billing/webhook → verifierar Stripe-signatur (HMAC-SHA256), tolerans 5 min
- KV-baserad dedup (48h TTL)
- D1-uppdateringar: org/subscription enligt eventtypen

## 🧪 E2E test-login (CI/preview)

För stabila positiva E2E-tester använder vi en dev/CI-låst test-login-endpoint som seedar user/org/subscription i D1 och sätter en giltig session-cookie.

Miljövariabler (endast preview/PR)

TEST_LOGIN_ENABLED=1

TEST_LOGIN_TOKEN=<hemlig slumpnyckel>
(samma värde ligger som TEST_LOGIN_TOKEN i GitHub Secrets så att E2E kan anropa helpern)

Produktion: sätt inte dessa variabler (endpoint svarar 403).

Endpoints
POST /api/test/login
Headers: x-test-auth: <TEST_LOGIN_TOKEN>
Body (JSON): {
  "email": "e2e-billing@example.com",
  "customerId": "cus_e2e_123",
  "plan": "starter",              // starter | pro | legacy
  "status": "active",             // active | past_due | canceled ...
  "seats": 1
}

POST /api/test/logout
Headers: x-test-auth: <TEST_LOGIN_TOKEN>

Logout rensar sid-cookien och tar bort sessionsraden (best effort). Endast aktiv när TEST_LOGIN_ENABLED=1.


Effekt:

Upsertar users (med stripe_customer_id)

Upsertar org + subscription (status/plan/seats)

Skapar sessions-rad och sätter sid-cookie (1h)

CI-beteende

Workflow: Deploy → deploy-checks → E2E

Negativt test: /app/billing redirectar oinloggad → /login?next=/app/billing

Positivt test: loggar in via helpern, öppnar /app/billing och asserterar “Open Billing Portal”

Om TEST_LOGIN_TOKEN saknas: positiva testet skippas automatiskt

Köra lokalt (mot preview)

Se till att preview-miljön har TEST_LOGIN_ENABLED=1 och token satt.

Exportera i terminalen:

export BASE_URL="https://<preview-subdomain>.concillio.pages.dev"
export TEST_LOGIN_TOKEN="<samma-token-som-i-Cloudflare/GitHub>"


Kör:

npx playwright install --with-deps
npm run test:e2e

Artefakter vid fel

Playwright: trace, video, screenshot (retain-on-failure)

Egna: test-results/*.png, test-results/*.html

Global fixture: test-results/<slug(test-title)>.console.txt

Säkerhet

Endpoint är dubbelt skyddad: TEST_LOGIN_ENABLED=1 och korrekt x-test-auth.

Montering är harmlös i prod (routen 403:ar).

Inga hemligheter i repo; token lever i CF Pages + GitHub Secrets.

Felsökning (snabb)

403 vid POST /api/test/login: saknas/ogiltig x-test-auth eller TEST_LOGIN_ENABLED=0.

200 men ingen session: kontrollera att sessions-tabell finns och att sid-cookie inte blockeras.

Positivt test skippas: kontrollera att TEST_LOGIN_TOKEN finns i CI och Pages preview.

## E2E Test Login (Preview/CI)

För att köra de positiva E2E-testen (t.ex. /app/billing med “Open Billing Portal”) använder vi en skyddad test-login helper.
Den kräver en hemlig token (TEST_LOGIN_TOKEN) och aktiveras endast i Preview/CI-miljö.

1. Generera token

Kör något av följande för att skapa ett starkt, slumpat värde (64 tecken hex):

# OpenSSL
openssl rand -hex 32

# eller Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"


Exempel på resultat:

8f2c7f7c3e8c49d4c23a91d7eec1c02e2a6f4dbe71b93c7f82b8b384d47af01b

2. Sätt variabler

GitHub → Secrets & variables → Actions

Lägg till TEST_LOGIN_TOKEN med samma värde.

Cloudflare Pages → Project → Settings → Environment Variables (Preview)

Lägg till:

TEST_LOGIN_ENABLED=1

TEST_LOGIN_TOKEN=<ditt genererade värde>

❗️ Sätt inte dessa i Production. Helpern returnerar alltid 403 där.

3. CI-flöde

När GitHub Actions kör E2E:

CI skickar header x-test-auth: $TEST_LOGIN_TOKEN

Endast Preview-miljön accepterar och loggar in seed-usern

Testet verifierar att /app/billing → 200 och “Open Billing Portal” syns

4. Byt vid behov

Om du misstänker att nyckeln läckt:

Generera en ny med samma kommando som ovan

Uppdatera i både GitHub Secrets och Cloudflare Pages (Preview)

Kör om deploy – gamla nyckeln blir då ogiltig

## Testing

Run the Vitest harness against built worker:

```
npm run test
```

This uses wrangler unstable_dev to run dist/_worker.js and asserts the 405 media guards remain in place.

---

## 📴 Disable Pages native build (use GitHub Actions only)

Mål: Låt enbart GitHub Actions deploya (dist/) för både preview & production. Undvik dubbla/konfliktande deploys från Cloudflare Pages egna build.

A) Rekommenderat: Byt källa till “GitHub Actions”

- Cloudflare Pages → Project → Settings → Build & deploy
- Build & deploy source → Edit → välj GitHub Actions (deployments via GitHub Actions only) → Save
- Klart — fälten Build command / Build output directory blir irrelevanta.

B) Alternativ (om A saknas): Disconnect repository

- Cloudflare Pages → Project → Settings → General
- Disconnect repository (bekräfta) → projektet blir “Direct upload”
- Våra GitHub Actions fortsätter deploya via Pages-API.

Repo-/CI-förutsättningar (redan på plats i detta projekt)

- wrangler.toml:

```
[build]
upload_dir = "."
```

- CI: .github/workflows/deploy.yml bygger och laddar upp artefakten dist/ via cloudflare/pages-action@v1.

Verifiering

- Öppna en PR → Actions kör build-and-test → deploy-preview.
- I Pages Deployments ska du endast se deployer märkta som “via GitHub Actions”.
- Inga nya deployer ska triggas när du bara trycker Re-run build i Pages (det ska inte finnas kvar).

Vanliga fallgropar (undvik)

- Pause builds/deploys i Pages: stoppar även API-deploys → blockerar Actions.
- Låta Git-koppling vara aktiv med “Build output directory = dist”: risk för parallella/konfliktande deploys.
- Sätta “Build output directory = .” när Git-kopplingen är aktiv: kan få Pages att publicera hela repo-roten.

Rollback

- Behöver du tillfälligt återgå till Pages inbyggda build?
- Settings → Build & deploy → ändra “Build & deploy source” tillbaka till Connected Git och ställ in Build command + Build output directory (dist).

## GitHub & Deployment

- Push to GitHub main as usual
- Deploy to Cloudflare Pages:
  - npm run build
  - wrangler pages deploy dist --project-name concillio

  CI/CD:
- PRs: cloudflare/pages-action@v1 preview deploy, sedan Playwright-matris (chromium/firefox/webkit). Artefakter: `junit/*.xml` och `playwright-report-*/`. Sammanfattnings-check: “E2E (preview) – Summary”.
- main: E2E Smoke mot `$SMOKE_BASE_URL` med strikt Cloudflare Access-preflight (HEAD + Location). Artefakter per browser och sammanfattnings-check: “E2E Smoke on main – Summary”.
- Status: `STATUS.md` + `status.json` uppdateras av workflow; dynamisk shields.io-badge finns överst.
