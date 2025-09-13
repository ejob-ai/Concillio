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
    <main class="min-h-screen container mx-auto px-6 py-10">
      <header class="mb-6">
        <h1 class="font-['Playfair_Display'] text-3xl text-neutral-100">{title}</h1>
        <p class="text-neutral-400 mt-1">{subtitle}</p>
      </header>
      <div class="mt-6 flex gap-3 flex-wrap">
        <a class="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[var(--gold)] text-white font-medium shadow" href={`/council/ask?lang=${lang}`}>
          {lang==='sv' ? 'Ställ din fråga' : 'Ask your question'}
        </a>
        <a class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-neutral-800 text-neutral-200" href={`/council/consensus?lang=${lang}`}>
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
    <main class="min-h-screen container mx-auto px-6 py-10">
      <h1 class="font-['Playfair_Display'] text-3xl text-neutral-100">{title}</h1>
      <p class="text-neutral-400 mt-2">
        {lang==='sv' ? 'En ceremoniell, enig rekommendation baserad på flera roller.' : 'A ceremonial, unanimous recommendation synthesized from multiple roles.'}
      </p>
      <div class="mt-6">
        <a class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-neutral-800 text-neutral-200" href={`/council?lang=${lang}`}>
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
    <main class="min-h-screen container mx-auto px-6 py-8">
      <h1 class="font-['Playfair_Display'] text-3xl text-neutral-100">{title}</h1>
      <p class="text-neutral-400 mt-1">{desc}</p>

      <form id="ask-form" class="mt-6 space-y-4" autocomplete="off">
        <div class="border border-neutral-800 rounded-xl p-4 bg-neutral-950/40">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <label for="preset-select" class="block text-neutral-300 mb-1">{lang==='sv' ? 'Styrelse line-ups' : 'Board line-ups'}</label>
            <div id="preset-tooltip" class="text-xs text-neutral-400"></div>
          </div>
          <select id="preset-select" name="preset_id" class="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/40">
            <option value="">{lang==='sv' ? 'Välj en line-up…' : 'Choose a line-up…'}</option>
          </select>
        </div>
        <div>
          <label for="q" class="block text-neutral-300 mb-1">{lang==='sv' ? 'Fråga' : 'Question'}</label>
          <input id="q" name="q" type="text" required maxlength={800}
            placeholder={lang==='sv' ? 'Bör vi gå in på USA‑marknaden Q2?' : 'Should we enter the US market in Q2?'}
            class="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/40" />
        </div>
        <div>
          <label for="ctx" class="block text-neutral-300 mb-1">{lang==='sv' ? 'Kontext' : 'Context'}</label>
          <textarea id="ctx" name="ctx" rows={6} maxlength={4000}
            placeholder={lang==='sv' ? 'Mål, begränsningar, tidshorisont…' : 'Goals, constraints, time horizon…'}
            class="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/40"></textarea>
        </div>
        <input type="hidden" id="preset-roles-json" name="preset_roles_json" value="" />
        <div class="flex items-center gap-3 flex-wrap">
          <button id="do-ask" type="submit" class="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[var(--gold)] text-white font-medium shadow">
            {lang==='sv' ? 'Samla rådet' : 'Assemble the council'}
          </button>
          <a href={`/council?lang=${lang}`} class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 text-neutral-300">{lang==='sv'?'Avbryt':'Cancel'}</a>
        </div>
        <div id="err" class="text-red-400 text-sm hidden"></div>
      </form>

      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var form = document.getElementById('ask-form');
          var presetSelect = document.getElementById('preset-select');
          var presetTooltip = document.getElementById('preset-tooltip');
          var presetRolesEl = document.getElementById('preset-roles-json');
          var err = document.getElementById('err');
          var presetsCache = [];
          function showErr(s){ if(!err) return; err.textContent = s; err.classList.remove('hidden'); }
          // Fetch presets and populate dropdown
          try{
            fetch('/api/lineups/presets').then(function(r){return r.json()}).then(function(j){
              if (!j || !j.ok) return;
              presetsCache = Array.isArray(j.presets) ? j.presets : [];
              var sel = presetSelect;
              if (sel){
                presetsCache.forEach(function(p){
                  var opt = document.createElement('option');
                  opt.value = String(p.id);
                  try{
                    var roles = JSON.parse(p.roles||'[]')||[];
                    opt.textContent = p.name + ' (' + roles.length + ' ' + (${JSON.stringify(lang==='sv'?'roller':'roles')}) + ')';
                  }catch(_){ opt.textContent = p.name; }
                  sel.appendChild(opt);
                });
                var updateTip = function(){
                  var id = Number(sel.value||0);
                  var p = presetsCache.find(function(x){ return Number(x.id)===id; });
                  if (p){
                    try{
                      var roles = JSON.parse(p.roles||'[]')||[];
                      roles.sort(function(a,b){ return (a.position||0) - (b.position||0); });
                      var tip = roles.map(function(r){ return (r.role_key||r.role||'')+': '+(Math.round((r.weight||0)*100))+'%'; }).join(' · ');
                      presetTooltip.textContent = tip;
                      presetRolesEl.value = JSON.stringify(roles);
                    }catch(e){ presetTooltip.textContent=''; presetRolesEl.value=''; }
                  } else { presetTooltip.textContent=''; presetRolesEl.value=''; }
                };
                sel.addEventListener('change', updateTip);
              }
            }).catch(function(){});
          }catch(e){}

          if (!form) return;
          form.addEventListener('submit', async function(ev){
            ev.preventDefault(); if (err) err.classList.add('hidden');
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
              if (j && j.id) { location.href = '/minutes/'+j.id+'?lang='+${JSON.stringify(lang)}; return; }
              throw new Error(${JSON.stringify(lang==='sv' ? 'okänt fel' : 'unknown error')});
            } catch(e) { showErr((e && e.message) ? e.message : (${JSON.stringify(lang==='sv' ? 'okänt fel' : 'unknown error')})); }
          });
        })();
      ` }} />
    </main>
  )
})

export default council
