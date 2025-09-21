import { describe, it, expect, beforeEach } from 'vitest'

function mount(html = `
  <body data-subscription-active="" data-stripe-customer-id="">
    <a data-billing-link href="/app/billing" style="display:none">Billing</a>
  </body>
`) {
  document.documentElement.innerHTML = html
}

describe('menu.js – Billing-länk toggle (JSDOM)', () => {
  beforeEach(async () => {
    mount()
    // importera statiska scriptet; det sätter window.__refreshBillingLinks och kör DOMContentLoaded-hook i prod
    await import('../public/static/menu.js')
  })

  it('visar Billing när subscriptionActive = true', () => {
    document.body.dataset.subscriptionActive = 'true'
    ;(window as any).__refreshBillingLinks?.()
    const el = document.querySelector('[data-billing-link]') as HTMLElement
    expect(getComputedStyle(el).display).not.toBe('none')
  })

  it('visar Billing när stripeCustomerId finns', () => {
    document.body.dataset.subscriptionActive = ''
    document.body.dataset.stripeCustomerId = 'cus_test_123'
    ;(window as any).__refreshBillingLinks?.()
    const el = document.querySelector('[data-billing-link]') as HTMLElement
    expect(getComputedStyle(el).display).not.toBe('none')
  })

  it('döljer Billing när varken active eller stripe-id finns', () => {
    document.body.dataset.subscriptionActive = ''
    document.body.dataset.stripeCustomerId = ''
    ;(window as any).__refreshBillingLinks?.()
    const el = document.querySelector('[data-billing-link]') as HTMLElement
    expect(getComputedStyle(el).display).toBe('none')
  })
})
