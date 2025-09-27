import { Hono } from 'hono'

const pdfRouter = new Hono()

function absoluteUrl(input: string, base: string): string {
  try {
    return new URL(input, base).toString()
  } catch {
    return input
  }
}

function buildFilenameFromUrl(u: string): string {
  try {
    const url = new URL(u)
    const m = url.pathname.match(/\/(minutes|protokoll)\/(\d+)/i)
    if (m) return `${m[1]}-${m[2]}.pdf`
    const last = url.pathname.split('/').filter(Boolean).pop() || 'document'
    return `${last}.pdf`
  } catch {
    return 'document.pdf'
  }
}

pdfRouter.get('/api/pdf/export', async (c) => {
  const token = (c.env as any).BROWSERLESS_TOKEN as string | undefined
  const qUrl = c.req.query('url') || ''
  if (!qUrl) return c.json({ ok: false, error: 'Missing url' }, 400)

  // Build absolute URL from base
  const base = (() => { try { const u = new URL(c.req.url); return `${u.protocol}//${u.host}` } catch { return '' } })()
  const appBase = (c.env as any).APP_BASE_URL as string | undefined
  const abs = absoluteUrl(qUrl, appBase || base)

  const fallback = () => {
    try {
      const u = new URL(abs)
      u.searchParams.set('pdf_fallback','1')
      return c.redirect(u.toString(), 302)
    } catch {
      return c.text('PDF export failed and fallback URL invalid', 500)
    }
  }

  if (!token) {
    return fallback()
  }

  try {
    const endpoint = `https://chrome.browserless.io/pdf?token=${encodeURIComponent(token)}`
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: abs,
        options: {
          printBackground: true,
          preferCSSPageSize: true,
          timeout: 25000,
          scale: 1.0,
          margin: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' }
        }
      })
    })
    if (!resp.ok) {
      // Bubble up message for observability; but UX should fallback
      return fallback()
    }
    const buf = await resp.arrayBuffer()
    const filename = buildFilenameFromUrl(abs)
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch {
    return fallback()
  }
})

export default pdfRouter
