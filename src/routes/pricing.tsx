import { Hono } from 'hono'
import type { Context } from 'hono'
import { jsxRenderer } from '../renderer'
import { PLANS } from '../utils/plans'

// helpers
const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

const PricingCard = (p: {
  planKey: 'free' | 'starter' | 'pro' | 'legacy',
  title: string,
  subtitle: string,
  highlight?: boolean,
  ctaHref: string,
  ctaLabel: string,
}) => {
  const plan = PLANS[p.planKey]
  return (
    <div class={`pricing-card${p.highlight ? ' is-highlighted' : ''}`}>
      {p.highlight && <div class="plan-badge">Most popular</div>}
      <div class="plan-head">
        <h3 class="plan-title">{p.title}</h3>
        <div class="plan-price">
          {p.planKey === 'free' ? (
            <>$0 <span class="per">/ mo</span></>
          ) : (
            <>
              {fmtUSD(plan.priceUSD)} <span class="per">/ mo</span>
            </>
          )}
        </div>
        <p class="plan-desc">{p.subtitle}</p>
      </div>

      <ul class="plan-features">
        {p.planKey === 'free' && (
          <>
            <li>1 council</li>
            <li>No file attachments</li>
            <li>CSV/PDF export unavailable</li>
            <li>Core roles only</li>
          </>
        )}
        {p.planKey === 'starter' && (
          <>
            <li>Up to {plan.councils} councils / month</li>
            <li>Attachments: up to {plan.attachments.maxMB} MB (PDF/DOCX), {plan.attachments.maxFiles} files</li>
            <li>CSV export</li>
            <li>AI reports &amp; file evaluation</li>
            <li>Integrations: Google Drive</li>
          </>
        )}
        {p.planKey === 'pro' && (
          <>
            <li>Up to {plan.councils} councils / month</li>
            <li>Attachments: up to {plan.attachments.maxMB} MB, {plan.attachments.maxFiles} files</li>
            <li>CSV + PDF export</li>
            <li>AI reports &amp; advanced visualizations</li>
            <li>Integrations: Slack, Notion, Google Drive</li>
            <li>Custom role templates</li>
          </>
        )}
        {p.planKey === 'legacy' && (
          <>
            <li>Up to {plan.councils} councils / month</li>
            <li>Attachments: generous limits</li>
            <li>CSV + PDF export</li>
            <li>All integrations</li>
            <li>Advanced reports &amp; automation</li>
          </>
        )}
      </ul>

      <a
        class={`btn btn-primary plan-cta`}
        href={p.ctaHref}
        data-cta="pricing"
        data-cta-source="pricing"
        data-plan={p.planKey}
      >
        {p.ctaLabel}
      </a>
    </div>
  )
}

const router = new Hono()

router.get('/pricing', jsxRenderer(({ c }: { c: Context }) => {
  c.header('X-Pricing-Route', 'v2')
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  c.set('head', {
    title: 'Pricing – Concillio',
    description: 'Choose a plan that fits your team. All prices in USD.',
  })

  return (
    <main class="pricing-page container mx-auto py-12">
      <section class="pricing-hero">
        <h1 class="page-title">Pricing</h1>
        <p class="sub">All prices in <strong>USD</strong>. Switch plans anytime.</p>
      </section>

      <section class="pricing-grid">
        <PricingCard
          planKey="free"
          title="Free"
          subtitle="Try Concillio for free."
          ctaHref="/signup?plan=free"
          ctaLabel="Start for free"
        />

        <PricingCard
          planKey="starter"
          title="Starter"
          subtitle="Small teams — more councils, CSV export, simple attachments."
          highlight={false}
          ctaHref="/checkout?plan=starter"
          ctaLabel="Choose Starter"
        />

        <PricingCard
          planKey="pro"
          title="Pro"
          subtitle="Growing orgs — file evaluation, integrations & advanced reports."
          highlight
          ctaHref="/checkout?plan=pro"
          ctaLabel="Choose Pro"
        />

        <PricingCard
          planKey="legacy"
          title="Legacy"
          subtitle="Full suite & highest limits."
          ctaHref="/checkout?plan=legacy"
          ctaLabel="Choose Legacy"
        />
      </section>
      <footer data-sig="pricing-v2" style="display:none">pricing-v2</footer>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          try{
            // Force signature element in DOM even if renderer wrappers change
            var f = document.querySelector('footer[data-sig="pricing-v2"]');
            if (!f) {
              f = document.createElement('footer');
              f.setAttribute('data-sig','pricing-v2');
              f.style.display = 'none';
              document.body.appendChild(f);
            }
          }catch(_){}
        })();
      `}} />
    </main>
  )
}))



export default router
