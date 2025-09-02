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

// Language helpers
const SUPPORTED_LANGS = ['sv', 'en'] as const
 type Lang = typeof SUPPORTED_LANGS[number]
 function getLang(c: any): Lang {
  const q = c.req.query('lang')
  let lang = (q || getCookie(c, 'lang') || 'sv').toLowerCase()
  if (q) setCookie(c, 'lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'Lax' })
  if (!SUPPORTED_LANGS.includes(lang as any)) lang = 'sv'
  return lang as Lang
 }
 function t(lang: Lang) {
  return lang === 'en'
    ? {
        title: 'Your personal board – a "council of minds"',
        hero_subtitle: 'Ask your question. The council convenes. You receive ceremonial minutes with clear recommendations and a sealed Council Consensus.',
        ask: 'Ask your question',
        placeholder_question: 'Should I accept the job offer?',
        placeholder_context: 'Relevant context (goals, constraints, time horizon)',
        submit: 'Assemble the council',
        cta_access: 'Request Access',
        cta_demo: 'See demo',
        council_voices: 'Council Voices',
        consensus: 'Council Consensus',
        minutes_title: 'Council Minutes',
        case_title: 'Case',
        download_pdf: 'Download PDF',
        risks_label: 'Identified risks',
        working_title: 'The council is convening',
        working_preparing: 'Preparing…',
        working_steps: [
          'Preparing council documents',
          'Chief Strategist analyzing',
          'Futurist analyzing',
          'Behavioral Psychologist analyzing',
          'Senior Advisor consolidating',
          'Formulating Council Consensus'
        ],
        error_generic_prefix: 'Something went wrong:',
        error_tech_prefix: 'Technical error:',
        error_unknown: 'unknown error',
        council_sealed_prefix: 'Council Sealed:',
        seal_text: 'Council Sealed',
        unanimous_recommendation_label: 'Unanimous Recommendation:',
        opportunities_label: 'Opportunities',
        board_statement_label: 'Board statement',
        conditions_label: 'Conditions',
        kpis_label: 'KPIs to monitor',
        back_to_minutes: 'Back to minutes',
        recommendations_label: 'Recommendations',
        council_page_title: 'Council',
        council_page_subtitle: 'Meet the Concillio council: four complementary expert roles synthesizing your toughest decisions.',
        learn_more: 'Learn more',
        run_session: 'Run a session',
        role_desc: {
          strategist: 'Long-horizon strategic framing: options, reversibility, milestones, and first 90 days.',
          futurist: 'Scenario thinking with probabilities, leading indicators, no-regret moves, and real options.',
          psychologist: 'Human factors: biases, identity fit, risk appetite, resistance points, decision protocols.',
          advisor: 'Synthesis and decision: trade-offs, primary recommendation, conditions, KPIs, and board statement.'
        },
        consensus_desc: 'The ceremonial synthesis of all roles: risks, opportunities, unanimous recommendation, board statement, conditions, and KPIs.',
        what_you_get_label: "What you'll get",
        example_snippet_label: 'Example minutes snippet',
        method_scope_label: 'Method & scope',
        faq_label: 'FAQ',
        cta_run_council_session: 'Run a Council Session',
        cta_apply_invite: 'Apply for Invite',
        what_get_items: [
          'Strategic analysis and framing',
          'Options with reversibility and milestones',
          'Trade-offs and implications',
          'Primary recommendation with scope and conditions'
        ],
        method_scope_paragraph: 'This role considers time horizons (12–36 months), constraints, reversibility, and salient biases. It synthesizes inputs to outline clear options with evidence and milestones, while explicitly stating assumptions and conditions for success.',
        faq_q1: 'How does Council Consensus work?',
        faq_a1: 'All roles feed a formal synthesis that yields a ceremonial, unanimous recommendation with conditions.',
        faq_q2: 'How long are minutes stored?',
        faq_a2: 'By default 30 days (configurable). Personally identifiable information is scrubbed.',
        faq_q3: 'Which models do you use?',
        faq_a3: 'We use state-of-the-art models, pinned by version, with strict JSON outputs and evidence fields.',
        faq_q4: 'Can I export to PDF?',
        faq_a4: 'Yes. Minutes pages provide a print/PDF export, with localized labels.',
        example_structure_label: 'Example structure'
      }
    : {
        title: 'Din personliga styrelse – ett "council of minds"',
        hero_subtitle: 'Ställ din fråga. Rådet samlas. Du får ett ceremoniellt protokoll med tydliga rekommendationer och ett sigillerat Council Consensus.',
        ask: 'Ställ din fråga',
        placeholder_question: 'Ska jag tacka ja till jobberbjudandet?',
        placeholder_context: 'Relevant kontext (mål, begränsningar, tidshorisont)',
        submit: 'Samla rådet',
        cta_access: 'Begär åtkomst',
        cta_demo: 'Se demo',
        council_voices: 'Rådets röster',
        consensus: 'Rådets konsensus',
        minutes_title: 'Protokoll',
        case_title: 'Ärende',
        download_pdf: 'Ladda ner PDF',
        risks_label: 'Identifierade risker',
        working_title: 'Rådet sammanträder',
        working_preparing: 'Förbereder…',
        working_steps: [
          'Förbereder rådets dokument',
          'Chefstrateg analyserar',
          'Futurist analyserar',
          'Beteendepsykolog analyserar',
          'Senior rådgivare väger samman',
          'Formulerar Council Consensus'
        ],
        error_generic_prefix: 'Något gick fel:',
        error_tech_prefix: 'Tekniskt fel:',
        error_unknown: 'okänt fel',
        council_sealed_prefix: 'Rådets sigill:',
        seal_text: 'Rådets sigill',
        unanimous_recommendation_label: 'Enig rekommendation:',
        opportunities_label: 'Möjligheter',
        board_statement_label: 'Styrelsens uttalande',
        conditions_label: 'Villkor',
        kpis_label: 'KPI:er att övervaka',
        back_to_minutes: 'Tillbaka till protokollet',
        recommendations_label: 'Rekommendationer',
        council_page_title: 'Rådet',
        council_page_subtitle: 'Möt Concillio-rådet: fyra kompletterande expertroller som syntetiserar dina svåraste beslut.',
        learn_more: 'Läs mer',
        run_session: 'Starta en session',
        role_desc: {
          strategist: 'Långsiktig strategisk inramning: alternativ, reversibilitet, milstolpar och första 90 dagarna.',
          futurist: 'Scenariotänkande med sannolikheter, ledande indikatorer, no-regret moves och reala optioner.',
          psychologist: 'Mänskliga faktorer: biaser, identitetsfit, riskaptit, motståndspunkter och beslutsprotokoll.',
          advisor: 'Syntes och beslut: trade-offs, primär rekommendation, villkor, KPI:er och styrelsens uttalande.'
        },
        consensus_desc: 'Den ceremoniella syntesen av alla roller: risker, möjligheter, enig rekommendation, styrelsens uttalande, villkor och KPI:er.',
        what_you_get_label: 'Det här får du',
        example_snippet_label: 'Exempel ur protokoll',
        method_scope_label: 'Metod & scope',
        faq_label: 'FAQ',
        cta_run_council_session: 'Starta en Council Session',
        cta_apply_invite: 'Ansök om inbjudan',
        what_get_items: [
          'Strategisk analys och inramning',
          'Alternativ med reversibilitet och milstolpar',
          'Avvägningar och implikationer',
          'Primär rekommendation med omfattning och villkor'
        ],
        method_scope_paragraph: 'Rollen beaktar tidshorisonter (12–36 månader), begränsningar, reversibilitet och framträdande biaser. Den syntetiserar underlag för att ange tydliga alternativ med evidens och milstolpar, samt uttalar antaganden och villkor för framgång.',
        faq_q1: 'Hur fungerar Council Consensus?',
        faq_a1: 'Alla roller matas in i en formell syntes som ger en ceremoniell, enig rekommendation med villkor.',
        faq_q2: 'Hur länge lagras protokoll?',
        faq_a2: 'Som standard 30 dagar (konfigurerbart). Personligt identifierbar information rensas.',
        faq_q3: 'Vilka modeller använder ni?',
        faq_a3: 'Vi använder toppmoderna modeller, pinnade per version, med strikt JSON-utdata och evidensfält.',
        faq_q4: 'Kan jag exportera till PDF?',
        faq_a4: 'Ja. Protokollsidorna erbjuder utskrift/PDF-export med lokaliserade etiketter.',
        example_structure_label: 'Exempel på struktur'
      }
 }

// Localize role names for display
function roleLabel(name: string, lang: 'sv' | 'en') {
  if (lang === 'sv') {
    const map: Record<string, string> = {
      'Chief Strategist': 'Chefstrateg',
      'Futurist': 'Futurist',
      'Behavioral Psychologist': 'Beteendepsykolog',
      'Senior Advisor': 'Senior rådgivare'
    }
    return map[name] || name
  }
  return name
}

app.use(renderer)

// Slug helpers for council pages
const ROLE_SLUGS = ['strategist', 'futurist', 'psychologist', 'advisor'] as const
 type RoleSlug = typeof ROLE_SLUGS[number]
 function slugToRoleName(slug: RoleSlug): 'Chief Strategist' | 'Futurist' | 'Behavioral Psychologist' | 'Senior Advisor' {
  switch (slug) {
    case 'strategist': return 'Chief Strategist'
    case 'futurist': return 'Futurist'
    case 'psychologist': return 'Behavioral Psychologist'
    case 'advisor': return 'Senior Advisor'
  }
 }

// Landing page
app.get('/', (c) => {
  return c.render(
    <main class="min-h-screen">
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#b3a079_0,transparent_40%),radial-gradient(circle_at_80%_30%,#4b5563_0,transparent_35%)]"></div>
        <div class="container mx-auto px-6 py-28">
          <div class="absolute top-4 right-6 text-sm text-neutral-400">
            <a href="/?lang=sv" class="hover:text-neutral-200">SV</a>
            <span class="mx-1">|</span>
            <a href="/?lang=en" class="hover:text-neutral-200">EN</a>
          </div>
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-3 mb-6">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="#b3a079"/></svg>
              <span class="uppercase tracking-[0.3em] text-sm text-neutral-300">Concillio</span>
            </div>
            {(() => { const L = t(getLang(c)); return (<h1 class="font-['Playfair_Display'] text-4xl sm:text-6xl leading-tight text-neutral-50">{L.title}</h1>) })()}
            {(() => { const L = t(getLang(c)); return (<p class="mt-6 text-neutral-300 max-w-2xl">{L.hero_subtitle}</p>) })()}
            <div class="mt-10 flex gap-4">
              {(() => { const L = t(getLang(c)); return (<a href="#ask" class="inline-flex items-center px-5 py-3 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition">{L.cta_access}</a>) })()}
              {(() => { const L = t(getLang(c)); return (<a href="#demo" class="inline-flex items-center px-5 py-3 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">{L.cta_demo}</a>) })()}
            </div>
          </div>
        </div>
      </section>
      <section id="ask" class="container mx-auto px-6 py-16">
        {(() => { const L = t(getLang(c)); return (<h2 class="font-['Playfair_Display'] text-3xl text-neutral-100 mb-6">{L.ask}</h2>) })()}
        <form id="ask-form" class="grid gap-4 max-w-2xl">
          {(() => { const L = t(getLang(c)); return (<input name="question" class="bg-neutral-900 border border-neutral-700 rounded p-3 text-neutral-100" placeholder={L.placeholder_question} />) })()}
          {(() => { const L = t(getLang(c)); return (<textarea name="context" rows={4} class="bg-neutral-900 border border-neutral-700 rounded p-3 text-neutral-100" placeholder={L.placeholder_context}></textarea>) })()}
          {(() => { const L = t(getLang(c)); return (<button id="ask-submit" class="justify-self-start inline-flex items-center px-5 py-2 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition" type="submit">{L.submit}</button>) })()}
        </form>

        {/* Progress overlay */}
        <div id="council-working" class="fixed inset-0 hidden items-center justify-center bg-black/60 z-50">
          <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <div class="flex items-start gap-4">
              <svg class="animate-spin mt-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="opacity-20" cx="12" cy="12" r="10" stroke="#b3a079" stroke-width="3"/><path d="M22 12a10 10 0 0 1-10 10" stroke="#b3a079" stroke-width="3"/></svg>
              <div>
                {(() => { const L = t(getLang(c)); return (<div class="text-neutral-100 font-semibold">{L.working_title}</div>) })()}
                {(() => { const L = t(getLang(c)); return (<div id="council-working-step" class="text-neutral-400 text-sm mt-1">{L.working_preparing}</div>) })()}
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

          const urlLang = new URLSearchParams(location.search).get('lang');
          const cookieLang = (document.cookie.match(/(?:^|; )lang=([^;]+)/)?.[1] || '').toLowerCase();
          const lang = (urlLang || cookieLang || document.documentElement.lang || 'sv').toLowerCase();
          const isEn = lang === 'en';
          const steps = isEn ? [
            'Preparing council documents',
            'Chief Strategist analyzing',
            'Futurist analyzing',
            'Behavioral Psychologist analyzing',
            'Senior Advisor consolidating',
            'Formulating Council Consensus'
          ] : [
            'Förbereder rådets dokument',
            'Chefstrateg analyserar',
            'Futurist analyserar',
            'Beteendepsykolog analyserar',
            'Senior rådgivare väger samman',
            'Formulerar Council Consensus'
          ];
          const fallbackUnknown = isEn ? 'unknown error' : 'okänt fel';
          const genericPrefix = isEn ? 'Something went wrong:' : 'Något gick fel:';
          const techPrefix = isEn ? 'Technical error:' : 'Tekniskt fel:';

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
              const msg = data?.error || text || fallbackUnknown;
              alert(genericPrefix + ' ' + msg);
            } catch (err) {
              alert(techPrefix + ' ' + (err?.message || err));
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
  const lang = getLang(c)
  const locale = lang === 'en' ? 'en-US' : 'sv-SE'
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
    const sysContent = (prompt.system || '') + (lang === 'en'
      ? '\n[Format] Answer ONLY in valid JSON with no extra text.\n[Language] Answer in English.'
      : '\n[Format] Svara ENDAST i giltig json utan extra text.\n[Språk] Svara på svenska.')
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

  function summarizeRoleOutput(roleName: string, data: any, lang: 'sv'|'en') {
    try {
      if (!data || typeof data !== 'object') return { analysis: toStr(data?.analysis) || '', recommendations: toList(data?.recommendations) }
      const recs: string[] = []
      let analysis = ''
      const r = roleName
      if (r === 'Chief Strategist') {
        const opts = Array.isArray(data.options) ? data.options : []
        const optNames = opts.map((o: any) => o?.name).filter(Boolean).join(', ')
        const ropt = data.recommended_option || data.recommended || ''
        analysis = optNames ? `Alternativ: ${optNames}. Rekommenderat: ${ropt || '—'}` : (toStr(data.analysis) || '')
        if (Array.isArray(data.why_now)) recs.push(...data.why_now.map(toStr))
        if (Array.isArray(data.first_90_days)) recs.push(...data.first_90_days.map((x: any) => toStr(x?.action || x)))
        if (opts.length && opts[0]?.milestones) {
          const ms = (opts[0].milestones || []).map((m: any) => `${m?.name || ''} ${m?.when ? '('+m.when+')' : ''}`.trim()).filter(Boolean)
          if (ms.length) recs.push('Milestones: ' + ms.join(', '))
        }
      } else if (r === 'Futurist') {
        const scenarios = Array.isArray(data.scenarios) ? data.scenarios : []
        if (scenarios.length) {
          const toSvName = (name: any) => {
            const n = String(name || '').toLowerCase()
            if (!n) return ''
            if (/(base|baseline)/.test(n)) return 'Bas'
            if (/(bear|negativ|downside|pessimist)/.test(n)) return 'Negativ'
            if (/(bull|positiv|upside|optimist)/.test(n)) return 'Positiv'
            return name
          }
          const fmtPct = (p: any) => {
            const v = Number(p)
            if (Number.isFinite(v)) {
              if (v >= 0 && v <= 1) return Math.round(v * 100) + ' %'
              if (v > 1 && v <= 100) return Math.round(v) + ' %'
            }
            return ''
          }
          const parts = scenarios.map((s: any) => {
            const n = toSvName(s?.name)
            const pr = fmtPct(s?.probability)
            return [n, pr && `(${pr})`].filter(Boolean).join(' ')
          }).filter(Boolean)
          if (parts.length) {
            analysis = `Scenarier (sannolikhet): ${parts.join(', ')}`
          } else {
            analysis = toStr(data.analysis) || ''
          }
        } else analysis = toStr(data.analysis) || ''
        if (Array.isArray(data.no_regret_moves)) recs.push(...data.no_regret_moves.map(toStr))
        if (Array.isArray(data.real_options)) recs.push(...data.real_options.map(toStr))
      } else if (r === 'Behavioral Psychologist') {
        // Omit explicit bias listing in the main analysis for a cleaner read.
        const fitRaw = data.identity_alignment?.fit
        const riskRaw = data.risk_profile?.appetite
        const svFitMap: any = { strong: 'stark', medium: 'medel', weak: 'svag' }
        const svRiskMap: any = { low: 'låg', medium: 'medel', high: 'hög' }
        const fit = svFitMap[String(fitRaw)] || fitRaw || '—'
        const risk = svRiskMap[String(riskRaw)] || riskRaw || '—'
        analysis = `Identitetsfit: ${fit}. Riskaptit: ${risk}`
        const checklist = data.decision_protocol?.checklist
        if (Array.isArray(checklist)) recs.push(...checklist.map(toStr))
        const premortem = data.decision_protocol?.premortem
        if (Array.isArray(premortem)) recs.push(...premortem.map(toStr))
      } else if (r === 'Senior Advisor') {
        const syn = Array.isArray(data.synthesis) ? data.synthesis : []
        analysis = syn.length ? `Syntes: ${syn.slice(0,3).map(toStr).join(' · ')}` : (toStr(data.analysis) || '')
        const pr = data.primary_recommendation?.decision
        if (pr) recs.push(`Rekommendation: ${toStr(pr)}`)
        const trade = Array.isArray(data.tradeoffs) ? data.tradeoffs.map((t: any) => `${t?.option || ''}: ${t?.upside || ''}/${t?.risk || ''}`.trim()) : []
        if (trade.length) recs.push(...trade)
      } else {
        analysis = toStr(data.analysis) || ''
        recs.push(...toList(data.recommendations))
      }
      // fallback if still empty
      if (!analysis) analysis = toStr(data.summary) || toStr(data.note) || ''
      const uniqueRecs = Array.from(new Set(recs.filter(Boolean)))
      return { analysis, recommendations: uniqueRecs }
    } catch {
      return { analysis: toStr(data?.analysis) || '', recommendations: toList(data?.recommendations) }
    }
  }

  let roleResults = [] as any[]
  try {
    for (const rName of roles) {
      const req = makePrompt(rName)
      const res: any = await callOpenAI(req)
      const data = res.data ?? res
      const fmt = summarizeRoleOutput(rName, data, lang)
      roleResults.push({
        role: rName,
        analysis: fmt.analysis,
        recommendations: fmt.recommendations
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
  const consensusCall = { system: consensusCompiled.system + (lang === 'en' ? '\n[Language] Answer in English.' : '\n[Språk] Svara på svenska.'), user: consensusCompiled.user, params: consensusCompiled.params }
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
            {(() => { const L = t(getLang(c)); return (<div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.minutes_title}</div>) })()}
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-sm text-neutral-400">
            <a href={`/minutes/${id}?lang=sv`} class="hover:text-neutral-200">SV</a>
            <span class="mx-1">|</span>
            <a href={`/minutes/${id}?lang=en`} class="hover:text-neutral-200">EN</a>
          </div>
          {(() => { const lang = getLang(c); const L = t(lang); return (
            <a href={`/api/minutes/${id}/pdf?lang=${lang}`} class="inline-flex items-center px-3 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">{L.download_pdf}</a>
          ) })()}
        </div>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style="background-image:url('/static/watermark.svg'); background-size: 600px; background-repeat: no-repeat; background-position: right -60px top -40px;"></div>
        {(() => { const L = t(getLang(c)); return (<h1 class="font-['Playfair_Display'] text-2xl text-neutral-100">{L.case_title}</h1>) })()}
        <p class="text-neutral-300 mt-2">{row.question}</p>
        {row.context && <p class="text-neutral-400 mt-1 whitespace-pre-wrap">{row.context}</p>}

        {(() => { const L = t(getLang(c)); return (<h2 class="mt-8 font-['Playfair_Display'] text-xl text-neutral-100">{L.council_voices}</h2>) })()}
        <div class="mt-4 grid md:grid-cols-2 gap-4">
          {roles.map((r: any, i: number) => (
            (() => { const lang = getLang(c) as 'sv'|'en'; const L = t(lang); return (
              <a href={`/minutes/${id}/role/${i}?lang=${lang}`} key={`${r.role}-${i}`}
                 class="card-premium block border border-neutral-800 rounded-lg p-4 bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-[#b3a079] hover:ring-1 hover:ring-[#b3a079]/30 transform-gpu transition transition-transform cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_6px_18px_rgba(179,160,121,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3a079]/50">
                <div class="text-[#b3a079] uppercase tracking-wider text-xs mb-2">{roleLabel(r.role, lang)}</div>
                <div class="text-neutral-200 whitespace-pre-wrap">{r.analysis}</div>
                {r.recommendations && (
                  <ul class="mt-3 list-disc list-inside text-neutral-300">
                    {(Array.isArray(r.recommendations) ? r.recommendations : [String(r.recommendations)]).map((it: string) => <li>{it}</li>)}
                  </ul>
                )}
              </a>
            ) })()
          ))}
        </div>

        {(() => { const lang = getLang(c); const L = t(lang); return (
          <div class="mt-8">
            <h2 class="font-['Playfair_Display'] text-xl text-neutral-100 mb-2">{L.consensus}</h2>
          </div>
        ) })()}
        <a href={`/minutes/${id}/consensus?lang=${getLang(c)}`} class="block mt-3 border border-neutral-800 rounded-lg p-4 bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-[#b3a079] hover:ring-1 hover:ring-[#b3a079]/30 transform-gpu transition transition-transform cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_6px_18px_rgba(179,160,121,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3a079]/50">
          <div class="text-neutral-200 whitespace-pre-wrap">{consensus.summary}</div>
          {consensus.risks && (
            <div class="mt-3">
              {(() => { const L = t(getLang(c)); return (<div class="text-neutral-400 text-sm mb-1">{L.risks_label}</div>) })()}
              <ul class="list-disc list-inside text-neutral-300">
                {(Array.isArray(consensus.risks) ? consensus.risks : [String(consensus.risks)]).map((it: string) => <li>{it}</li>)}
              </ul>
            </div>
          )}
          {consensus.unanimous_recommendation && (
            <div class="mt-4 flex items-center gap-3">
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M24 33 l6 6 l12 -14" stroke="#b3a079" stroke-width="3" fill="none"/></svg>
              {(() => { const L = t(getLang(c)); return (<div class="text-[#b3a079] font-semibold">{L.council_sealed_prefix} {String(consensus.unanimous_recommendation)}</div>) })()}
            </div>
          )}
        </a>
      </section>
    </main>
  )
})

// View: single role details
app.get('/minutes/:id/role/:idx', async (c) => {
  const { DB } = c.env
  const id = Number(c.req.param('id'))
  const idx = Number(c.req.param('idx'))
  if (!id || !Number.isFinite(idx)) return c.notFound()
  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const roles = JSON.parse(row.roles_json)
  const role = roles?.[idx]
  if (!role) return c.notFound()
  const lang = getLang(c)
  const L = t(lang)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">
      <header class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="#b3a079"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.minutes_title}</div>
          </div>
        </div>
        <a href={`/minutes/${id}?lang=${lang}`} class="inline-flex items-center px-3 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">{L.back_to_minutes}</a>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style="background-image:url('/static/watermark.svg'); background-size: 600px; background-repeat: no-repeat; background-position: right -60px top -40px;"></div>
        <div class="text-[#b3a079] uppercase tracking-wider text-xs">{roleLabel(role.role, lang as any)}</div>
        <h1 class="mt-1 font-['Playfair_Display'] text-2xl text-neutral-100">{row.question}</h1>
        {row.context && <p class="text-neutral-400 mt-1 whitespace-pre-wrap">{row.context}</p>}

        <h2 class="mt-6 font-['Playfair_Display'] text-xl text-neutral-100">{L.case_title}</h2>
        <div class="mt-2 text-neutral-200 whitespace-pre-wrap">{role.analysis}</div>

        {role.recommendations && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.recommendations_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {(Array.isArray(role.recommendations) ? role.recommendations : [String(role.recommendations)]).map((it: string) => <li>{it}</li>)}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
})

// API: PDF export (server-side via Browserless if token exists, fallback to print HTML)
// View: consensus details
app.get('/minutes/:id/consensus', async (c) => {
  const { DB } = c.env
  const id = Number(c.req.param('id'))
  if (!id) return c.notFound()

  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const consensus = JSON.parse(row.consensus_json || '{}')
  const lang = getLang(c) as 'sv' | 'en'
  const L = t(lang)
  const toArray = (v: any): any[] => Array.isArray(v) ? v : (v ? [v] : [])

  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">
      <header class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="#b3a079"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.minutes_title}</div>
          </div>
        </div>
        <a href={`/minutes/${id}?lang=${lang}`} class="inline-flex items-center px-3 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">{L.back_to_minutes}</a>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('/static/watermark.svg')", backgroundSize: '600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right -60px top -40px' }}></div>

        <h1 class="font-['Playfair_Display'] text-2xl text-neutral-100">{L.consensus}</h1>
        {consensus.summary && (
          <div class="mt-2 text-neutral-200 whitespace-pre-wrap">{String(consensus.summary)}</div>
        )}

        {toArray(consensus.risks).length > 0 && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.risks_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {toArray(consensus.risks).map((it: any) => <li>{String(it)}</li>)}
            </ul>
          </div>
        )}

        {toArray(consensus.opportunities).length > 0 && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.opportunities_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {toArray(consensus.opportunities).map((it: any) => <li>{String(it)}</li>)}
            </ul>
          </div>
        )}

        {consensus.unanimous_recommendation && (
          <div class="mt-6 flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M24 33 l6 6 l12 -14" stroke="#b3a079" stroke-width="3" fill="none"/></svg>
            <div class="text-[#b3a079] font-semibold">{L.unanimous_recommendation_label} {String(consensus.unanimous_recommendation)}</div>
          </div>
        )}

        {consensus.board_statement && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.board_statement_label}</div>
            <div class="text-neutral-200 whitespace-pre-wrap">{String(consensus.board_statement)}</div>
          </div>
        )}

        {toArray(consensus.conditions).length > 0 && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.conditions_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {toArray(consensus.conditions).map((it: any) => <li>{String(it)}</li>)}
            </ul>
          </div>
        )}

        {toArray(consensus.kpis_monitor).length > 0 && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.kpis_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {toArray(consensus.kpis_monitor).map((it: any) => {
                try {
                  if (it && typeof it === 'object') {
                    const parts = [it.metric, it.target, it.cadence].filter(Boolean)
                    return <li>{parts.join(' · ')}</li>
                  }
                } catch {}
                return <li>{String(it)}</li>
              })}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
})

// Council overview page
app.get('/council', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">
      <header class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="#b3a079"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.council_page_title}</div>
          </div>
        </div>
        <div class="text-sm text-neutral-400">
          <a href={`/council?lang=sv`} class="hover:text-neutral-200">SV</a>
          <span class="mx-1">|</span>
          <a href={`/council?lang=en`} class="hover:text-neutral-200">EN</a>
        </div>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <p class="text-neutral-300">{L.council_page_subtitle}</p>

        <div class="mt-6 grid md:grid-cols-2 gap-4">
          {(['strategist','futurist','psychologist','advisor','consensus'] as any[]).map((slug) => {
            const isConsensus = slug === 'consensus'
            const roleNameEn = isConsensus ? L.consensus : slugToRoleName(slug as RoleSlug)
            const displayName = isConsensus ? roleNameEn : roleLabel(roleNameEn, lang as any)
            const desc = isConsensus ? L.consensus_desc : L.role_desc[slug as RoleSlug]
            const href = isConsensus ? `/council/consensus?lang=${lang}` : `/council/${slug}?lang=${lang}`
            return (
              <a aria-label={ariaLbl} data-role={slug} href={href} class="card-premium block border border-neutral-800 rounded-lg p-4 bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-[#b3a079] hover:ring-1 hover:ring-[#b3a079]/30 transform-gpu transition transition-transform cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_6px_18px_rgba(179,160,121,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3a079]/50">
                <div class="text-[#b3a079] uppercase tracking-wider text-xs mb-2">{displayName}</div>
                <div class="text-neutral-200">{desc}</div>
                <div class="mt-3 text-sm text-neutral-400">{L.learn_more} →</div>
              </a>
            )
          })}
        </div>

        <div class="mt-8 flex gap-3">
          <a href={`/?lang=${lang}#ask`} class="inline-flex items-center px-4 py-2 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition">{L.run_session}</a>
          <a href={`/?lang=${lang}#ask`} class="inline-flex items-center px-4 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">{L.cta_access}</a>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        // Analytics: standardized events with labels
        const cards = document.querySelectorAll('a[data-role]');
        function send(evt, role, label){
          const payload = { event: evt, role, label, ts: Date.now() };
          try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify(payload)); }catch(e){ fetch('/api/analytics/council', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}); }
        }
        cards.forEach(el=>{
          const role = el.getAttribute('data-role');
          el.addEventListener('mouseenter', ()=> send('council_card_hover', role, role));
          el.addEventListener('click', ()=> send('council_card_click', role, role));
        });
        document.querySelectorAll('a[data-cta="start-session"]').forEach(function(el){
          el.addEventListener('click', function(){
            try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'start_session_click', role: 'consensus', role_context: 'current', ts: Date.now() })); }catch(e){}
          });
        });
      ` }} />
    </main>
  )
})

// Council consensus detail page (static marketing/structure)
app.get('/council/consensus', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">
      <header class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="#b3a079"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.consensus}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <a href={`/council?lang=${lang}`} class="inline-flex items-center px-3 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">← {L.council_page_title}</a>
          <div class="text-sm text-neutral-400">
            <a href={`/council/consensus?lang=sv`} class="hover:text-neutral-200">SV</a>
            <span class="mx-1">|</span>
            <a href={`/council/consensus?lang=en`} class="hover:text-neutral-200">EN</a>
          </div>
        </div>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('/static/watermark.svg')", backgroundSize: '600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right -60px top -40px' }}></div>
        <p class="text-neutral-300">{L.consensus_desc}</p>

        <div class="mt-6 border border-neutral-800 rounded-lg p-4 bg-neutral-950/40">
          <div class="text-neutral-400 text-sm mb-2">{L.example_structure_label}</div>
          <div class="text-neutral-200">• {L.consensus}</div>
          <div class="text-neutral-200 mt-1">• {L.risks_label}</div>
          <div class="text-neutral-200 mt-1">• {L.opportunities_label}</div>
          <div class="text-neutral-200 mt-1">• {L.unanimous_recommendation_label}</div>
          <div class="text-neutral-200 mt-1">• {L.board_statement_label}</div>
          <div class="text-neutral-200 mt-1">• {L.conditions_label}</div>
          <div class="text-neutral-200 mt-1">• {L.kpis_label}</div>
        </div>

        <div class="mt-6 flex gap-3">
          <a href={`/?lang=${lang}#ask`} class="inline-flex items-center px-4 py-2 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition">{L.run_session}</a>
          <a href={`/?lang=${lang}#ask`} class="inline-flex items-center px-4 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">{L.cta_access}</a>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'view', role: 'consensus', ts: Date.now() })); }catch(e){}
      ` }} />
    </main>
  )
})

// Council role detail page
app.get('/council/:slug', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  const slug = (c.req.param('slug') || '').toLowerCase() as RoleSlug
  const ok = (['strategist','futurist','psychologist','advisor'] as RoleSlug[]).includes(slug)
  if (!ok) return c.notFound()
  const roleName = slugToRoleName(slug)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">
      <header class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="#b3a079" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="#b3a079" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="#b3a079"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{roleLabel(roleName, lang)}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <a href={`/council?lang=${lang}`} class="inline-flex items-center px-3 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">← {L.council_page_title}</a>
          <div class="text-sm text-neutral-400">
            <a href={`/council/${slug}?lang=sv`} class="hover:text-neutral-200">SV</a>
            <span class="mx-1">|</span>
            <a href={`/council/${slug}?lang=en`} class="hover:text-neutral-200">EN</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('/static/watermark.svg')", backgroundSize: '600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right -60px top -40px' }}></div>
        <div class="text-[#b3a079] uppercase tracking-wider text-xs">{roleLabel(roleName, lang)}</div>
        <h1 class="mt-1 font-['Playfair_Display'] text-3xl text-neutral-100">{roleLabel(roleName, lang)}</h1>
        <p class="mt-2 text-neutral-300 max-w-2xl">{L.role_desc[slug]}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a data-cta="start-session" href={`/?lang=${lang}#ask`} class="inline-flex items-center px-4 py-2 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition">{L.run_session}</a>
          <a data-cta="start-session" href={`/?lang=${lang}#ask`} class="inline-flex items-center px-4 py-2 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">{L.cta_access}</a>
        </div>
      </section>

      {/* What you'll get */}
      <section class="mt-10 grid lg:grid-cols-2 gap-6">
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <div class="text-[#b3a079] uppercase tracking-wider text-xs mb-2">{L.what_you_get_label}</div>
          <ul class="list-disc list-inside text-neutral-200 leading-7">
            {L.what_get_items.map((it: string) => <li>{it}</li>)}
          </ul>
        </div>
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <div class="text-[#b3a079] uppercase tracking-wider text-xs mb-2">{L.example_snippet_label}</div>
          <pre class="text-neutral-300 text-sm whitespace-pre-wrap bg-neutral-950/40 border border-neutral-800 rounded p-3">
{`{
  "role": "${roleLabel(roleName, lang)}",
  "options": ["A","B","C"],
  "tradeoffs": ["A: upside/risk", "B: upside/risk"],
  "recommendation": "Option A",
  "first_90_days": ["M1", "M2"]
}`}
          </pre>
        </div>
      </section>

      {/* Method & scope */}
      <section class="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[#b3a079] uppercase tracking-wider text-xs mb-2">{L.method_scope_label}</div>
        <p class="text-neutral-300 leading-7">{L.method_scope_paragraph}</p>
      </section>

      {/* FAQ with schema.org/FAQPage */}
      <section class="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[#b3a079] uppercase tracking-wider text-xs mb-2">{L.faq_label}</div>
        <div class="grid md:grid-cols-2 gap-4 text-neutral-200">
          <div>
            <div class="font-semibold">{L.faq_q1}</div>
            <div class="text-neutral-300">{L.faq_a1}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q2}</div>
            <div class="text-neutral-300">{L.faq_a2}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q3}</div>
            <div class="text-neutral-300">{L.faq_a3}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q4}</div>
            <div class="text-neutral-300">{L.faq_a4}</div>
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type":"Question","name": L.faq_q1, "acceptedAnswer": {"@type":"Answer","text": L.faq_a1}},
            {"@type":"Question","name": L.faq_q2, "acceptedAnswer": {"@type":"Answer","text": L.faq_a2}},
            {"@type":"Question","name": L.faq_q3, "acceptedAnswer": {"@type":"Answer","text": L.faq_a3}},
            {"@type":"Question","name": L.faq_q4, "acceptedAnswer": {"@type":"Answer","text": L.faq_a4}}
          ]
        }) }} />
      </section>

      {/* CTA block */}
      <section class="mt-6 flex flex-wrap gap-3">
        <a href={`/?lang=${lang}#ask`} class="inline-flex items-center px-5 py-3 rounded-md bg-[#b3a079] text-[#0b0d10] font-medium hover:brightness-110 transition">{L.cta_run_council_session}</a>
        <a href={`/?lang=${lang}#ask`} class="inline-flex items-center px-5 py-3 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition">{L.cta_apply_invite}</a>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'role_page_view', role: '${slug}', label: '${slug}', ts: Date.now() })); }catch(e){}
        document.querySelectorAll('a[data-cta="start-session"]').forEach(function(el){
          el.addEventListener('click', function(){
            try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'start_session_click', role: '${slug}', role_context: 'current', ts: Date.now() })); }catch(e){}
          });
        });
      ` }} />
    </main>
  )
})

// Analytics endpoint for council interactions
app.post('/api/analytics/council', async (c) => {
  try {
    const { DB } = c.env
    const body = await c.req.json<any>().catch(() => ({}))
    const role = String(body.role || '')
    const event = String(body.event || '')
    const ts = new Date(body.ts ? Number(body.ts) : Date.now()).toISOString()
    if (!['strategist','futurist','psychologist','advisor','consensus'].includes(role) || !['hover','click','view'].includes(event)) return c.json({ ok: false }, 400)
    await DB.prepare(`CREATE TABLE IF NOT EXISTS analytics_council (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      event TEXT NOT NULL,
      ts TEXT NOT NULL,
      ua TEXT,
      referer TEXT
    )`).run()
    const ua = c.req.header('User-Agent') || ''
    const ref = c.req.header('Referer') || ''
    await DB.prepare(`INSERT INTO analytics_council (role, event, ts, ua, referer) VALUES (?, ?, ?, ?, ?)`).bind(role, event, ts, ua, ref).run()
    return c.json({ ok: true })
  } catch {
    return c.json({ ok: true }) // do not block UX on analytics errors
  }
})

app.get('/api/minutes/:id/pdf', async (c) => {
  const { DB, BROWSERLESS_TOKEN } = c.env
  const id = Number(c.req.param('id'))
  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const roles = JSON.parse(row.roles_json)
  const consensus = JSON.parse(row.consensus_json)

  const lang = getLang(c)
  const L = t(lang)
  const html = `<!doctype html>
  <html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <title>Concillio – ${L.minutes_title} #${id}</title>
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
      h2 { page-break-after: avoid; break-after: avoid-page; }
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
          <div style="font-family:'Playfair Display',serif;font-size:18px;">${L.minutes_title}</div>
        </div>
      </div>
      <div class="seal" style="font-weight:600;">${L.seal_text}</div>
    </header>
    <h1>${L.case_title}</h1>
    <p>${row.question}</p>
    ${row.context ? `<p style="white-space:pre-wrap;color:#444">${row.context}</p>` : ''}

    <h2>${L.council_voices}</h2>
    ${roles.map((r: any) => `
      <div class="box">
        <div style="color:#b3a079;letter-spacing:0.12em;text-transform:uppercase;font-size:12px">${roleLabel(r.role, lang)}</div>
        <div style="white-space:pre-wrap;margin-top:6px;">${r.analysis}</div>
        ${r.recommendations ? `<ul style="margin-top:8px">${(Array.isArray(r.recommendations) ? r.recommendations : [String(r.recommendations)]).map((it: string) => `<li>${it}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('')}

    <h2>${L.consensus}</h2>
    <div class="box">
      <div style="white-space:pre-wrap;">${consensus.summary ?? ''}</div>
      ${consensus.risks ? `<div style="margin-top:8px"><div style="color:#666;font-size:12px">${L.risks_label}</div><ul>${(Array.isArray(consensus.risks) ? consensus.risks : [String(consensus.risks)]).map((it: string) => `<li>${it}</li>`).join('')}</ul></div>` : ''}
      ${consensus.unanimous_recommendation ? `<div style="margin-top:10px;color:#b3a079;font-weight:600">${L.unanimous_recommendation_label} ${String(consensus.unanimous_recommendation)}</div>` : ''}
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

  const lang = getLang(c)
  const locale = lang === 'en' ? 'en-US' : 'sv-SE'
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
