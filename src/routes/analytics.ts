import { Hono } from 'hono'
import { rateLimit } from '../middleware/rateLimit'

const analyticsRouter = new Hono()

// Note: Per-IP limiter is already mounted in src/index.tsx for this path.

type CouncilRow = {
  event?: string
  label?: string | null
  path?: string | null
  ts?: number | string | null
  ts_client?: number | string | null
}

type CtaRow = {
  cta: string
  source?: string | null
  href?: string | null
  ts?: number | string | null
  ts_client?: number | string | null
}

function scrubPII(x: any): any {
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
  const phone = /(\+?\d[\d\s\-()]{7,}\d)/g
  const ssnSe = /\b(\d{6}|\d{8})[-+]\d{4}\b/g
  const repl = (s: string) => s
    .replace(email, '[email]')
    .replace(phone, '[phone]')
    .replace(ssnSe, '[personnummer]')
  if (typeof x === 'string') return repl(x)
  if (x && typeof x === 'object') {
    const out: any = Array.isArray(x) ? [] : {}
    for (const k of Object.keys(x)) {
      const v = (x as any)[k]
      out[k] = typeof v === 'string' ? repl(v) : scrubPII(v)
    }
    return out
  }
  return x
}

analyticsRouter.post('/api/analytics/council', async (c) => {
  try {
    const DB = c.env.DB as D1Database
    if (!DB) return c.json({ ok: false, error: 'No DB binding' }, 500)

    // Try to parse JSON; allow empty body
    const body: any = await c.req.json().catch(() => ({}))
    const nowIso = new Date().toISOString().replace('T', ' ').replace('Z','')

    // Ensure base tables
    // Defensive: create minimal tables first, then ALTER in columns
    await DB.prepare("CREATE TABLE IF NOT EXISTS analytics_council (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)").run()
    try { await DB.prepare("ALTER TABLE analytics_council ADD COLUMN label TEXT").run() } catch {}
    try { await DB.prepare("ALTER TABLE analytics_council ADD COLUMN path TEXT").run() } catch {}
    try { await DB.prepare("ALTER TABLE analytics_council ADD COLUMN ts_client TEXT").run() } catch {}
    try { await DB.prepare("ALTER TABLE analytics_council ADD COLUMN ts_server TEXT").run() } catch {}
    try { await DB.prepare("ALTER TABLE analytics_council ADD COLUMN created_at TEXT").run() } catch {}

    await DB.prepare("CREATE TABLE IF NOT EXISTS analytics_cta (id INTEGER PRIMARY KEY AUTOINCREMENT, cta TEXT)").run()
    try { await DB.prepare("ALTER TABLE analytics_cta ADD COLUMN source TEXT").run() } catch {}
    try { await DB.prepare("ALTER TABLE analytics_cta ADD COLUMN href TEXT").run() } catch {}
    try { await DB.prepare("ALTER TABLE analytics_cta ADD COLUMN ts_client TEXT").run() } catch {}
    try { await DB.prepare("ALTER TABLE analytics_cta ADD COLUMN ts_server TEXT").run() } catch {}
    try { await DB.prepare("ALTER TABLE analytics_cta ADD COLUMN created_at TEXT").run() } catch {}

    // Normalize payload
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || ''
    const ua = c.req.header('User-Agent') || ''

    // If CTA payload, store into analytics_cta
    if (typeof body?.cta === 'string' && body.cta.trim()) {
      // Scrub potential PII from source/href
      const ctaRec: CtaRow = {
        cta: String(body.cta).slice(0, 200),
        source: body.source ? String(body.source).slice(0, 400) : null,
        href: body.href ? String(body.href).slice(0, 1000) : null,
        ts_client: body.ts_client ? String(body.ts_client) : (body.ts ? String(body.ts) : null)
      }
      await DB.prepare(
        `INSERT INTO analytics_cta (cta, source, href, ts_client, ts_server)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        ctaRec.cta,
        ctaRec.source,
        ctaRec.href,
        ctaRec.ts_client,
        nowIso
      ).run()
      return c.json({ ok: true })
    }

    // Else generic council event
    const row: CouncilRow = {
      event: body?.event ? String(body.event).slice(0, 120) : null,
      label: body?.label != null ? String(body.label).slice(0, 400) : null,
      path: body?.path != null ? String(body.path).slice(0, 400) : null,
      ts_client: body?.ts_client ? String(body.ts_client) : (body?.ts ? String(body.ts) : null)
    }

    // Fallback to simple heuristics if no event and we can infer
    if (!row.event) {
      // Example: payloads like { role: 'menu', action: 'open' }
      const role = body?.role ? String(body.role) : ''
      const action = body?.action ? String(body.action) : ''
      if (role && action) row.event = `${role}_${action}`
    }

    await DB.prepare(
      `INSERT INTO analytics_council (event, label, path, ts_client, ts_server)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      row.event,
      row.label,
      row.path,
      row.ts_client,
      nowIso
    ).run()

    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

export default analyticsRouter
