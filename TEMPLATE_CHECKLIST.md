# ✅ Template Checklist – Concillio Framework

Den här checklistan används när du startar ett nytt projekt baserat på ram-släppet.

---

## 1. Repo & kod
- [ ] Klona eller exportera `v1.0.0-framework`
- [ ] Lägg till egen `README.md` (beskriv projektet)
- [ ] Anpassa `docs/Quickstart.md` (ersätt projektnamn, domän)

---

## 2. Secrets (Cloudflare Pages)
- [ ] `OPENAI_API_KEY` (om OpenAI ska användas)
- [ ] `LLM_PROVIDER=openai|mock`
- [ ] `DEV=true` **eller** `ADMIN_IP_ALLOWLIST=ip1,ip2`
- [ ] `COST_LIMIT_USD` (t.ex. 10)
- [ ] `COST_WEBHOOK_URL` (Slack/Teams/Discord-webhook för alerts)
- [ ] `AUDIT_HMAC_KEY` (slumpad secret för audit-hash)

---

## 3. Bindningar (wrangler.jsonc)
- [ ] `DB` (D1-database, t.ex. `concillio-production`)
- [ ] `KV_RL` (rate-limit)
- [ ] `RL_KV` (legacy RL, kan peka på samma)
- [ ] `PROGRESS_KV`
- [ ] `AUDIT_LOG_KV` (om audit via KV behövs)

---

## 4. Migrations
- [ ] Kör:
  ```bash
  npx wrangler d1 migrations apply <db-name> --remote
  ```
- [ ] Bekräfta att `analytics_council` har fält: `schema_version`, `prompt_version`

---

## 5. Testflöden
- [ ] `curl -I https://<host>` → CSP + Referrer-Policy synliga
- [ ] `curl -X POST /api/council/consult ...` → svar `{ ok:true, id, progress_id }`
- [ ] `/minutes/:id` renderar med lineup och output
- [ ] `/admin/health` → visar OK på KV/D1 (kräver DEV/IP-allowlist)
- [ ] `/admin/analytics.json?limit=20` → visar role_done + minutes_saved
- [ ] `/admin/cost` → totals och per-roll breakdown
- [ ] `/og?title=Test&subtitle=OK` → valid SVG 1200×630

---

## 6. Extra skydd (rekommenderas)
- [ ] Lägg till `X-Content-Type-Options: nosniff` header
- [ ] Lägg till `Permissions-Policy` header
- [ ] Aktivera HSTS om domän är HTTPS-låst
- [ ] Protect `v*`-tags i GitHub

---

## 7. Första release
- [ ] Skapa GitHub Release baserat på ny tagg (`vX.Y.Z-project`)
- [ ] Ladda upp `tar.gz/zip` + checksums

---

👉 Vill du att jag även skriver **SHA256SUMS-action** (GitHub Action som kör vid release och publicerar checksums automatiskt)?