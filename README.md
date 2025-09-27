# Concillio

## Innehåll
- [E2E (preview) – GitHub Actions & Cloudflare Pages](#e2e-preview--github-actions--cloudflare-pages)
- [E2E Smoke (main)](#e2e-smoke-main)
- [Branch protection (rekommenderas)](#branch-protection-rekommenderas)
- [Snabb verifiering](#snabb-verifiering)

[![E2E (preview)](https://github.com/ejob-ai/Concillio/actions/workflows/preview-e2e.yml/badge.svg)](https://github.com/ejob-ai/Concillio/actions/workflows/preview-e2e.yml)
[![E2E Smoke on main](https://github.com/ejob-ai/Concillio/actions/workflows/smoke-e2e.yml/badge.svg?branch=main)](https://github.com/ejob-ai/Concillio/actions/workflows/smoke-e2e.yml)

### Preview validation
This commit is used to validate preview deploy + Access login + JUnit artifacts.
Tag: `preview-validation-2025-09-26`

<!-- preview-validation-2025-09-26 -->

## Note: Submodule removed (Concillio/)

Historically, the application code under `Concillio/` was tracked as a **git submodule**.
It has now been **absorbed into this repository as regular files** (no `.gitmodules`, no gitlinks).

### What this means
- There are **no submodules** in this repo anymore.
- `Concillio/` is just a normal directory tracked by git.

### If your local clone still thinks it’s a submodule
Some older clones may show errors like “no submodule mapping found” or treat `Concillio/` as a gitlink.
To fix your local checkout, run:

```bash
git fetch --all
git pull --rebase
# If your clone still shows submodule/gitolink state for Concillio:
git submodule deinit -f --all || true
rm -rf .git/modules/Concillio || true
git reset --hard HEAD
```

## Table of contents
- [🚀 Quick checklist (Preview → Production)](#-quick-checklist-preview--production)
- [📴 Disable Pages native build (use GitHub Actions only)](#-disable-pages-native-build-use-github-actions-only)
- [🧪 CI: Build → Deploy → Deploy-checks → E2E](#-ci-build--deploy--deploy-checks--e2e)
- [🧾 Deploy-runbook (Preview → Production)](#-deploy-runbook-preview--production)
- [💳 Billing & Stripe](#-billing--stripe)
  - [Checkout (GET-only) & Thank-you](#checkout-get-only--thank-you)
  - [Billing Portal & /app/billing](#billing-portal--appbilling)
  - [Webhooks & dedup](#webhooks--dedup)
- [🧪 E2E test-login (CI/preview)](#-e2e-test-login-cipreview)

AI-driven rådslagstjänst med roller (Strategist, Futurist, Psychologist, Senior Advisor, Summarizer) och executive consensus.

---

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

### Deployment

We deploy via Cloudflare Pages using Wrangler.

👉 Run `npm run deploy:pages` to deploy with Wrangler (uses --commit-dirty=true). Also available via: `wrangler pages deploy dist --project-name concillio --commit-dirty=true`.

👉 Note: Keep `compatibility_date` in `wrangler.jsonc` reasonably fresh.  
Update it whenever Wrangler is bumped or new Cloudflare runtime features are needed.

#### How to bump compatibility_date

Update the date in `wrangler.jsonc` to today’s date:

```sh
# 1. Edit wrangler.jsonc
"compatibility_date": "2025-09-16"

# 2. Commit
git add wrangler.jsonc
git commit -m "chore(wrangler): bump compatibility_date to YYYY-MM-DD"

# 3. Deploy
npm run build && npm run deploy
```

👉 See [docs/ci-git-access.md](./docs/ci-git-access.md) for SSH/Deploy key setup in CI.  
👉 See [Key management](./docs/ci-git-access.md#key-management) for policies on personal vs deploy keys.

### SEO
- Sitemap ligger i public/sitemap.xml; uppdatera när nya docs-sidor tillkommer.


## 🚀 Quick checklist (Preview → Production)

> 1. **Öppna PR** → triggar preview-kedjan (build, deploy, checks, E2E).
> 2. **Preflight**:
>    - GitHub Environments: preview har `TEST_LOGIN_TOKEN`; production har reviewers, inga test-secrets.
>    - Cloudflare Pages: preview har `TEST_LOGIN_ENABLED=1` + token; production ej satta.
>    - Stripe: `STRIPE_SECRET_KEY` i preview/prod om du vill ha riktig 302 (annars 501 accepteras).
> 3. **Actions → deploy-preview**: kolla att deploy-checks + E2E passerar.
> 4. **Merge → main**: godkänn production → deploy-checks (helpers OFF) + E2E (positiva test skippar).

---

*(Här fortsätter den längre, detaljerade runbooken som du redan har dokumenterat.)*

## E2E (preview) – GitHub Actions & Cloudflare Pages

Workflow: .github/workflows/preview-e2e.yml
Jobs:

preview → bygger + publicerar Pages preview

e2e → kör Playwright-matris mot preview-URL

junit-summary → publicerar sammanfattning

Output mellan jobb

preview exporterar pages_url = steps.pages.outputs.alias || steps.pages.outputs.url

e2e använder BASE_URL = needs.preview.outputs.pages_url

Fork-aware Access-preflight (HEAD)

Körs bara när PR:en inte kommer från fork och secrets för Access finns.

Headers:

CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID

CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET

Krav: HTTP 200/204 (failar på 302). Detta bekräftar att Cloudflare Access släpper igenom service-token innan vi startar Playwright.

Secrets (repo → Settings → Secrets and variables → Actions)
Preview deploy (krävs alltid):

CLOUDFLARE_API_TOKEN

CLOUDFLARE_ACCOUNT_ID

Preview bakom Access (frivilligt men rekommenderas):

CF_ACCESS_CLIENT_ID

CF_ACCESS_CLIENT_SECRET

Artefakter & rapporter

Per-browser JUnit: junit/junit-<browser>.xml

Per-browser HTML-rapport: playwright-report-<browser>/

Sammanfattnings-check: E2E (preview) – Summary (använd som Required check).

Så här ser flödet ut

npm ci && npm run build

cloudflare/pages-action@v1 publicerar från dist till projekt concillio

Access-preflight (HEAD) mot preview-URL (obligatorisk internt, hoppar över vid fork)

Playwright körs i matrisen (chromium, firefox, webkit) mot BASE_URL

JUnit + HTML laddas upp, sammanfattning postas

Vanlig felsökning (preview)

302 i preflight → Access-policy/Service-Token träffar inte preview-domänen. Lägg en Access-app för *.concillio.pages.dev med Service Auth överst och pekande på rätt service-token; rotera tokens och uppdatera secrets.

404/403 → bygg/deploy misslyckades eller Workers/Bindings saknas (kolla Pages Deployment log + Pages → Settings → Functions → Bindings).

## E2E Smoke (main)

Workflow: .github/workflows/smoke-e2e.yml
Preflight (HEAD) – strikt: alltid 200/204 krävs mot SMOKE_BASE_URL med service-token headers.
Secrets:

SMOKE_BASE_URL (t.ex. https://smoke.concillio.com)

CF_ACCESS_CLIENT_ID_SMOKE

CF_ACCESS_CLIENT_SECRET_SMOKE

Check: E2E Smoke on main – Summary (rekommenderas som Required check).

Access (Smoke)

Access-app: smoke.concillio.com med Path = / (UI visar / + * → korrekt)

Policyordning: Service Auth först, ALLOW/email efter.

Service-token i policyn måste vara just den som CI använder.

Branch protection (rekommenderas)

Markera följande som Required:

E2E (preview) – Summary (för PR)

E2E Smoke on main – Summary (för main)

Snabb verifiering

Öppna en PR → se jobben preview, e2e, junit-summary.

I preview: kolla att pages_action gav en URL och att ev. Access-preflight fick 200/204.

e2e: ska använda exakt den URL:en (syns i logg som BASE_URL=…).

Artefakter: JUnit + HTML per browser är uppladdade.


## 🧪 CI: Build → Deploy → Deploy-checks → E2E

Vår GitHub Actions workflow kör samma sekvens för både preview och production:

1. **Build & unit tests** – bygger och kör Vitest.
2. **Deploy** – Pages-action laddar upp dist-artifact.
3. **Deploy-checks** – kör scripts/deploy-check.sh (Stripe 302/501, noindex, helpers ON/OFF).
4. **E2E** – Playwright-tester (positiva portaltestet endast i preview, skip i prod).

→ Preview kör auto-deploy med helpers **ON**.  
→ Production kräver reviewers (manual approval) och kör helpers **OFF**.


- build-and-test: kör unit (Vitest) + build och laddar upp artefakten dist-bundle.
- deploy-preview (environment: preview): laddar ner dist-bundle, deployar via cloudflare/pages-action@v1, kör deploy-checks (helpers ON), kör E2E med TEST_LOGIN_TOKEN.
- deploy-production (environment: production): kräver approval, laddar ner dist-bundle, deployar via cloudflare/pages-action@v1, kör deploy-checks (helpers OFF), kör E2E utan TEST_LOGIN_TOKEN.
- Artefakter vid fel: Playwright-report och traces laddas upp.
- Endast Actions deployar; Pages inbyggda build är avstängd (se sektionen “Disable Pages native build”).

### CI/CD quick facts

- **Pipeline**: `build-and-test` → `deploy-preview` (Chromium/FF/WebKit) → `deploy checks` → `E2E matrix` → (on `main`) `deploy-production`.
- **Required checks (PRs)**:  
  - ✅ `build-and-test`  
  - ✅ `deploy-preview (chromium)` → “Run E2E smoke (chromium)”  
  - ⚠️ _Not required_: `deploy-preview (firefox|webkit)` (soft-fail)
  - ⚠️ _Not required_: “Deploy checks (preview)” (soft-accepts secret gaps)
- **Preview deploy checks**: allow either `302` to Stripe **or** `501`/non-Stripe `302` when secrets/prices are missing.  
  **Production** requires `302` to `checkout.stripe.com`.
- **Stripe price IDs** come from env: `PRICE_STARTER`, `PRICE_PRO`, `PRICE_LEGACY`  
  Clear failures:  
  - `UNKNOWN_PLAN` → `400`  
  - `MISSING_PRICE_ID_*` → `501`  
  - Missing Stripe secret → `501`
- **SSR**: `/thank-you` is `noindex` + sends `checkout_success` beacon; `/app/billing` is session-guarded in prod.
- **Helpers**: preview-only test helpers are ON (via env), OFF in production.
- **Artifacts**: Playwright report per browser + aggregated ZIP; sticky PR comment posts the preview URL.

## 🧾 Deploy-runbook (Preview → Production)


> ### Quick checklist
> 1. **Öppna PR** → triggar preview-kedjan (build, deploy, checks, E2E).
> 2. **Preflight**:
>    - GitHub Environments: preview har `TEST_LOGIN_TOKEN`; production har reviewers, inga test-secrets.
>    - Cloudflare Pages: preview har `TEST_LOGIN_ENABLED=1` + token; production ej satta.
>    - Stripe: `STRIPE_SECRET_KEY` i preview/prod om du vill ha riktig 302 (annars 501 accepteras).
> 3. **Actions → deploy-preview**: kolla att deploy-checks + E2E passerar.
> 4. **Merge → main**: godkänn production → deploy-checks (helpers OFF) + E2E (positiva test skippar).

---

*(Här fortsätter den längre, detaljerade runbooken som du redan har dokumenterat.)*

Översikt

- Preview/PR: auto-deploy av samma build, helpers ON, fulla E2E (inkl. positiv portal).
- Production (main): gated deploy (Required reviewers), helpers OFF, E2E utan test-login.

Flöde

1) PR → Preview (auto)

- Push PR.
- Workflow build-and-test kör unit + build.
- Jobb deploy-preview:
  - Deploy till Cloudflare Pages (preview).
  - Deploy-checks:
    - GET /api/billing/checkout/start → 302 till Stripe
    - UNKNOWN_PLAN → 400
    - /thank-you → 200 + noindex
    - Test-helpers: ON (200 på /api/test/login/logout)
  - E2E (Playwright): Billing-länk, portal-guard (negativ), portal-guard positiv via test-login.
  - Artefakter vid fail: playwright-report/, test-results/ (PNG/HTML/console).
- Om något failar: öppna Actions → workflow-körning → läs “Deploy checks” och E2E-rapporterna, fixa, pusha igen.

2) Merge till main → Production (gated)

- Merge PR → main.
- Jobb deploy-production (environment: production) väntar på approval:
  - Gå till Actions → körningen → klicka “Review deployments” → Approve and deploy.
- Efter approval:
  - Deploy till prod.
  - Deploy-checks: helpers OFF (403 på /api/test/login/logout), övriga kontroller som i preview.
  - E2E (utan test-login; positiva testet skippas).
- Om checks/E2E failar i prod: se “Felsökning & Rollback” nedan.

Roller & behörigheter

- Required reviewers (production env): måste godkänna innan prod-deploy startar.
- Preview env: inga reviewers, snabb auto.

Var hittar jag vad?

- Preview URL / Prod URL: i steget “Resolve BASE_URL / ENVIRONMENT”.
- Deploy-checks loggar: steget “Deploy checks”.
- E2E-artefakter:
  - playwright-report/ (HTML-rapport)
  - test-results/ (fullPage PNG, HTML-dump, *.console.txt)
- Cloudflare Pages loggar: Pages → projekt → Deployments → Logs.

Felsökning

Vanliga orsaker till fail

- Stripe 302 saknas → STRIPE_SECRET_KEY saknas/fel i Pages prod.
- Test-helpers fel i preview → TEST_LOGIN_ENABLED=1 och TEST_LOGIN_TOKEN saknas/inte matchar GitHub env.
- Helpers råkar vara på i prod → deploy-checks stoppar (403-guard misslyckas). Ta bort env i Pages prod.

Snabb åtgärd

- Rotera TEST_LOGIN_TOKEN (preview env i GitHub + Pages Preview):

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- Kör om jobben: Actions → välj körning → “Re-run jobs”.

Rollback (snabb)

- I Cloudflare Pages: promota senaste gröna deploymenten till prod (Revert/Promote).
- Alternativ: revert-commit i main → ny pipeline → godkänn ny prod-deploy.

Environments & secrets (policy)

- GitHub Environments
  - preview: TEST_LOGIN_TOKEN (endast här).
  - production: inga test-secrets. Required reviewers aktivt (ev. wait timer, branch=main).
- Cloudflare Pages
  - Preview: TEST_LOGIN_ENABLED=1, TEST_LOGIN_TOKEN=<samma som GitHub env>.
  - Production: inte satta.

Manuell verifikation (preview)

Test-login

```
curl -i -X POST "$BASE_URL/api/test/login" \
  -H "x-test-auth: $TEST_LOGIN_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"email":"e2e-billing@example.com","customerId":"cus_e2e_123","plan":"starter","status":"active"}'
```

Test-logout

```
curl -i -X POST "$BASE_URL/api/test/logout" -H "x-test-auth: $TEST_LOGIN_TOKEN"
```

Prod: båda ska alltid ge 403 (deploy-checks garanterar).

När flytta fram gränsen?

- När POST-stubben varit borta i >2 veckor: ta bort TODO + rensa kod.
- När webhook-flöden är stabila: lägg E2E/QA för customer.subscription.deleted och invoice.payment_failed.
