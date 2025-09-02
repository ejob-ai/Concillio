import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }, c) => {
  // Determine language from query/cookie for SSR <html lang>
  let lang = 'sv'
  try {
    const url = new URL(c.req.url)
    const q = url.searchParams.get('lang') || url.searchParams.get('locale')
    const cookie = c.req.header('Cookie') || ''
    const m = cookie.match(/(?:^|;\s*)lang=([^;]+)/)
    const fromCookie = m ? decodeURIComponent(m[1]) : ''
    const v = (q || fromCookie || 'sv').toLowerCase()
    if (v === 'en' || v === 'sv') lang = v
  } catch {}

  return (
    <html lang={lang} data-app-root>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Concillio – Council of Minds</title>
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var html = document.documentElement;
            try{
              // Respect explicit theme choice first
              var stored = localStorage.getItem('theme') || '';
              var cookie = (document.cookie.match(/(?:^|; )theme=([^;]+)/)?.[1] || '').toLowerCase();
              var theme = (stored || cookie || 'system').toLowerCase();
              var mql = window.matchMedia('(prefers-color-scheme: dark)');
              function apply(t){
                html.setAttribute('data-theme', t);
                if (t === 'dark') html.classList.add('dark');
                if (t === 'light') html.classList.remove('dark');
                if (t === 'system') { if (mql.matches) html.classList.add('dark'); else html.classList.remove('dark'); }
              }
              apply(theme);
              if (theme === 'system') {
                try { mql.addEventListener('change', function(){ apply('system'); }); } catch(_){ try{ mql.addListener(function(){ apply('system'); }); }catch(__){} }
              }
            }catch(e){}
          })();
        ` }} />
      </head>
      <body class="bg-[#0b0d10] text-neutral-100">{children}</body>
    </html>
  )
})
