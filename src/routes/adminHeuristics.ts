// src/routes/adminHeuristics.ts
import { Hono } from 'hono'
import { getActiveHeuristicRules } from '../utils/heuristicsRepo'

function allowed(c: any) {
  const dev = String((c.env as any).DEV || '').toLowerCase() === 'true'
  if (dev) return true
  const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || ''
  const allow = String((c.env as any).ADMIN_IP_ALLOWLIST || '')
  return allow.split(',').map((s) => s.trim()).filter(Boolean).includes(ip)
}

const adminHeur = new Hono()

adminHeur.get('/admin/heuristics', async (c) => {
  if (!allowed(c)) return c.text('Forbidden', 403)
  const locale = c.req.query('locale') || 'sv-SE'
  const rules = await getActiveHeuristicRules((c.env as any).DB, locale)
  const rows = rules
    .map(
      (r) =>
        `<tr><td class="px-3 py-1">${r.keyword}</td><td class="px-3 py-1">${r.role_key}</td><td class="px-3 py-1">${r.delta}</td><td class="px-3 py-1">${r.locale}</td><td class="px-3 py-1">1</td></tr>`
    )
    .join('')
  return c.html(`<!doctype html>
  <html><head><meta charset="utf-8"/>
  <title>Heuristic Rules</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="stylesheet" href="/static/style.css"/>
  <style>
    body{background:#0b0d10;color:#e5e7eb}
    .card{background:#0f1216;border:1px solid #262a32;border-radius:12px;padding:16px}
    table{width:100%;border-collapse:collapse}
    td,th{border-bottom:1px solid #262a32}
  </style>
  </head><body class="p-6">
    <div class="card">
      <h1 class="text-xl mb-2">Active heuristic rules (${locale})</h1>
      <table>
        <thead><tr><th class="text-left px-3 py-2">keyword</th><th class="text-left px-3 py-2">role</th><th class="text-left px-3 py-2">delta</th><th class="text-left px-3 py-2">locale</th><th class="text-left px-3 py-2">active</th></tr></thead>
        <tbody>${rows || ''}</tbody>
      </table>
    </div>
  </body></html>`)
})

export default adminHeur
