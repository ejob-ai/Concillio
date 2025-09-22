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
    </script>
  </body>
</html>`
  return c.html(html)
})

export default themeDebug
