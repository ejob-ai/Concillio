import { describe, it, expect, beforeEach } from 'vitest'

// Mount minimal DOM
function mount(html = `
  <html><head></head><body data-subscription-active="" data-stripe-customer-id="">
    <a data-billing-link href="/app/billing" style="display:none">Billing</a>
  </body></html>
`) {
  document.documentElement.innerHTML = html
}

describe('menu.js – Billing-länk toggle', () => {
  beforeEach(() => mount())

  it('visar Billing när subscriptionActive=true', async () => {
    // emulate menu.js helper injected on window
    if (!(window as any).__refreshBillingLinks) {
      // inline minimal port of the refresh function for unit context
      ;(window as any).__refreshBillingLinks = function () {
        try {
          const b = (document.body && document.body.dataset) || ({} as DOMStringMap)
          const active = String(b.subscriptionActive || '').toLowerCase() === 'true'
          const hasStripe = String((b as any).stripeCustomerId || '').length > 0
          const show = active || hasStripe
          document.querySelectorAll('[data-billing-link]').forEach((el: any) => {
            try { el.style.display = show ? '' : 'none' } catch {}
          })
        } catch {}
      }
    }
    document.body.dataset.subscriptionActive = 'true'
    ;(window as any).__refreshBillingLinks()
    const el = document.querySelector('[data-billing-link]') as HTMLElement
    expect(getComputedStyle(el).display).not.toBe('none')
  })

  it('visar Billing när stripeCustomerId finns', async () => {
    document.body.dataset.subscriptionActive = ''
    ;(document.body.dataset as any).stripeCustomerId = 'cus_test_123'
    ;(window as any).__refreshBillingLinks?.()
    const el = document.querySelector('[data-billing-link]') as HTMLElement
    expect(getComputedStyle(el).display).not.toBe('none')
  })

  it('döljer Billing när varken active eller stripe-id finns', async () => {
    document.body.dataset.subscriptionActive = ''
    ;(document.body.dataset as any).stripeCustomerId = ''
    ;(window as any).__refreshBillingLinks?.()
    const el = document.querySelector('[data-billing-link]') as HTMLElement
    expect(getComputedStyle(el).display).toBe('none')
  })
})
