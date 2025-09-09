# Concillio Framework – Quickstart

Den här mallen är en körbar ram för rådsliknande AI-flöden (roller → konsensus) på Cloudflare Pages/Workers + D1/KV.

## 0) Förkrav
- Node 18+
- Wrangler 3+
- Ett Cloudflare Pages-projekt
- (Valfritt) OpenAI-nyckel

## 1) Installera
```bash
npm ci

2) Lokala hemligheter (.dev.vars)

Skapa en .dev.vars i projektroten:

OPENAI_API_KEY=sk-...        # valfritt, lämna tomt för mock
DEV=true                      # aktivera adminrutter lokalt
COST_LIMIT_USD=10

3) D1 & KV lokalt
# skapa/applicera migreringar lokalt
npx wrangler d1 migrations apply concillio-production --local

# skapa KV namespaces (för rate limit)
npx wrangler kv:namespace create KV_RL
npx wrangler kv:namespace create KV_RL --preview


Uppdatera wrangler.jsonc med de ID:n som returneras.

4) Kör lokalt
npm run build
npx wrangler pages dev dist

5) Förhandsgranska sidor

Översikt: /council

Frågeflöde: /council/ask

Minutes: /minutes/:id

Admin (dev-skydd): /admin/health, /admin/analytics, /admin/cost