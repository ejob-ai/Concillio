import { Hono } from 'hono'

const themeDebug = new Hono()

themeDebug.get('/theme-debug', (c) => {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Theme Debug</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { --bg:#ffffff; --ink:#0f172a; --muted:#64748b; --chip:#f1f5f9; --line:#e2e8f0; }
      /* screen-reader only helper (since Tailwind not loaded here) */
      .sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      /* minimal role-chip styling for demo */
      .role-chip{display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;user-select:none;position:relative;transition:color .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .12s ease}
      .role-chip::after{content:"";position:absolute;left:0;bottom:-6px;height:2px;width:0;background:#0f766e;transition:width .18s ease}
      .role-chip:hover::after,.role-chip:focus-visible::after,.role-chip:active::after{width:100%}
      .role-chip:active{transform:translateY(1px)}
      /* selected state */
      input[type="radio"].sr-only:checked + .role-chip{border-color:#0f766e;box-shadow:0 0 0 1px #0f766e inset}
      @media (prefers-color-scheme: dark) {
        html:not([data-theme]):not(.dark), html:not([data-theme]):not(.dark) body {
          background:#0b0f1a; color:#e5e7eb;
        }
      }
      body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin:0; padding:24px; background:var(--bg); color:var(--ink); }
      h1 { font-size:20px; margin:0 0 12px; }
      .row { display:flex; gap:12px; flex-wrap:wrap; margin:12px 0 20px; }
      button { appearance:none; border:1px solid var(--line); background:#fff; color:var(--ink); padding:10px 14px; border-radius:10px; cursor:pointer; }
      button.primary { background:#111827; color:#fff; border-color:#111827; }
      button.warn { border-color:#ef4444; color:#ef4444; background:#fff; }
      .chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
      .chip { background:var(--chip); padding:6px 10px; border-radius:999px; font-size:12px; border:1px solid var(--line);} 
      pre { background:var(--chip); padding:14px; border-radius:12px; overflow:auto; border:1px solid var(--line); }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .small { color:var(--muted); font-size:12px; }
      .hr { height:1px; background:var(--line); margin:20px 0; }
    </style>
  </head>
  <body>
    <h1>Theme Debug</h1>

    <div class="row">
      <button id="set-light" class="primary">Set: Light</button>
      <button id="set-dark">Set: Dark</button>
      <button id="set-system">Set: System</button>
      <button id="clear-theme" class="warn">Clear cookie + localStorage</button>
    </div>

    <div class="chips">
      <span class="chip">SSR <code>data-theme</code>: <span id="ssrTheme">(reading…)</span></span>
      <span class="chip"><code>.dark</code> class: <span id="darkClass">(reading…)</span></span>
      <span class="chip"><code>cookie</code> theme: <span id="cookieTheme">(reading…)</span></span>
      <span class="chip"><code>localStorage</code> theme: <span id="lsTheme">(reading…)</span></span>
    </div>

    <div class="hr"></div>
    <div class="small">Tip: öppna denna sida på mobilen också. Värdena uppdateras direkt när du klickar.</div>

    <h3>Status</h3>
    <pre id="out">(loading…)</pre>

    <div class="hr"></div>
    <h3>Line-up role chips (recommended pattern)</h3>

    <!-- Rekommenderat mönster -->
    <fieldset class="row" role="radiogroup" aria-label="Line-up">
      <legend class="sr-only">Line-up</legend>
      <input class="sr-only" type="radio" name="lineup" id="lineup-data" value="data">
      <label class="role-chip" for="lineup-data" data-role-chip>Data</label>

      <input class="sr-only" type="radio" name="lineup" id="lineup-risk" value="risk">
      <label class="role-chip" for="lineup-risk" data-role-chip>Risk Officer</label>
    </fieldset>
    <div class="small">Val: <span id="lineup-selected">(ingen)</span></div>

    <div class="hr"></div>
    <h3>Toast hooks demo</h3>

    <!-- Ajax-spar (visar success/error toasts baserat på fetch-resultat) -->
    <form action="/api/settings" method="post" data-ajax data-toast-success="Settings saved" data-toast-error="Failed to save settings">
      <div class="row">
        <label>
          <span class="small">Setting A</span><br />
          <input type="text" name="a" placeholder="value" />
        </label>
        <label>
          <span class="small">Setting B</span><br />
          <input type="text" name="b" placeholder="value" />
        </label>
      </div>
      <button type="submit">Save</button>
    </form>

    <!-- Icke-ajax (navigerar bort men visar snabb feedback) -->
    <form action="/profile/theme" method="post" data-toast-success="Preferences updated" style="margin-top:16px;">
      <button type="submit">Update</button>
    </form>

    <!-- Snabb “click toast” (t.ex. copy) -->
    <div style="margin-top:16px;">
      <button type="button" data-toast-click="Copied!">Copy API key</button>
    </div>

    <script>
      // --- helpers ---
      function readCookie(name){
        const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
        return m ? decodeURIComponent(m[1]) : null
      }
      function setCookie(name, value, days=365){
        const d = new Date(); d.setTime(d.getTime() + days*24*60*60*1000)
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax'
      }
      function delCookie(name){
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
      }
      function setMetaColorScheme(mode){
        let m = document.querySelector('meta[name="color-scheme"]')
        if (!m) { m = document.createElement('meta'); m.setAttribute('name','color-scheme'); document.head.appendChild(m) }
        m.setAttribute('content', mode === 'dark' ? 'dark light' : 'light dark')
      }
      function applyTheme(theme){
        const html = document.documentElement
        if (theme === 'dark') {
          html.setAttribute('data-theme','dark')
          html.classList.add('dark')
          setMetaColorScheme('dark')
        } else if (theme === 'light') {
          html.setAttribute('data-theme','light')
          html.classList.remove('dark')
          setMetaColorScheme('light')
        } else {
          // system
          html.removeAttribute('data-theme')
          html.classList.remove('dark')
          // Respect system for meta too (not perfect, but good enough for debug)
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          setMetaColorScheme(prefersDark ? 'dark' : 'light')
        }
      }
      function persistTheme(theme){
        if (theme === 'system'){
          delCookie('theme')
          localStorage.removeItem('theme')
        } else {
          setCookie('theme', theme)
          localStorage.setItem('theme', theme)
        }
      }
      function state(){
        const html = document.documentElement
        return {
          dataTheme: html.getAttribute('data-theme') || '(none)',
          darkClass: html.classList.contains('dark'),
          cookieTheme: readCookie('theme') || '(none)',
          lsTheme: localStorage.getItem('theme') || '(none)'
        }
      }
      function render(){
        const s = state()
        document.getElementById('ssrTheme').textContent = s.dataTheme
        document.getElementById('darkClass').textContent = String(s.darkClass)
        document.getElementById('cookieTheme').textContent = s.cookieTheme
        document.getElementById('lsTheme').textContent = s.lsTheme
        document.getElementById('out').textContent = JSON.stringify(s, null, 2)
      }

      // --- wire buttons ---
      document.getElementById('set-light').addEventListener('click', () => {
        persistTheme('light'); applyTheme('light'); render()
      })
      document.getElementById('set-dark').addEventListener('click', () => {
        persistTheme('dark'); applyTheme('dark'); render()
      })
      document.getElementById('set-system').addEventListener('click', () => {
        persistTheme('system'); applyTheme('system'); render()
      })
      document.getElementById('clear-theme').addEventListener('click', () => {
        delCookie('theme'); localStorage.removeItem('theme'); applyTheme('system'); render()
      })

      // initial paint
      render()

      // Hook up lineup demo state
      const radios = document.querySelectorAll('input[name="lineup"]')
      function updateSelected(){
        const r = Array.from(radios).find((x:any)=>x.checked)
        document.getElementById('lineup-selected').textContent = r ? r.value : '(ingen)'
      }
      radios.forEach((r:any)=> r.addEventListener('change', updateSelected))
      updateSelected()
    </script>
  </body>
</html>`
  return c.html(html)
})

export default themeDebug
