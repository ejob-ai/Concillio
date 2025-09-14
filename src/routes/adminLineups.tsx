import { Hono } from 'hono'
import { renderer } from '../renderer'

const adminLineups = new Hono()
adminLineups.use(renderer)

adminLineups.get('/admin/lineups', (c) => {
  try { c.set('head', { title: 'Concillio – Admin · Lineups' }) } catch {}
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-10">
      <header class="mb-6">
        <h1 class="font-['Crimson_Text'] text-3xl">Admin · Lineups</h1>
        <p class="text-slate-600 mt-1">Seed, reset+seed, normalize roles, and preview.</p>
      </header>

      <section class="max-w-2xl">
        <div class="mb-4">
          <label for="adminToken" class="block text-sm font-medium text-slate-700">Admin Token</label>
          <input id="adminToken" type="password" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/40 text-slate-900 placeholder:text-slate-500" placeholder="Enter X-Admin-Token" />
          <p class="text-xs text-slate-500 mt-1">Stored in sessionStorage and sent as X-Admin-Token header.</p>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <button id="btnPreview" class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50" aria-busy="false">Preview</button>
          <button id="btnSeed" class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50" aria-busy="false">Seed</button>
          <button id="btnReset" class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50" aria-busy="false">Reset + Seed</button>
          <button id="btnNormalize" class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50" aria-busy="false">Normalize roles</button>
        </div>

        <div class="mt-6">
          <div id="status" class="text-sm"></div>
          <pre id="result" class="mt-2 bg-slate-50 rounded-lg p-4 overflow-auto text-sm" style={{maxHeight:'60vh'}}></pre>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var tokenInput = document.getElementById('adminToken');
          var btnPreview = document.getElementById('btnPreview');
          var btnSeed = document.getElementById('btnSeed');
          var btnReset = document.getElementById('btnReset');
          var btnNormalize = document.getElementById('btnNormalize');
          var result = document.getElementById('result');
          var statusEl = document.getElementById('status');

          function getToken(){
            var t = tokenInput.value || sessionStorage.getItem('adminToken') || '';
            if (tokenInput && !tokenInput.value && t) tokenInput.value = t;
            return t;
          }
          function setToken(v){ try{ sessionStorage.setItem('adminToken', v || ''); }catch(_){} }
          tokenInput.addEventListener('change', function(){ setToken(tokenInput.value); });
          tokenInput.addEventListener('blur', function(){ setToken(tokenInput.value); });
          // preload if present
          try{ var preset = sessionStorage.getItem('adminToken') || ''; if (preset) tokenInput.value = preset; }catch(_){ }

          function setBusy(btn, v){ if (!btn) return; btn.setAttribute('aria-busy', v?'true':'false'); btn.toggleAttribute('disabled', !!v); }
          function show(res, ok, code){
            try { result.textContent = JSON.stringify(res, null, 2); } catch { result.textContent = String(res); }
            statusEl.textContent = ok ? '✅ OK' + (code?(' · '+code):'') : '⚠️ Error' + (code?(' · '+code):'');
            statusEl.style.color = ok ? '#065f46' : '#991b1b';
          }

          async function call(method, url){
            var tok = getToken();
            var h = tok ? {'X-Admin-Token': tok} : {};
            var r = await fetch(url, { method: method, headers: h });
            var text = await r.text();
            var body = null; try{ body = JSON.parse(text); }catch(_){ body = text; }
            if (!r.ok) throw { code: r.status, body };
            return { code: r.status, body };
          }

          btnPreview && btnPreview.addEventListener('click', async function(){
            setBusy(btnPreview, true); show('Loading...', true);
            try {
              var u = new URL(location.href); u.pathname = '/admin/seed/lineups/preview'; u.search = '';
              var res = await call('GET', u.toString());
              show(res.body, true, res.code);
            } catch(e){ show(e.body||String(e), false, e.code); }
            finally { setBusy(btnPreview, false); }
          });

          btnSeed && btnSeed.addEventListener('click', async function(){
            setBusy(btnSeed, true); show('Seeding...', true);
            try {
              var u = new URL(location.href); u.pathname = '/admin/seed/lineups'; u.search = '';
              var res = await call('POST', u.toString());
              show(res.body, true, res.code);
            } catch(e){ show(e.body||String(e), false, e.code); }
            finally { setBusy(btnSeed, false); }
          });

          btnReset && btnReset.addEventListener('click', async function(){
            if (!confirm('Are you sure you want to RESET + SEED?')) return;
            if (!confirm('Final confirmation: This may affect production data. Continue?')) return;
            setBusy(btnReset, true); show('Resetting + Seeding...', true);
            try {
              var u = new URL(location.href); u.pathname = '/admin/seed/lineups'; u.search = 'reset=1';
              var res = await call('POST', u.toString());
              show(res.body, true, res.code);
            } catch(e){ show(e.body||String(e), false, e.code); }
            finally { setBusy(btnReset, false); }
          });

          btnNormalize && btnNormalize.addEventListener('click', async function(){
            setBusy(btnNormalize, true); show('Normalizing...', true);
            try {
              var u = new URL(location.href); u.pathname = '/admin/normalize/roles'; u.search = '';
              var res = await call('POST', u.toString());
              show(res.body, true, res.code);
            } catch(e){ show(e.body||String(e), false, e.code); }
            finally { setBusy(btnNormalize, false); }
          });
        })();
      ` }} />
    </main>
  )
})

export default adminLineups
