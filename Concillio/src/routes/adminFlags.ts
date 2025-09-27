import { Hono } from 'hono'
import { loadHeuristicsFlags } from '../utils/flags'

function allowed(c:any){
  const dev = String((c.env as any).DEV || '').toLowerCase() === 'true'
  if (dev) return true
  const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || ''
  const allow = String((c.env as any).ADMIN_IP_ALLOWLIST || '')
  return allow.split(',').map((s)=>s.trim()).filter(Boolean).includes(ip)
}

const adminFlags = new Hono()

adminFlags.get('/admin/flags', async (c) => {
  if (!allowed(c)) return c.text('Forbidden', 403)
  const f = await loadHeuristicsFlags(c.env)
  const html = `<!doctype html><meta charset=utf-8>
  <style>body{font-family:system-ui,Arial;padding:20px;max-width:720px;margin:auto}label{display:block;margin:8px 0}</style>
  <h1>Feature flags</h1>
  <form method="post" action="/admin/flags">
    <fieldset><legend>Heuristics</legend>
      <label>Enabled:
        <select name="heuristics.enabled">
          <option value="true" ${f.enabled?'selected':''}>true</option>
          <option value="false" ${!f.enabled?'selected':''}>false</option>
        </select>
      </label>
      <label>cap (0..1): <input type="number" step="0.01" min="0" max="1" name="heuristics.cap" value="${f.cap}"></label>
      <label>perRoleMax (0..1): <input type="number" step="0.01" min="0" max="1" name="heuristics.perRoleMax" value="${f.perRoleMax}"></label>
      <label>maxHits: <input type="number" min="0" max="10" name="heuristics.maxHits" value="${f.maxHits}"></label>
    </fieldset>
    <button type="submit">Save</button>
  </form>
  <p style="margin-top:16px;color:#666">OBS: Skrivs till FLAGS_KV och slår igenom omedelbart utan ny deploy.</p>`
  return c.html(html)
})

adminFlags.post('/admin/flags', async (c) => {
  if (!allowed(c)) return c.text('Forbidden', 403)
  const kv = c.env.FLAGS_KV as KVNamespace
  const body = await c.req.parseBody()
  const enabled = String(body['heuristics.enabled']||'true').toLowerCase()==='true'
  const cap = clamp01(Number(body['heuristics.cap']||0.25))
  const per = clamp01(Number(body['heuristics.perRoleMax']||0.15))
  const hits = Math.max(0, Math.min(10, Number(body['heuristics.maxHits']||3)))

  await kv.put('flag:heuristics.enabled', String(enabled))
  await kv.put('flag:heuristics.cap', String(cap))
  await kv.put('flag:heuristics.per_role_max', String(per))
  await kv.put('flag:heuristics.max_hits', String(hits))

  return c.redirect('/admin/flags', 302)
})

function clamp01(x:number){ if(!Number.isFinite(x)) return 0; return Math.max(0, Math.min(1, x)) }

export default adminFlags
