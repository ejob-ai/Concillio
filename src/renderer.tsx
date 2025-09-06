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
        {(() => { let head: any = {}; try { head = (c.get as any)?.('head') || {} } catch {} let canonical = ''; let altSv = ''; let altEn = ''; try { const url = new URL(c.req.url); url.searchParams.set('lang', lang); canonical = url.toString(); const uSv = new URL(canonical); uSv.searchParams.set('lang','sv'); altSv = uSv.toString(); const uEn = new URL(canonical); uEn.searchParams.set('lang','en'); altEn = uEn.toString(); } catch {} return (<>
          <title>{head.title || 'Concillio – Council of Minds'}</title>
          {head.description && <meta name="description" content={head.description} />}
          <meta property="og:title" content={head.title || 'Concillio – Council of Minds'} />
          {head.description && <meta property="og:description" content={head.description} />}
          {canonical && <meta property="og:url" content={canonical} />}
          <meta property="og:type" content={head.ogType || 'website'} />
          <meta name="twitter:card" content="summary" />
          {canonical && <link rel="canonical" href={canonical} />}
          {altSv && <link rel="alternate" hrefLang="sv" href={altSv} />}
          {altEn && <link rel="alternate" hrefLang="en" href={altEn} />}
        </>); })()}
        <link href="/static/style.css?v=2025-09-05T20:45:00Z" rel="stylesheet" />
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
      <body class="bg-[#0b0d10] text-neutral-100">{children}
        <script dangerouslySetInnerHTML={{ __html: `
          (() => {
            // Simple A/B variant propagation for analytics
            function getCookie(name){
              try { return (document.cookie.match(new RegExp('(?:^|; )'+name+'=([^;]+)'))||[])[1]||'' } catch(_) { return '' }
            }
            function setCookie(name, value, days){
              try { var max=days?'; Max-Age='+(days*24*60*60):''; document.cookie = name+'='+value+'; Path=/'+max+'; SameSite=Lax'; } catch(_) {}
            }
            function initVariant(){
              try{
                var url = new URL(location.href);
                var vq = (url.searchParams.get('v') || url.searchParams.get('variant') || '').toUpperCase();
                var vc = (getCookie('variant')||'').toUpperCase();
                var v = (vq==='A' || vq==='B') ? vq : (vc==='A' || vc==='B' ? vc : (Math.random()<0.5?'A':'B'));
                setCookie('variant', v, 30);
                try { (window).__VARIANT__ = v; document.documentElement.setAttribute('data-variant', v); } catch(_) {}
                return v;
              }catch(_){ return 'A' }
            }
            var __V = (window).__VARIANT__ || initVariant();

            const handler = (e) => {
              try {
                const a = e.target && (e.target.closest ? e.target.closest('[data-cta]') : null);
                if (!a) return;
                var src = a.getAttribute('data-cta-source') || '';
                const payload = {
                  cta: a.getAttribute('data-cta'),
                  source: src + (__V ? ' | v:'+__V : ''),
                  href: a.getAttribute('href') || '',
                  ts: Date.now()
                };
                fetch('/api/analytics/council', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                }).catch(()=>{});
              } catch(_) {}
            };
            addEventListener('click', handler, { capture: true, passive: true });
          })();
        ` }} />
      </body>
    </html>
  )
})
