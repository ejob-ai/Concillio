import { Hono } from 'hono'

const themeDebug = new Hono()

themeDebug.get('/theme-debug', (c) => {
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Theme Debug</title>
        <style>
          body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 2rem; }
          pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; }
          code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
      </head>
      <body>
        <h1>Theme Debug</h1>
        <p>SSR-applied theme values and client-side storage state.</p>
        <pre id="out"><code>(loading…)</code></pre>
        <script>
          (function(){
            try {
              var html = document.documentElement;
              var dataTheme = html.getAttribute('data-theme');
              var darkClass = html.classList.contains('dark');
              var cookieTheme = (document.cookie.match(/(?:^|;\s*)theme=([^;]+)/) || [])[1] || '(none)';
              var lsTheme = null;
              try { lsTheme = localStorage.getItem('theme') || '(none)'; } catch(_) { lsTheme = '(unavailable)'; }
              var payload = { dataTheme: dataTheme, darkClass: darkClass, cookieTheme: cookieTheme, lsTheme: lsTheme };
              var el = document.getElementById('out');
              if (el) el.textContent = JSON.stringify(payload, null, 2);
            } catch(_) {}
          })();
        </script>
      </body>
    </html>
  `
  return c.html(html)
})

export default themeDebug
