import { Hono } from 'hono'
import { renderer } from '../renderer'
import { SecondaryCTA } from '../index'

const pricing = new Hono()
pricing.use(renderer)

function PlanCard({ tier, price, period, features, ctaHref, ctaLabel, highlighted }: {
  tier: string
  price: string
  period?: string
  features: string[]
  ctaHref: string
  ctaLabel: string
  highlighted?: boolean
}) {
  return (
    <div class={[
      'rounded-2xl border p-6 flex flex-col gap-4 bg-white/70',
      highlighted ? 'ring-2 ring-[var(--concillio-gold)] bg-white' : 'border-[color-mix(in_oklab,var(--navy)12%,white)]'
    ].join(' ')}>
      <div class="flex items-baseline justify-between">
        <h3 class="text-xl font-semibold">{tier}</h3>
        {highlighted && <span class="text-xs px-2 py-0.5 rounded-full bg-[var(--gold-12)] text-[var(--navy)] border border-[var(--concillio-gold)]">Most popular</span>}
      </div>
      <div>
        <div class="text-3xl font-bold tracking-tight">{price}</div>
        {period && <div class="text-sm text-slate-500">{period}</div>}
      </div>
      <ul class="mt-2 space-y-2 text-sm">
        {features.map((f) => (
          <li class="flex items-start gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" class="text-emerald-600 shrink-0"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div class="mt-3">
        <a href={ctaHref} class={[
          'inline-flex items-center justify-center w-full min-h-[44px] rounded-xl',
          highlighted ? 'btn-primary-gold text-white' : 'btn btn-secondary'
        ].join(' ')} data-cta="primary-pricing" data-cta-source={`pricing:${tier.toLowerCase()}`}>{ctaLabel}</a>
      </div>
    </div>
  )
}

pricing.get('/pricing', (c) => {
  try { c.set('routeName', 'marketing:pricing') } catch {}
  c.set('head', {
    title: 'Pricing – Concillio',
    description: 'Freemium, Starter, and Pro plans. Pick your council access level.'
  })
  return c.render(
    <main id="mainContent" class="min-h-screen bg-white text-slate-900">
      <section class="py-14 border-b border-[var(--line)]">
        <div class="wrap text-center">
          <h1 class="font-['Crimson_Text'] text-[clamp(2rem,5vw,3rem)] tracking-tight">Premium pricing</h1>
          <p class="muted mt-2 max-w-2xl mx-auto">Plans that scale from personal decisions to team governance. Transparent value, no surprises.</p>
        </div>
      </section>

      <section class="py-12">
        <div class="wrap">
          <div class="grid gap-5 md:grid-cols-3">
            <PlanCard
              tier="Freemium"
              price="$0"
              period="— forever"
              features={[
                '1 personal line-up (4 roles)',
                '1 session / month',
                'Ceremonial minutes (PDF export)',
                'Basic consensus view'
              ]}
              ctaHref="/signup?plan=free"
              ctaLabel="Get started"
            />

            <PlanCard
              tier="Pro"
              price="$29"
              period="per month"
              features={[
                'Custom line-ups (up to 7 roles)',
                'Unlimited sessions',
                'Heuristic weighting & tuning',
                'Shareable minutes links',
                'Priority support'
              ]}
              ctaHref="/checkout?plan=pro"
              ctaLabel="Upgrade to Pro"
              highlighted
            />

            <PlanCard
              tier="Starter"
              price="$9"
              period="per month"
              features={[
                '2 saved line-ups',
                '5 sessions / month',
                'PDF exports',
                'Email support'
              ]}
              ctaHref="/checkout?plan=starter"
              ctaLabel="Choose Starter"
            />
          </div>
        </div>
      </section>

      <section class="py-12 bg-slate-50 border-y border-[var(--line)]">
        <div class="wrap grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h2 class="text-xl font-semibold">What’s included</h2>
            <ul class="mt-3 space-y-2 text-sm">
              <li>• Four expert perspectives synthesized into minutes</li>
              <li>• Weighted consensus with conditions & KPIs</li>
              <li>• Strict CSP, telemetry and PII scrubbing</li>
              <li>• Export to PDF, share links (Pro)</li>
            </ul>
          </div>
          <div>
            <h2 class="text-xl font-semibold">Fair use & limits</h2>
            <ul class="mt-3 space-y-2 text-sm">
              <li>• Reasonable usage policy applies</li>
              <li>• Anti‑abuse guardrails; no scraping</li>
              <li>• Enterprise? Contact us for SSO, DPA, SLAs</li>
            </ul>
            <div class="mt-4">
              <SecondaryCTA href="/contact" label="Contact sales" dataCta="secondary-contact-sales" dataCtaSource="pricing:enterprise" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
})

export default pricing
