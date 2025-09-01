import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { serveStatic } from 'hono/cloudflare-workers'

// Types for bindings
type Bindings = {
  OPENAI_API_KEY: string
  DB: D1Database
  BROWSERLESS_TOKEN?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS for API routes (if needed later for clients)
app.use('/api/*', cors())

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

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
          <button class="justify-self-start inline-flex items-center px-5 py-2 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition" type="submit">Samla rådet</button>
        </form>
        <script dangerouslySetInnerHTML={{ __html: `
          const form = document.getElementById('ask-form');
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const payload = { question: fd.get('question'), context: fd.get('context') };
            const res = await fetch('/api/council/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data?.id) location.href = '/minutes/' + data.id;
            else alert('Något gick fel: ' + (data?.error || 'okänt fel'));
          });
        ` }} />
      </section>
    </main>
  )
})

// API: council consult
app.post('/api/council/consult', async (c) => {
  const { OPENAI_API_KEY, DB } = c.env
  if (!OPENAI_API_KEY) return c.json({ error: 'Servern saknar OPENAI_API_KEY' }, 500)

  const body = await c.req.json<{ question: string; context?: string }>().catch(() => null)
  if (!body?.question) return c.json({ error: 'question krävs' }, 400)

  // Orchestrate roles using OpenAI (Edge fetch)
  // Note: keep it simple for MVP; one call per role then consensus
  const roles = ['Chief Strategist', 'Futurist', 'Behavioral Psychologist', 'Senior Advisor'] as const

  const makePrompt = (role: string) => `Du är Concillios ${role}. Svara formellt, koncist och strukturerat som styrelseprotokoll. Fråga: "${body.question}". Kontext: ${body.context || '—'}.
Returnera i JSON med fälten: role, analysis, recommendations`;

  const callOpenAI = async (prompt: string) => {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du svarar i strikt JSON utan förklaringar.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    })
    if (!resp.ok) throw new Error('OpenAI fel: ' + resp.status)
    const json = await resp.json()
    const raw = json.choices?.[0]?.message?.content?.trim() || '{}'
    // Try parse JSON, tolerate code fences
    const m = raw.match(/\{[\s\S]*\}$/)
    return JSON.parse(m ? m[0] : raw)
  }

  const roleResults = [] as any[]
  for (const r of roles) {
    // Sequential for token safety in MVP; can parallelize later
    const res = await callOpenAI(makePrompt(r))
    roleResults.push(res)
  }

  // Consensus
  const consensusPrompt = `Sammanfatta rådets resonemang och lämna ett ceremoniellt "Council Consensus". Input: ${JSON.stringify(roleResults)}. Returnera JSON med fälten: summary, risks, unanimous_recommendation`;
  const consensus = await callOpenAI(consensusPrompt)

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
                  {Array.isArray(r.recommendations) ? r.recommendations.map((it: string) => <li>{it}</li>) : <li>{String(r.recommendations)}</li>}
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
                {Array.isArray(consensus.risks) ? consensus.risks.map((it: string) => <li>{it}</li>) : <li>{String(consensus.risks)}</li>}
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
      .box { border: 1px solid #ddd; border-radius: 10px; padding: 16px; margin-top: 10px; }
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

export default app
