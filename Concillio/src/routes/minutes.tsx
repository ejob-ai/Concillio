import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

// Simple i18n helpers (reuse minimal from index)
const SUPPORTED_LANGS = ['sv', 'en'] as const
 type Lang = typeof SUPPORTED_LANGS[number]
function getLangFromReq(c: any): Lang {
  const q = c.req.query('lang') || c.req.query('locale')
  let lang = (q || getCookie(c, 'lang') || 'sv').toLowerCase()
  if (!SUPPORTED_LANGS.includes(lang as any)) lang = 'sv'
  return lang as Lang
}

function t(lang: Lang) {
  return lang === 'en'
    ? {
        minutes_title: 'Council Minutes',
        case_title: 'Case',
        consensus: 'Council Consensus',
        recommendations: 'Recommendations',
        back_to_minutes: 'Back to minutes',
        download_pdf: 'Download PDF',
        validated_badge: 'Validated schema v2',
        consensus_details: 'Consensus Details',
      }
    : {
        minutes_title: 'Protokoll',
        case_title: 'Ärende',
        consensus: 'Rådets konsensus',
        recommendations: 'Rekommendationer',
        back_to_minutes: 'Tillbaka till protokollet',
        download_pdf: 'Ladda ner PDF',
        validated_badge: 'Validerad schema v2',
        consensus_details: 'Konsensusdetaljer',
      }
}

const minutesRouter = new Hono()

minutesRouter.get('/minutes/:id', async (c) => {
  const { DB } = c.env as any
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.notFound()
  try {
    const row = await DB.prepare(
      `SELECT id, question, context, roles_json, consensus_json, advisor_bullets_json, prompt_version, consensus_validated, created_at
       FROM minutes WHERE id = ?`
    ).bind(id).first<any>()
    if (!row) return c.notFound()

    const lang = getLangFromReq(c)
    const L = t(lang)

    let roles: Array<{ role: string; analysis?: string; recommendations?: string[] }> = []
    try { roles = JSON.parse(row.roles_json || '[]') } catch {}
    const consensusRaw = (() => { try { return JSON.parse(row.consensus_json || '{}') } catch { return {} } })()

    // Build absolute URL for PDF export
    const selfUrl = (() => { try { const u = new URL(c.req.url); return `${u.origin}${u.pathname}?lang=${lang}` } catch { return `/minutes/${id}?lang=${lang}` } })()
    const pdfUrl = `/api/pdf/export?url=${encodeURIComponent(selfUrl)}`

    c.set('head', { title: `${L.minutes_title} #${id}`, description: L.consensus })

    return c.render(
      <main class="min-h-screen container mx-auto px-6 py-8 bg-white text-slate-900">
        <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h1 class="font-['Crimson_Text'] text-3xl text-slate-900">{L.minutes_title} #{id}</h1>
          <div class="flex items-center gap-2">
            {row.consensus_validated ? (
              <span class="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border border-[var(--concillio-gold)] text-[var(--concillio-gold)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 7L9 18l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {L.validated_badge}
              </span>
            ) : null}
            <a class="inline-flex items-center gap-2 px-3 py-2 rounded border border-slate-300 text-slate-800 hover:border-[var(--concillio-gold)]" href={pdfUrl}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {L.download_pdf}
            </a>
          </div>
        </div>

        <section class="border border-slate-200 rounded-xl p-5 bg-white">
          <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.case_title}</div>
          <div class="text-slate-900">{row.question}</div>
          {row.context ? <div class="mt-2 text-slate-600 whitespace-pre-wrap text-sm">{String(row.context)}</div> : null}
        </section>

        <section class="mt-8">
          <div class="font-['Crimson_Text'] text-2xl text-slate-900 mb-3">Council Voices</div>
          <div class="grid md:grid-cols-2 gap-4">
            {roles.map((r) => (
              <div class="border border-slate-200 rounded-lg p-4 bg-white">
                <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-1">{r.role}</div>
                {r.analysis ? <div class="text-slate-600 text-sm">{r.analysis}</div> : null}
                {Array.isArray(r.recommendations) && r.recommendations.length ? (
                  <ul class="mt-2 list-disc list-inside text-slate-800 text-sm">
                    {r.recommendations.map((x) => <li>{x}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section class="mt-10 border border-slate-200 rounded-xl p-5 bg-white relative overflow-hidden">
          <div class="absolute -right-6 -top-10 text-[120px] font-['Crimson_Text'] text-[color-mix(in_oklab,var(--concillio-gold)25%,transparent)] select-none">C</div>
          <div class="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#ffffff" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M24 33 l6 6 l12 -14" stroke="var(--concillio-gold)" stroke-width="3" fill="none"/></svg>
            <div class="text-[var(--concillio-gold)] font-semibold">{L.consensus}</div>
          </div>
          <div class="mt-2 text-slate-800">
            {(() => {
              const c2 = consensusRaw as any
              const lines: string[] = []
              if (c2?.decision) lines.push(String(c2.decision))
              if (Array.isArray(c2?.consensus_bullets)) lines.push(...c2.consensus_bullets.map((x:any)=>String(x)))
              if (!lines.length && c2?.unanimous_recommendation) lines.push(String(c2.unanimous_recommendation))
              if (!lines.length && c2?.summary) lines.push(String(c2.summary))
              return lines.length ? <ul class="list-disc list-inside">{lines.map((x)=><li>{x}</li>)}</ul> : <div class="text-slate-500 text-sm">—</div>
            })()}
          </div>
          <div class="mt-3">
            <a class="inline-flex items-center gap-2 px-3 py-2 rounded border border-slate-300 text-slate-800 hover:border-[var(--concillio-gold)]" href={`/minutes/${id}/consensus?lang=${lang}`}>{L.consensus_details}</a>
          </div>
        </section>
      </main>
    )
  } catch (e) {
    return c.json({ ok: false, error: String((e as any)?.message || e) }, 500)
  }
})

minutesRouter.get('/minutes/:id/consensus', async (c) => {
  const { DB } = c.env as any
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.notFound()
  const row = await DB.prepare('SELECT id, consensus_json, consensus_validated FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()
  const lang = getLangFromReq(c)
  const L = t(lang)
  const c2 = (() => { try { return JSON.parse(row.consensus_json || '{}') } catch { return {} } })()
  c.set('head', { title: `${L.consensus} #${id}`, description: L.consensus })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-8 bg-white text-slate-900">
      <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h1 class="font-['Crimson_Text'] text-3xl text-slate-900">{L.consensus} #{id}</h1>
        {row.consensus_validated ? (
          <span class="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border border-[var(--concillio-gold)] text-[var(--concillio-gold)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 7L9 18l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {L.validated_badge}
          </span>
        ) : null}
      </div>
      <div class="border border-slate-200 rounded-xl p-5 bg-white">
        {(() => {
          const blocks: Array<{ title: string; items: string[] }> = []
          const push = (title: string, v: any) => {
            const arr = Array.isArray(v) ? v.map((x:any)=>String(x)) : []
            if (arr.length) blocks.push({ title, items: arr })
          }
          if (c2?.decision) blocks.push({ title: 'Decision', items: [String(c2.decision)] })
          if (c2?.summary) blocks.push({ title: 'Summary', items: [String(c2.summary)] })
          push(lang==='sv'?'Konsensuspunkter':'Consensus bullets', c2?.consensus_bullets)
          push(lang==='sv'?'Skäl':'Rationale', c2?.rationale_bullets)
          push(lang==='sv'?'Risker':'Top risks', c2?.top_risks)
          push(lang==='sv'?'Villkor':'Conditions', c2?.conditions)
          const extras = [] as string[]
          if (Number.isFinite(Number(c2?.review_horizon_days))) extras.push((lang==='sv'?'Granskningshorisont: ':'Review horizon: ')+String(c2.review_horizon_days)+' d')
          if (Number.isFinite(Number(c2?.confidence))) extras.push((lang==='sv'?'Konfidens: ':'Confidence: ')+String(Math.round(Number(c2.confidence)*100))+'%')
          if (extras.length) blocks.push({ title: lang==='sv'?'Meta':'Meta', items: extras })
          return (
            <div class="space-y-5">
              {blocks.map(b => (
                <div>
                  <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-1">{b.title}</div>
                  <ul class="list-disc list-inside text-slate-800">{b.items.map(x => <li>{x}</li>)}</ul>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
      <div class="mt-6">
        <a class="inline-flex items-center gap-2 px-3 py-2 rounded border border-slate-300 text-slate-800 hover:border-[var(--concillio-gold)]" href={`/minutes/${id}?lang=${lang}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 19l-7-7 7-7M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {L.back_to_minutes}
        </a>
      </div>
    </main>
  )
})

export default minutesRouter
