import { Hono } from 'hono'
import type { Context } from 'hono'
import { jsxRenderer } from '../renderer'

const router = new Hono()

function headNoIndex(c: any) {
  try {
    const head0: any = (c.get as any)?.('head') || {}
    ;(c.set as any)?.('head', {
      ...head0,
      title: head0.title || 'Billing – Concillio',
      description: head0.description || 'Manage your Concillio subscription and invoices.',
      canonical: 'https://concillio.pages.dev/app/billing',
      robots: 'noindex, nofollow'
    })
    c.header('X-Robots-Tag', 'noindex, nofollow')
  } catch {}
}

router.get('/app/billing', (c: Context) => {
  headNoIndex(c)
  const url = new URL(c.req.url)
  const customerId = (url.searchParams.get('customerId') || '').trim()

  return c.render(
    <main class="container mx-auto py-10">
      <h1 class="text-2xl font-semibold mb-2">Billing</h1>
      <p class="text-neutral-500 mb-6">Manage subscription, payment methods and invoices.</p>

      {customerId ? (
        <div class="border border-neutral-200 rounded-lg p-4">
          <div class="text-sm text-neutral-700 mb-3">Detected customer ID:</div>
          <code class="inline-block px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-neutral-800">{customerId}</code>
          <div class="mt-5">
            <a class="btn btn-primary" href={`/api/billing/portal/start?customerId=${encodeURIComponent(customerId)}`}>
              Open Billing Portal
            </a>
          </div>
        </div>
      ) : (
        <div class="border border-neutral-200 rounded-lg p-4">
          <div class="text-sm text-neutral-700 mb-3">Enter your Stripe Customer ID to open the Billing Portal.</div>
          <form method="GET" action="/app/billing" class="flex items-center gap-2">
            <input type="text" name="customerId" placeholder="cus_..." required class="px-3 py-2 border rounded w-[320px]" />
            <button type="submit" class="btn btn-primary">Manage</button>
          </form>
          <p class="text-xs text-neutral-500 mt-2">Temporary developer shortcut: you can also append ?customerId=cus_xxx to the URL.</p>
        </div>
      )}
    </main>
  )
})

export default router
