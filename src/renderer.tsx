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
        {/* removed inline menu controller in favor of /static/menu.js */}
        <script src="/static/menu.js" defer></script>

      </body>
    </html>
  )
})
