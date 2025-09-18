import { jsxRenderer } from 'hono/jsx-renderer'
import Header from './components/Header'

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

  // SSR theme: only 'light' or 'dark'; default to light
  let ssrTheme = 'light'
  try {
    const cookie = c.req.header('Cookie') || ''
    const m = cookie.match(/(?:^|;\s*)theme=([^;]+)/)
    const v = m ? decodeURIComponent(m[1]).toLowerCase() : ''
    if (v === 'dark') ssrTheme = 'dark'
  } catch {}

  return (
    <html lang={lang} data-app-root data-theme={ssrTheme} class={ssrTheme === 'dark' ? 'dark' : undefined}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {(() => { let head: any = {}; try { head = (c.get as any)?.('head') || {} } catch {} let canonical = ''; let altSv = ''; let altEn = ''; let pathname = ''; let origin = ''; let ogImage = ''; try { const url = new URL(c.req.url); origin = url.origin; pathname = url.pathname || ''; if (pathname === '/' || pathname === '') { canonical = 'https://concillio.pages.dev/'; } else if (pathname === '/pricing') { canonical = 'https://concillio.pages.dev/pricing'; } else if (pathname.startsWith('/docs/lineups')) { canonical = 'https://concillio.pages.dev/docs/lineups'; } else if (pathname.startsWith('/docs/roller')) { canonical = 'https://concillio.pages.dev/docs/roller'; } else { canonical = origin + pathname; } // build hreflang alternates with lang param for UX discovery (kept even when canonical is language-less)
            try { const uSv = new URL(origin + pathname); uSv.searchParams.set('lang','sv'); altSv = uSv.toString(); const uEn = new URL(origin + pathname); uEn.searchParams.set('lang','en'); altEn = uEn.toString(); } catch {}
            // OG image: docs use static 1200x630 PNG; others use dynamic /og SVG
            if (pathname.startsWith('/docs/lineups') || pathname.startsWith('/docs/roller')) {
              ogImage = 'https://concillio.pages.dev/static/og/hero-1200x630.png';
            } else {
              try { const base = (c.env as any)?.APP_BASE_URL || (new URL(c.req.url).origin); const u = new URL(base.replace(/\/$/, '') + '/og'); if (head.title) u.searchParams.set('title', head.title); if (head.description) u.searchParams.set('subtitle', head.description); ogImage = u.toString(); } catch {}
            }
          } catch {}

          // Välj språk för copy baserat på head.lang eller SSR-lang
          const hLang = String((head.lang ?? lang ?? 'en')).toLowerCase();
          const copyLang = hLang.startsWith('sv') ? 'sv' : 'en';

          const COPY = (copyLang === 'sv'
            ? { lineupsH1: 'Styrelsesammansättning', lineupsDesc: 'Concillio styrelsesammansättning: sätt rätt line-up av roller för ert råd.', rolesDesc: 'Concillio roller: ansvar, leverabler och hur varje roll skapar värde i ert råd.', ogSite: 'Concillio' }
            : { lineupsH1: 'Board composition', lineupsDesc: 'Concillio board composition: build the right line-up of roles for your council.', rolesDesc: 'Concillio roles: responsibilities, deliverables and how each role adds value to your board.', ogSite: 'Concillio' });

          // Meta description – använd head.description om den finns, annars språkspecifik
          const pageDesc = head.description ?? (pathname.startsWith('/docs/lineups') ? COPY.lineupsDesc : (pathname.startsWith('/docs/roller') ? COPY.rolesDesc : undefined));

          // OG-title / description
          let ogTitle = head.title || 'Concillio – Council of Minds';
          if (pathname.startsWith('/docs/lineups')) ogTitle = COPY.lineupsH1;
          if (pathname.startsWith('/docs/roller')) ogTitle = 'Roller';

          return (<>
          <title>{head.title || 'Concillio – Council of Minds'}</title>
          {pageDesc && <meta name="description" content={pageDesc} />}
          <meta property="og:title" content={ogTitle} />
          {pageDesc && <meta property="og:description" content={pageDesc} />}
          {canonical && <meta property="og:url" content={canonical} />}
          <meta property="og:type" content={head.ogType || 'website'} />
          <meta property="og:site_name" content={COPY.ogSite} />
          <meta name="twitter:card" content="summary_large_image" />
          {ogImage && <meta property="og:image" content={ogImage} />}
          {(pathname.startsWith('/docs/lineups') || pathname.startsWith('/docs/roller')) && (<>
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>)}
          {canonical && <link rel="canonical" href={canonical} />}
          {altSv && <link rel="alternate" hrefLang="sv" href={altSv} />}
          {altEn && <link rel="alternate" hrefLang="en" href={altEn} />}
        </>); })()}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Crimson+Text:wght@600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/static/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="stylesheet" href="/static/tailwind.css?v=20250914-1" />
        <link rel="stylesheet" href="/static/style.css?v=20250914-1" />
        <script src="/static/scroll.js" defer></script>
      </head>
      <body class="bg-white text-[#111111]">
        <a href="#main" class="sr-only focus:not-sr-only">Hoppa till innehåll</a>
        <div id="ssr-auth-header" class="fixed top-4 left-4 z-[62] flex items-center gap-3">
          <div data-auth-host class="flex items-center gap-3"></div>
          <a href="/login" data-authed="out" class="px-3 py-1.5 rounded border border-neutral-800 text-neutral-300 hover:text-neutral-100">Logga in</a>
          <a href="/signup" data-authed="out" class="px-3 py-1.5 rounded border border-neutral-800 text-neutral-300 hover:text-neutral-100">Skapa konto</a>
          <a href="/account" data-authed="in" class="px-3 py-1.5 rounded border border-neutral-800 text-neutral-300 hover:text-neutral-100">Konto</a>
        </div>
        <Header />
        <div id="main" tabIndex={-1} aria-hidden="true"></div>
        <main id="mainContent">{children}</main>
        <script src="/static/app.js" defer></script>
        <script src="/static/menu.js" defer></script>

        {/* Toast live-region för icke-blockerande notifieringar */}
        <div
          id="toast-root"
          className="toast-container toast-container--bottom"
          role="region"
          aria-live="polite"
          aria-atomic="true"
        />

        {/* Ladda API (efter scroll/menu så den kan användas överallt) */}
        <script src="/static/toast.js" defer></script>
        <script src="/static/toast-hooks.js" defer></script>
        {(() => { try { const pathname = new URL(c.req.url).pathname; if (!pathname.startsWith('/council/ask')) return null; return (<>
          <script src="/static/ask.js" defer></script>
          <script src="/static/ask-client.js" defer></script>
        </>)} catch { return null } })()}
      </body>
    </html>
  )
})
