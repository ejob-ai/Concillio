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
          <meta name="twitter:card" content="summary_large_image" />
          {(() => { try { const base = (c.env as any)?.APP_BASE_URL || (new URL(c.req.url).origin); const u = new URL(base.replace(/\/$/, '') + '/og'); if (head.title) u.searchParams.set('title', head.title); if (head.description) u.searchParams.set('subtitle', head.description); return (<meta property="og:image" content={u.toString()} />) } catch { return null } })()}
          {canonical && <link rel="canonical" href={canonical} />}
          {altSv && <link rel="alternate" hrefLang="sv" href={altSv} />}
          {altEn && <link rel="alternate" hrefLang="en" href={altEn} />}
        </>); })()}
        <link href="/static/style.css?v=2025-09-06T22:25:00Z" rel="stylesheet" />
        <link href="/static/new-landing/style.css" rel="stylesheet" />
        <link href="/static/new-landing/design-style.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com" defer></script>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&family=Crimson+Text:wght@400;600;700&display=swap" rel="stylesheet" />
        {/* Inline scripts are blocked by CSP; moved logic to /static/app.js for interactivity. Theme init kept until moved. */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style>{`
          /* Hide legacy auth/header everywhere unless route explicitly opts-in */
          #ssr-auth-header { display: none !important; }
        `}</style>
      </head>
      <body class="bg-[#0b0d10] text-neutral-100">
        <div id="ssr-auth-header" class="fixed top-4 left-4 z-[62] flex items-center gap-3">
          <div data-auth-host class="flex items-center gap-3"></div>
          <a href="/login" data-authed="out" class="px-3 py-1.5 rounded border border-neutral-800 text-neutral-300 hover:text-neutral-100">Logga in</a>
          <a href="/signup" data-authed="out" class="px-3 py-1.5 rounded border border-neutral-800 text-neutral-300 hover:text-neutral-100">Skapa konto</a>
          <a href="/account" data-authed="in" class="px-3 py-1.5 rounded border border-neutral-800 text-neutral-300 hover:text-neutral-100">Konto</a>
        </div>
        {children}
        <script src="/static/app.js" defer></script>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var overlay     = document.getElementById('site-menu-overlay');
            var panel       = document.getElementById('site-menu-panel');
            var burger      = document.getElementById('menu-trigger');
            var closeBtn    = document.getElementById('menu-close');
            var main        = document.getElementById('mainContent');

            if (!overlay || !panel || !burger || !main) return;

            var isiOS = /iP(ad|hone|od)/.test(navigator.platform) ||
                        (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

            var lastFocus = null;
            var saved = { bodyPadRight:'', headerPadRight:'', bodyPos:'', bodyTop:'', scrollY:0 };

            function scrollbarWidth(){ return window.innerWidth - document.documentElement.clientWidth; }

            function focusFirst(scope){
              var first = scope.querySelector('[autofocus], a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
              if (first) { try{ first.focus(); }catch(_){ } return; }
              scope.setAttribute('tabindex','-1'); try{ scope.focus(); }catch(_){}
            }

            function trapTab(e){
              if (e.key !== 'Tab') return;
              var items = panel.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
              if (!items.length) return;
              var first = items[0], last = items[items.length - 1];
              if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
            }

            function setOpen(open){
              burger.setAttribute('aria-expanded', String(open));
              overlay.setAttribute('aria-hidden', String(!open));
              document.body.classList.toggle('no-scroll', open);
              main.toggleAttribute('inert', open);

              if (open){
                saved.bodyPadRight = document.body.style.paddingRight || '';
                saved.bodyPos      = document.body.style.position     || '';
                saved.bodyTop      = document.body.style.top          || '';

                var sw = scrollbarWidth();
                if (sw > 0) document.body.style.paddingRight = sw + 'px';

                saved.scrollY = window.scrollY || 0;
                if (isiOS){
                  document.body.style.position = 'fixed';
                  document.body.style.top = (-saved.scrollY) + 'px';
                }

                lastFocus = document.activeElement;
                focusFirst(panel);
                document.addEventListener('keydown', onKeydown);
              } else {
                document.body.style.paddingRight = saved.bodyPadRight;
                if (isiOS){
                  document.body.style.position = saved.bodyPos;
                  document.body.style.top = saved.bodyTop;
                  window.scrollTo(0, saved.scrollY || 0);
                } else {
                  document.body.style.position = saved.bodyPos;
                  document.body.style.top = saved.bodyTop;
                }
                document.removeEventListener('keydown', onKeydown);
                try{ lastFocus && lastFocus.focus && lastFocus.focus(); }catch(_){}
              }
            }

            function onKeydown(e){
              if (e.key === 'Escape'){ setOpen(false); return; }
              trapTab(e);
            }

            // Wire up
            burger.addEventListener('click', function(e){ e.preventDefault(); setOpen(true);  });
            closeBtn.addEventListener('click', function(e){ e.preventDefault(); setOpen(false); });
            overlay.addEventListener('click', function(e){ if (e.target === overlay) setOpen(false); });
            document.addEventListener('visibilitychange', function(){ if (document.hidden) setOpen(false); });
          })();
        `}} />

      </body>
    </html>
  )
})
