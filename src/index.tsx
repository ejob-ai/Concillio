import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { serveStatic } from 'hono/cloudflare-workers'
import { rateLimit } from './middleware/rateLimit'
import { idempotency } from './middleware/idempotency'
import { getCookie, setCookie } from 'hono/cookie'
import { computePromptHash, loadPromptPack, compileForRole, computePackHash } from './utils/prompts'

import promptsRouter from './routes/prompts'
import adminRouter from './routes/admin'
import adminUIRouter from './routes/admin-ui'
import seedRouter from './routes/seed'
import advisorRouter from './routes/advisor'

// Types for bindings
type Bindings = {
  OPENAI_API_KEY: string
  DB: D1Database
  BROWSERLESS_TOKEN?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS for API routes (if needed later for clients)
app.use('/api/*', cors())
app.use('/api/*', rateLimit())
app.use('/api/*', idempotency())

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// API subrouter for prompts
app.route('/', promptsRouter)
app.route('/', adminRouter)
app.route('/', adminUIRouter)
app.route('/', seedRouter)
app.route('/', advisorRouter)

app.use(renderer)

// Landing page
app.get('/', (c) => {
  return c.render(
    <main class="min-h-screen">
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#b3a079_0,transparent_40%),radial-gradient(circle_at_80%_30%,#4b5563_0,transparent_35%)]"></div>
        <div class="container mx-auto px-6 py-28">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-3 mb-6">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="#b3a079"/></svg>
              <span class="uppercase tracking-[0.3em] text-sm text-neutral-300">Concillio</span>
            </div>
            <h1 class="font-['Playfair_Display'] text-4xl sm:text-6xl leading-tight text-neutral-50">Din personliga styrelsesal – ett council of minds</h1>
            <p class="mt-6 text-neutral-300 max-w-2xl">Ställ din fråga. Rådet samlas. Du får ett ceremoniellt protokoll med tydliga rekommendationer och ett sigillerat Council Consensus.</p>
            <div class="mt-10 flex gap-4">
              <a href="#ask" class="inline-flex items-center px-5 py-3 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition">Request Access</a>
              <a href="#demo" class="inline-flex items-center px-5 py-3 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">Se demo</a>
            </div>
          </div>
        </div>
      </section>
      <section id="ask" class="container mx-auto px-6 py-16">
        <h2 class="font-['Playfair_Display'] text-3xl text-neutral-100 mb-6">Ställ din fråga</h2>
        <form id="ask-form" class="grid gap-4 max-w-2xl">
          <input name="question" class="bg-neutral-900 border border-neutral-700 rounded p-3 text-neutral-100" placeholder="Ska jag tacka ja till jobberbjudandet?" />
          <textarea name="context" rows={4} class="bg-neutral-900 border border-neutral-700 rounded p-3 text-neutral-100" placeholder="Relevant kontext (mål, constraints, tidshorisont)"></textarea>
          <button id="ask-submit" class="justify-self-start inline-flex items-center px-5 py-2 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition" type="submit">Samla rådet</button>
        </form>

        {/* Progress overlay */}
        <div id="council-working" class="fixed inset-0 hidden items-center justify-center bg-black/60 z-50">
          <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <div class="flex items-start gap-4">
              <svg class="animate-spin mt-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="opacity-20" cx="12" cy="12" r="10" stroke="#b3a079" stroke-width="3"/><path d="M22 12a10 10 0 0 1-10 10" stroke="#b3a079" stroke-width="3"/></svg>
              <div>
                <div class="text-neutral-100 font-semibold">Rådet sammanträder</div>
                <div id="council-working-step" class="text-neutral-400 text-sm mt-1">Förbereder…</div>
              </div>
            </div>
            <div class="mt-4">
              <div class="w-full bg-neutral-800 rounded h-2">
                <div id="council-progress-bar" class="h-2 rounded bg-[#b3a079] transition-all" style="width: 6%;"></div>
              </div>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          const form = document.getElementById('ask-form');
          const submitBtn = document.getElementById('ask-submit');
          const overlay = document.getElementById('council-working');
          const stepEl = document.getElementById('council-working-step');
          const barEl = document.getElementById('council-progress-bar');

          const steps = [
            'Förbereder rådets dokument',
            'Chief Strategist analyserar',
            'Futurist analyserar',
            'Behavioral Psychologist analyserar',
            'Senior Advisor väger samman',
            'Formulerar Council Consensus'
          ];

          let stepIdx = 0; let timerId = null;
          function showWorking() {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            stepIdx = 0;
            updateStep();
            timerId = setInterval(() => {
              if (stepIdx < steps.length - 1) { stepIdx++; updateStep(); }
            }, 1500);
          }
          function hideWorking() {
            if (timerId) clearInterval(timerId);
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
          }
          function updateStep() {
            stepEl.textContent = steps[stepIdx];
            const pct = Math.max(6, Math.min(96, Math.round(((stepIdx+1)/steps.length)*100)));
            barEl.style.width = pct + '%';
          }

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-60','cursor-not-allowed');
            showWorking();
            try {
              const fd = new FormData(form);
              const payload = { question: fd.get('question'), context: fd.get('context') };
              const res = await fetch('/api/council/consult', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': (function(){try{const v=(crypto.randomUUID&&crypto.randomUUID())||String(Date.now());return /^[A-Za-z0-9._-]{1,200}$/.test(v)?v:String(Date.now());}catch(e){return String(Date.now())}})() }, body: JSON.stringify(payload) });
              let text;
              try { text = await res.text(); } catch(e) {
                // Fallback: retry once without Idempotency-Key if browser rejected header
                const res2 = await fetch('/api/council/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                text = await res2.text();
                res = res2;
              }
              let data = null;
              try { data = JSON.parse(text); } catch {}
              if (res.ok && data?.id) {
                location.href = '/minutes/' + data.id;
                return;
              }
              const msg = data?.error || text || 'okänt fel';
              alert('Något gick fel: ' + msg);
            } catch (err) {
              alert('Tekniskt fel: ' + (err?.message || err));
            } finally {
              submitBtn.disabled = false;
              submitBtn.classList.remove('opacity-60','cursor-not-allowed');
              hideWorking();
            }
          });
        ` }} />
      </section>
    </main>
  )
})

// PII scrub + inference logging utilities
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

async function logInference(c: any, row: {
  session_id?: string
  role: string
  pack_slug: string
  version: string
  prompt_hash: string
  model?: string
  temperature?: number
  params_json?: any
  request_ts: string
  latency_ms: number
  cost_estimate_cents?: number | null
  status: 'ok' | 'error'
  error?: string | null
  payload_json?: any
  session_sticky_version?: string | null
}) {
  try {
    const DB = c.env.DB as D1Database
    await DB.prepare(`INSERT INTO inference_log (session_id, role, pack_slug, version, prompt_hash, model, temperature, params_json, request_ts, latency_ms, cost_estimate_cents, status, error, payload_json, session_sticky_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        row.session_id || null,
        row.role,
        row.pack_slug,
        row.version,
        row.prompt_hash,
        row.model || null,
        row.temperature ?? null,
        row.params_json ? JSON.stringify(row.params_json) : null,
        row.request_ts,
        row.latency_ms,
        row.cost_estimate_cents ?? null,
        row.status,
        row.error ?? null,
        row.payload_json ? JSON.stringify(scrubPII(row.payload_json)) : null,
        row.session_sticky_version ?? null
      ).run()
  } catch (e) {
    // best-effort only
  }
}

// API: council consult
app.post('/api/council/consult', async (c) => {
  const { OPENAI_API_KEY, DB } = c.env
  // No early return: if OPENAI key is missing we fall back to mock mode automatically

  const body = await c.req.json<{ question: string; context?: string }>().catch(() => null)
  if (!body?.question) return c.json({ error: 'question krävs' }, 400)

  // Load prompt pack (DB or fallback), sticky pinning via header/cookie can be added later
  const locale = 'sv-SE'
  const cookiePinned = getCookie(c, 'concillio_version')
  const pinned = c.req.header('X-Prompts-Version') || cookiePinned || undefined
  const pack = await loadPromptPack(c.env as any, 'concillio-core', locale, pinned)
  const packHash = await computePackHash(pack)

  // Mock mode: allow testing without OpenAI by adding ?mock=1 or header X-Mock: 1
  const isMock = c.req.query('mock') === '1' || c.req.header('X-Mock') === '1' || !OPENAI_API_KEY
  if (isMock) {
    const roleResults = [
      { role: 'Chief Strategist', analysis: `Strategisk analys för: ${body.question}`, recommendations: ['Fas 1: utvärdera', 'Fas 2: genomför']},
      { role: 'Futurist', analysis: `Scenarier för: ${body.question}`, recommendations: ['No-regret: X', 'Real option: Y']},
      { role: 'Behavioral Psychologist', analysis: 'Mänskliga faktorer identifierade', recommendations: ['Minska loss aversion', 'Beslutsprotokoll A']},
      { role: 'Senior Advisor', analysis: 'Syntes av rådets röster', recommendations: ['Primär väg: ...', 'Fallback: ...']}
    ]
    const consensus = {
      summary: `Sammanvägd bedömning kring: ${body.question}`,
      risks: ['Exekveringsrisk', 'Resursrisk'],
      unanimous_recommendation: 'Gå vidare med stegvis införande'
    }
    await DB.prepare(`CREATE TABLE IF NOT EXISTS minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      context TEXT,
      roles_json TEXT NOT NULL,
      consensus_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run()
    const insert = await DB.prepare(`INSERT INTO minutes (question, context, roles_json, consensus_json) VALUES (?, ?, ?, ?)`)
      .bind(body.question, body.context || null, JSON.stringify(roleResults), JSON.stringify(consensus)).run()
    const id = insert.meta.last_row_id
    c.header('X-Prompt-Pack', `${pack.pack.slug}@${pack.locale}`)
    c.header('X-Prompt-Version', pack.version)
    c.header('X-Prompt-Hash', packHash)
    c.header('X-Model', 'mock')
    setCookie(c, 'concillio_version', pack.version, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' })
    return c.json({ id, mock: true })
  }
  const rolesMap: Record<string, 'STRATEGIST'|'FUTURIST'|'PSYCHOLOGIST'|'ADVISOR'> = {
    'Chief Strategist': 'STRATEGIST',
    'Futurist': 'FUTURIST',
    'Behavioral Psychologist': 'PSYCHOLOGIST',
    'Senior Advisor': 'ADVISOR'
  }
  const roles = ['Chief Strategist', 'Futurist', 'Behavioral Psychologist', 'Senior Advisor'] as const

  const makePrompt = (roleKey: typeof roles[number]) => {
    const entryRole = rolesMap[roleKey]
    const compiled = compileForRole(pack, entryRole, {
      question: body.question,
      context: body.context || '',
      roles_json: '',
      goals: '',
      constraints: ''
    })
    return { system: compiled.system, user: compiled.user, params: compiled.params }
  }

  const callOpenAI = async (prompt: { system: string; user: string; params?: Record<string, unknown> }) => {
    const t0 = Date.now()
    const sysContent = (prompt.system || '') + '\n[Format] Svara ENDAST i giltig json utan extra text.'
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sysContent },
          { role: 'user', content: prompt.user }
        ],
        temperature: (prompt.params?.temperature as number) ?? 0.3,
        response_format: { type: 'json_object' }
      })
    })
    const t1 = Date.now()
    const json: any = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      const errText = typeof json?.error?.message === 'string' ? json.error.message : `status ${resp.status}`
      throw new Error('OpenAI fel: ' + errText)
    }
    const raw = json.choices?.[0]?.message?.content?.trim() || '{}'
    // Robust JSON extraction: take substring between first { and last }
    let text = raw
    const s = raw.indexOf('{')
    const e = raw.lastIndexOf('}')
    if (s !== -1 && e !== -1 && e > s) text = raw.slice(s, e + 1)
    return { data: JSON.parse(text), usage: json.usage, latency: t1 - t0, model: json.model }
  }

  const toStr = (v: any) => typeof v === 'string' ? v : (v == null ? '' : JSON.stringify(v))
  const toList = (v: any) => Array.isArray(v) ? v.map(toStr) : (v == null ? [] : Object.values(v).map(toStr))

  let roleResults = [] as any[]
  try {
    for (const rName of roles) {
      const req = makePrompt(rName)
      const res: any = await callOpenAI(req)
      const data = res.data ?? res
      roleResults.push({
        role: rName,
        analysis: toStr(data.analysis),
        recommendations: toList(data.recommendations)
      })
      await logInference(c, {
        session_id: c.req.header('X-Session-Id') || undefined,
        role: rName,
        pack_slug: pack.pack.slug,
        version: pack.version,
        prompt_hash: packHash,
        model: res.model || 'gpt-4o-mini',
        temperature: (req.params?.temperature as number) ?? 0.3,
        params_json: req.params || {},
        request_ts: new Date().toISOString(),
        latency_ms: res.latency || 0,
        cost_estimate_cents: null,
        status: 'ok',
        error: null,
        payload_json: { system: req.system, user: req.user, output: data },
        session_sticky_version: pinned || null
      })
    }
  } catch (e: any) {
    // Graceful fallback to mock if OpenAI fails
    roleResults = [
      { role: 'Chief Strategist', analysis: `Strategisk analys för: ${body.question}`, recommendations: ['Fas 1: utvärdera', 'Fas 2: genomför'] },
      { role: 'Futurist', analysis: `Scenarier för: ${body.question}`, recommendations: ['No-regret: X', 'Real option: Y'] },
      { role: 'Behavioral Psychologist', analysis: 'Mänskliga faktorer identifierade', recommendations: ['Minska loss aversion', 'Beslutsprotokoll A'] },
      { role: 'Senior Advisor', analysis: 'Syntes av rådets röster', recommendations: ['Primär väg: ...', 'Fallback: ...'] }
    ]
    await logInference(c, {
      session_id: c.req.header('X-Session-Id') || undefined,
      role: 'ERROR',
      pack_slug: pack.pack.slug,
      version: pack.version,
      prompt_hash: packHash,
      model: 'gpt-4o-mini',
      temperature: 0.3,
      params_json: {},
      request_ts: new Date().toISOString(),
      latency_ms: 0,
      cost_estimate_cents: null,
      status: 'error',
      error: String(e?.message || e),
      payload_json: { question: body.question, context: body.context },
      session_sticky_version: pinned || null
    })
    c.header('X-Model', 'mock-fallback')
  }

  // Consensus
  const consensusCompiled = compileForRole(pack, 'CONSENSUS', {
    question: body.question,
    context: body.context || '',
    roles_json: JSON.stringify(roleResults)
  })
  const consensusCall = { system: consensusCompiled.system, user: consensusCompiled.user, params: consensusCompiled.params }
  let consensusData: any
  try {
    const consensusRes: any = await callOpenAI(consensusCall)
    consensusData = consensusRes.data ?? consensusRes
    await logInference(c, {
      session_id: c.req.header('X-Session-Id') || undefined,
      role: 'CONSENSUS',
      pack_slug: pack.pack.slug,
      version: pack.version,
      prompt_hash: packHash,
      model: consensusRes.model || 'gpt-4o-mini',
      temperature: (consensusCall.params?.temperature as number) ?? 0.3,
      params_json: consensusCall.params || {},
      request_ts: new Date().toISOString(),
      latency_ms: consensusRes.latency || 0,
      cost_estimate_cents: null,
      status: 'ok',
      error: null,
      payload_json: { system: consensusCall.system, user: consensusCall.user, output: consensusData },
      session_sticky_version: pinned || null
    })
  } catch (e: any) {
    // Fallback consensus
    consensusData = {
      summary: `Sammanvägd bedömning kring: ${body.question}`,
      risks: ['Exekveringsrisk', 'Resursrisk'],
      unanimous_recommendation: 'Gå vidare med stegvis införande'
    }
    await logInference(c, {
      session_id: c.req.header('X-Session-Id') || undefined,
      role: 'CONSENSUS',
      pack_slug: pack.pack.slug,
      version: pack.version,
      prompt_hash: packHash,
      model: 'mock-fallback',
      temperature: (consensusCall.params?.temperature as number) ?? 0.3,
      params_json: consensusCall.params || {},
      request_ts: new Date().toISOString(),
      latency_ms: 0,
      cost_estimate_cents: null,
      status: 'error',
      error: String(e?.message || e),
      payload_json: { system: consensusCall.system, user: consensusCall.user },
      session_sticky_version: pinned || null
    })
    c.header('X-Model', 'mock-fallback')
  }
  const consensus = {
    summary: toStr(consensusData.summary),
    risks: toList(consensusData.risks),
    unanimous_recommendation: toStr(consensusData.unanimous_recommendation)
  }

  // Persist to D1
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      context TEXT,
      roles_json TEXT NOT NULL,
      consensus_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run()

  const insert = await DB.prepare(`
    INSERT INTO minutes (question, context, roles_json, consensus_json)
    VALUES (?, ?, ?, ?)
  `).bind(body.question, body.context || null, JSON.stringify(roleResults), JSON.stringify(consensus)).run()

  const id = insert.meta.last_row_id

  // Add reproducibility headers
  const entryHash = await computePromptHash({ role: 'BASE', system_prompt: 'Concillio', user_template: body.question, params: { model: 'gpt-4o-mini' }, allowed_placeholders: [] })
  c.header('X-Prompt-Pack', `${pack.pack.slug}@${pack.locale}`)
  c.header('X-Prompt-Version', pack.version)
  c.header('X-Prompt-Hash', packHash)
  c.header('X-Model', 'gpt-4o-mini')

  setCookie(c, 'concillio_version', pack.version, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' })
  return c.json({ id })
})

// View: minutes render
app.get('/minutes/:id', async (c) => {
  const { DB } = c.env
  const id = Number(c.req.param('id'))
  if (!id) return c.notFound()

  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const roles = JSON.parse(row.roles_json)
  const consensus = JSON.parse(row.consensus_json)

  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">
      <header class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="#b3a079"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">Council Minutes</div>
          </div>
        </div>
        <a href={`/api/minutes/${id}/pdf`} class="inline-flex items-center px-3 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">Ladda ner PDF</a>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style="background-image:url('/static/watermark.svg'); background-size: 600px; background-repeat: no-repeat; background-position: right -60px top -40px;"></div>
        <h1 class="font-['Playfair_Display'] text-2xl text-neutral-100">Ärende</h1>
        <p class="text-neutral-300 mt-2">{row.question}</p>
        {row.context && <p class="text-neutral-400 mt-1 whitespace-pre-wrap">{row.context}</p>}

        <h2 class="mt-8 font-['Playfair_Display'] text-xl text-neutral-100">Rådets röster</h2>
        <div class="mt-4 grid md:grid-cols-2 gap-4">
          {roles.map((r: any) => (
            <div class="border border-neutral-800 rounded-lg p-4 bg-neutral-950/40" key={r.role}>
              <div class="text-[#b3a079] uppercase tracking-wider text-xs mb-2">{r.role}</div>
              <div class="text-neutral-200 whitespace-pre-wrap">{r.analysis}</div>
              {r.recommendations && (
                <ul class="mt-3 list-disc list-inside text-neutral-300">
                  {(Array.isArray(r.recommendations) ? r.recommendations : [String(r.recommendations)]).map((it: string) => <li>{it}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>

        <h2 class="mt-8 font-['Playfair_Display'] text-xl text-neutral-100">Council Consensus</h2>
        <div class="mt-3 border border-neutral-800 rounded-lg p-4 bg-neutral-950/40">
          <div class="text-neutral-200 whitespace-pre-wrap">{consensus.summary}</div>
          {consensus.risks && (
            <div class="mt-3">
              <div class="text-neutral-400 text-sm mb-1">Identifierade risker</div>
              <ul class="list-disc list-inside text-neutral-300">
                {(Array.isArray(consensus.risks) ? consensus.risks : [String(consensus.risks)]).map((it: string) => <li>{it}</li>)}
              </ul>
            </div>
          )}
          {consensus.unanimous_recommendation && (
            <div class="mt-4 flex items-center gap-3">
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M24 33 l6 6 l12 -14" stroke="#b3a079" stroke-width="3" fill="none"/></svg>
              <div class="text-[#b3a079] font-semibold">Council Sealed: {String(consensus.unanimous_recommendation)}</div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
})

// API: PDF export (server-side via Browserless if token exists, fallback to print HTML)
app.get('/api/minutes/:id/pdf', async (c) => {
  const { DB, BROWSERLESS_TOKEN } = c.env
  const id = Number(c.req.param('id'))
  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const roles = JSON.parse(row.roles_json)
  const consensus = JSON.parse(row.consensus_json)

  const html = `<!doctype html>
  <html lang="sv">
  <head>
    <meta charset="utf-8" />
    <title>Concillio – Council Minutes #${id}</title>
    <style>
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
        .page { page-break-after: always; }
      }
      body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; color: #111; }
      h1, h2 { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; }
      .seal { color: #b3a079; }
      .watermark { position: fixed; inset: 0; opacity: 0.06; background-image: url('/static/watermark.svg'); background-size: 800px; background-repeat: no-repeat; background-position: right -80px top -40px; }
      .box { border: 1px solid #ddd; border-radius: 10px; padding: 16px; margin-top: 10px; break-inside: avoid; page-break-inside: avoid; -webkit-column-break-inside: avoid; }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div class="watermark"></div>
    <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div style="display:flex;gap:10px;align-items:center;">
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#111" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#fff" stroke="#b3a079"/></svg>
        <div>
          <div style="letter-spacing:0.3em;text-transform:uppercase;font-size:10px;color:#666">Concillio</div>
          <div style="font-family:'Playfair Display',serif;font-size:18px;">Council Minutes</div>
        </div>
      </div>
      <div class="seal" style="font-weight:600;">Council Sealed</div>
    </header>
    <h1>Ärende</h1>
    <p>${row.question}</p>
    ${row.context ? `<p style="white-space:pre-wrap;color:#444">${row.context}</p>` : ''}

    <h2>Rådets röster</h2>
    ${roles.map((r: any) => `
      <div class="box">
        <div style="color:#b3a079;letter-spacing:0.12em;text-transform:uppercase;font-size:12px">${r.role}</div>
        <div style="white-space:pre-wrap;margin-top:6px;">${r.analysis}</div>
        ${r.recommendations ? `<ul style="margin-top:8px">${(Array.isArray(r.recommendations) ? r.recommendations : [String(r.recommendations)]).map((it: string) => `<li>${it}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('')}

    <h2>Council Consensus</h2>
    <div class="box">
      <div style="white-space:pre-wrap;">${consensus.summary ?? ''}</div>
      ${consensus.risks ? `<div style="margin-top:8px"><div style="color:#666;font-size:12px">Risker</div><ul>${(Array.isArray(consensus.risks) ? consensus.risks : [String(consensus.risks)]).map((it: string) => `<li>${it}</li>`).join('')}</ul></div>` : ''}
      ${consensus.unanimous_recommendation ? `<div style="margin-top:10px;color:#b3a079;font-weight:600">Unanimous Recommendation: ${String(consensus.unanimous_recommendation)}</div>` : ''}
    </div>
  </body>
  </html>`

  if (BROWSERLESS_TOKEN) {
    try {
      const resp = await fetch(`https://chrome.browserless.io/pdf?token=${BROWSERLESS_TOKEN}` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, options: { printBackground: true, preferCSSPageSize: true } })
      })
      if (resp.ok) {
        const pdf = await resp.arrayBuffer()
        return new Response(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename=concillio-minutes-${id}.pdf` } })
      }
    } catch (e) {
      // fall through to HTML
    }
  }

  // Fallback: print-friendly HTML
  return c.html(html)
})

// Simple health route
app.get('/api/hello', (c) => c.json({ message: 'Hello from Concillio' }))

// Mobile-friendly demo endpoint: GET /demo?mock=1&q=...&ctx=...
// Creates mock minutes and redirects to /minutes/:id (no OpenAI needed)
app.get('/demo', async (c) => {
  const { DB, OPENAI_API_KEY } = c.env
  const isMock = c.req.query('mock') === '1' || !OPENAI_API_KEY
  if (!isMock) return c.text('Disabled. Add ?mock=1 or set OPENAI key missing in dev.', 403)

  const locale = 'sv-SE'
  const pinned = c.req.header('X-Prompts-Version') || getCookie(c, 'concillio_version') || undefined
  const pack = await loadPromptPack(c.env as any, 'concillio-core', locale, pinned)
  const packHash = await computePackHash(pack)

  const question = c.req.query('q') || 'Demo: Ska jag tacka ja till jobberbjudandet?'
  const context = c.req.query('ctx') || ''

  const roleResults = [
    { role: 'Chief Strategist', analysis: `Strategisk analys för: ${question}`, recommendations: ['Fas 1: utvärdera', 'Fas 2: genomför'] },
    { role: 'Futurist', analysis: `Scenarier för: ${question}`, recommendations: ['No-regret: X', 'Real option: Y'] },
    { role: 'Behavioral Psychologist', analysis: 'Mänskliga faktorer identifierade', recommendations: ['Minska loss aversion', 'Beslutsprotokoll A'] },
    { role: 'Senior Advisor', analysis: 'Syntes av rådets röster', recommendations: ['Primär väg: ...', 'Fallback: ...'] }
  ]
  const consensus = {
    summary: `Sammanvägd bedömning kring: ${question}`,
    risks: ['Exekveringsrisk', 'Resursrisk'],
    unanimous_recommendation: 'Gå vidare med stegvis införande'
  }

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      context TEXT,
      roles_json TEXT NOT NULL,
      consensus_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run()
  const insert = await DB.prepare(`
    INSERT INTO minutes (question, context, roles_json, consensus_json)
    VALUES (?, ?, ?, ?)
  `).bind(question, context || null, JSON.stringify(roleResults), JSON.stringify(consensus)).run()

  const id = insert.meta.last_row_id
  c.header('X-Prompt-Pack', `${pack.pack.slug}@${pack.locale}`)
  c.header('X-Prompt-Version', pack.version)
  c.header('X-Prompt-Hash', packHash)
  c.header('X-Model', 'mock')
  setCookie(c, 'concillio_version', pack.version, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' })
  return c.redirect(`/minutes/${id}`, 302)
})

export default app
