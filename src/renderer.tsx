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
            // Auth header toggle and logout CSRF form
            try {
              const mountLogout = () => {
                if (document.getElementById('logout-form')) return;
                const f = document.createElement('form');
                f.method = 'POST'; f.action = '/api/auth/logout'; f.id = 'logout-form'; f.className = 'inline';
                const btn = document.createElement('button'); btn.type = 'submit'; btn.textContent = 'Logga ut';
                btn.className = 'px-3 py-1 rounded border border-neutral-700 text-neutral-300 hover:text-neutral-100';
                f.appendChild(btn);
                document.body.appendChild(f);
                f.addEventListener('submit', function(e){
                  e.preventDefault();
                  try{
                    const csrf = (document.cookie.match(/(?:^|; )csrf=([^;]+)/)||[])[1] || '';
                    fetch('/api/auth/logout', { method:'POST', headers: { 'x-csrf-token': csrf } })
                      .then(()=> location.reload()).catch(()=> location.reload());
                  }catch(_){ location.reload(); }
                });
              };
              fetch('/api/me').then(r=>r.json()).then(j=>{
                const authed = j && j.ok && j.user;
                document.querySelectorAll('[data-authed="in"]').forEach(el=>{ (el as HTMLElement).style.display = authed ? '' : 'none'; });
                document.querySelectorAll('[data-authed="out"]').forEach(el=>{ (el as HTMLElement).style.display = authed ? 'none' : ''; });
                if (authed) mountLogout();
              }).catch(()=>{});
            } catch(_) {}

            // PDF UX: simple toast helper + export started
            function showToast(msg, kind){
              try{
                var t = document.createElement('div');
                t.textContent = msg;
                t.className = 'fixed top-4 right-4 z-[80] px-4 py-2 rounded bg-neutral-900/90 border border-neutral-700 shadow text-sm ' + (kind==='error'?'text-red-300':'text-neutral-100');
                document.body.appendChild(t);
                setTimeout(function(){ try{ t.remove(); }catch(_){} }, 3500);
              }catch(_){ alert(msg); }
            }
            document.addEventListener('click', function(e){
              var btn = e.target && (e.target as Element).closest ? (e.target as Element).closest('[data-pdf-trigger]') : null;
              if (btn) showToast('Export started…', 'info');
            }, { capture: true });
            try {
              var url = new URL(location.href);
              if (url.searchParams.get('pdf_fallback') === '1') {
                showToast('PDF export failed; showing HTML instead.', 'error');
                url.searchParams.delete('pdf_fallback');
                history.replaceState({}, '', url.toString());
              }
            } catch(_) {}

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

            function getCookie(name){ try{ return (document.cookie.match(new RegExp('(?:^|; )'+name+'=([^;]+)'))||[])[1]||'' } catch(_){ return '' } }
            const handler = (e) => {
              try {
                const target = e.target as Element | null;
                if (!target) return;
                const withEv = target.closest ? target.closest('[data-ev]') as HTMLElement | null : null;
                if (withEv) {
                  const evName = withEv.getAttribute('data-ev') || '';
                  if (evName) {
                    const payloadEvt = {
                      event: evName,
                      role: 'consensus',
                      label: (window as any).__VARIANT__ || getCookie('exp_variant') || null,
                      path: location.pathname,
                      ts: Date.now()
                    };
                    fetch('/api/analytics/council', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payloadEvt) }).catch(()=>{});
                  }
                }
                const a = target.closest ? target.closest('[data-cta]') as HTMLElement | null : null;
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
