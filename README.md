# Concillio

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

## E2E test-login (CI/preview)

För stabila positiva E2E-tester använder vi en dev/CI-låst test-login-endpoint som seedar user/org/subscription i D1 och sätter en giltig session-cookie.

Miljövariabler (endast preview/PR)

TEST_LOGIN_ENABLED=1

TEST_LOGIN_TOKEN=<hemlig slumpnyckel>
(samma värde ligger som TEST_LOGIN_TOKEN i GitHub Secrets så att E2E kan anropa helpern)

Produktion: sätt inte dessa variabler (endpoint svarar 403).

Endpoint
POST /api/test/login
Headers: x-test-auth: <TEST_LOGIN_TOKEN>
Body (JSON): {
  "email": "e2e-billing@example.com",
  "customerId": "cus_e2e_123",
  "plan": "starter",              // starter | pro | legacy
  "status": "active",             // active | past_due | canceled ...
  "seats": 1
}


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

## Testing

Run the Vitest harness against built worker:

```
npm run test
```

This uses wrangler unstable_dev to run dist/_worker.js and asserts the 405 media guards remain in place.

---

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


