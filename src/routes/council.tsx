import { Hono } from 'hono'
import { renderer } from '../renderer'

// Council sub-app: single source for /council pages
const council = new Hono()
council.use(renderer)

function getLang(c: any): 'sv' | 'en' {
  try {
    const url = new URL(c.req.url)
    const v = (url.searchParams.get('lang') || url.searchParams.get('locale') || 'sv').toLowerCase()
    return (v === 'en' ? 'en' : 'sv') as any
  } catch { return 'sv' }
}

// Intro page
council.get('/council', (c) => {
  try { c.set('routeName', 'council:intro') } catch {}

  const lang = getLang(c)
  const title = lang === 'sv' ? 'Rådet' : 'Council'
  const subtitle = lang === 'sv'
    ? 'Möt Concillio‑rådet: fyra kompletterande expertroller som syntetiserar dina svåraste beslut.'
    : 'Meet the Concillio council: four complementary expert roles synthesizing your toughest decisions.'
  try { c.set('head', { title: `Concillio – ${title}`, description: subtitle }) } catch {}
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-10 bg-white text-slate-900">
      <header class="mb-6">
        <h1 class="font-['Crimson_Text'] text-3xl text-slate-900">{title}</h1>
        <p class="text-slate-600 mt-1">{subtitle}</p>
      </header>
      <div class="mt-6 flex gap-3 flex-wrap">
        <a class="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[var(--gold)] text-white font-medium shadow" href={`/council/ask?lang=${lang}`}>
          {lang==='sv' ? 'Ställ din fråga' : 'Ask your question'}
        </a>
        <a class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 text-slate-700" href={`/council/consensus?lang=${lang}`}>
          {lang==='sv' ? 'Se konsensus' : 'View consensus'}
        </a>
      </div>
    </main>
  )
})

// Consensus overview (placeholder; can be expanded)
council.get('/council/consensus', (c) => {
  try { c.set('routeName', 'council:consensus') } catch {}

  const lang = getLang(c)
  const title = lang === 'sv' ? 'Rådets konsensus' : 'Council Consensus'
  try { c.set('head', { title: `Concillio – ${title}`, description: title }) } catch {}
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-10 bg-white text-slate-900">
      <h1 class="font-['Crimson_Text'] text-3xl text-slate-900">{title}</h1>
      <p class="text-neutral-400 mt-2">
        {lang==='sv' ? 'En ceremoniell, enig rekommendation baserad på flera roller.' : 'A ceremonial, unanimous recommendation synthesized from multiple roles.'}
      </p>
      <div class="mt-6">
        <a class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 text-slate-700" href={`/council?lang=${lang}`}>
          {lang==='sv' ? 'Tillbaka till Rådet' : 'Back to Council'}
        </a>
      </div>
    </main>
  )
})

// Ask page (lightweight form that hits /api/council/consult)
council.get('/council/ask', (c) => {
  try { c.set('routeName', 'council:ask') } catch {}

  const lang = getLang(c)
  const title = lang === 'sv' ? 'Ställ din fråga' : 'Ask your question'
  const desc = lang === 'sv'
    ? 'Beskriv beslutet och relevant kontext. Rådet sammanträder och du får protokoll.'
    : 'Describe your decision and context. The council convenes and you receive minutes.'
  try { c.set('head', { title: `Concillio – ${title}`, description: desc }) } catch {}
  return c.render(
    <section class="container mx-auto px-4 py-12">
      <h1 class="font-serif text-4xl mb-6">Run a Session</h1>

      {/* Line-ups chips list (client-rendered) */}
      <ul data-lineups-list class="lineups">
        {/* skeleton (visas när data-loading=true via CSS) */}
        <li class="skeleton"></li>
        <li class="skeleton"></li>
        <li class="skeleton"></li>
      </ul>
      <p data-lineups-empty hidden>Inga line-ups tillgängliga just nu.</p>

      <form id="ask-form" class="mt-6 space-y-4" autocomplete="off">
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              const form = document.getElementById('ask-form');
              const btn  = document.getElementById('ask-submit');
              if(!form || !btn) return;
              form.addEventListener('submit', () => {
                btn.disabled = true;
                btn.classList.add('is-busy');
                var l = btn.querySelector('.submit-label'); if(l) l.setAttribute('style','display:none');
                var b = btn.querySelector('.submit-busy'); if(b) b.setAttribute('style','display:inline');
              });
            } catch(_) {}
          })();
        ` }} />
        <div class="border border-slate-300 rounded-xl p-4 bg-white">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <label class="block text-slate-700 mb-1">{lang==='sv' ? 'Styrelse line-ups' : 'Board line-ups'}</label>
            <div id="preset-tooltip" class="text-xs text-slate-500"></div>
          </div>
          {/* Hidden select as fallback; primary UI is chips via ask-client.js */}
          <select id="preset-select" name="preset_id" class="hidden">
            <option value=""></option>
          </select>
        </div>
        <div>
          <label for="q" class="block text-slate-700 mb-1">{lang==='sv' ? 'Fråga' : 'Question'}</label>
          <input id="q" name="q" type="text" required maxlength={800}
            placeholder={lang==='sv' ? 'Bör vi gå in på USA‑marknaden Q2?' : 'Should we enter the US market in Q2?'}
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/40 text-slate-900 placeholder:text-slate-500" />
        </div>
        <div>
          <label for="ctx" class="block text-slate-700 mb-1">{lang==='sv' ? 'Kontext' : 'Context'}</label>
          <textarea id="ctx" name="ctx" rows={6} maxlength={4000}
            placeholder={lang==='sv' ? 'Mål, begränsningar, tidshorisont…' : 'Goals, constraints, time horizon…'}
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/40 text-slate-900 placeholder:text-slate-500"></textarea>
        </div>
        <input type="hidden" id="preset-roles-json" name="preset_roles_json" value="" />
        <div className="mt-6 flex items-center gap-3">
          {/* Primär: submit i premium-guld */}
          <button type="submit" className="btn-gold" id="ask-submit">
            <span className="submit-label">Get the minutes</span>
            <span className="submit-busy" style="display:none">Working…</span>
          </button>

          {/* Sekundär: diskret länk/knapp */}
          <a href="/" className="btn-outline">Back</a>
        </div>
        <div id="err" class="text-red-400 text-sm hidden"></div>
      </form>

      <style>{`
        [data-lineups-list][data-loading] .skeleton {
          height: 36px;
          border-radius: 999px;
          background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
          background-size: 400% 100%;
          animation: pulse 1.2s ease-in-out infinite;
        }
        @keyframes pulse {0%{background-position: 100% 0}100%{background-position: 0 0}}
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var form = document.getElementById('ask-form');
          var presetSelect = document.getElementById('preset-select');
          var presetTooltip = document.getElementById('preset-tooltip');
          var presetRolesEl = document.getElementById('preset-roles-json');
          var err = document.getElementById('err');
          function showErr(s){ if(!err) return; err.textContent = s; err.classList.remove('hidden'); }
          // Select är kvar som dold fallback; ask-client.js renderar chips i [data-lineups-list]

          if (!form) return;
          form.addEventListener('submit', async function(ev){
            ev.preventDefault(); if (err) err.classList.add('hidden');
            var btn = document.getElementById('ask-submit');
            var labelEl = btn && btn.querySelector('.submit-label');
            var busyEl = btn && btn.querySelector('.submit-busy');
            function setBusy(b){ if(!btn) return; btn.disabled = !!b; btn.classList && btn.classList.toggle('is-busy', !!b); if(labelEl) labelEl.style.display = b ? 'none' : 'inline'; if(busyEl) busyEl.style.display = b ? 'inline' : 'none'; }
            setBusy(true);
            var q = (document.getElementById('q')||{}).value||''; q = q.trim();
            var ctx = (document.getElementById('ctx')||{}).value||'';
            if (!q) { showErr(${JSON.stringify(lang==='sv' ? 'Fråga krävs' : 'Question is required')}); return; }
            try {
              var url = new URL(location.href); url.pathname = '/api/council/consult'; url.searchParams.set('lang', ${JSON.stringify(lang)});
              var payload = { question: q, context: ctx };
              try {
                var presetId = (presetSelect && presetSelect.value) ? Number(presetSelect.value) : null;
                var presetRoles = (presetRolesEl && presetRolesEl.value) ? JSON.parse(presetRolesEl.value) : null;
                if (presetId) payload['lineup_preset_id'] = presetId;
                if (presetRoles) payload['lineup_roles'] = presetRoles;
              } catch(_){ }
              var r = await fetch(url.toString(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
              if (!r.ok) { var t = await r.text().catch(()=>''), j=null; try{ j=JSON.parse(t);}catch(_){ } throw new Error((j&&j.error)||t||('HTTP '+r.status)); }
              var j = await r.json();
              setBusy(false);
              if (j && j.id) { location.href = '/minutes/'+j.id+'?lang=sv'; return; }
              throw new Error(${JSON.stringify(lang==='sv' ? 'okänt fel' : 'unknown error')});
            } catch(e) { setBusy(false); showErr((e && e.message) ? e.message : (${JSON.stringify(lang==='sv' ? 'okänt fel' : 'unknown error')})); }
          });
        })();
      ` }} />
    </section>
  )
})

export default council
