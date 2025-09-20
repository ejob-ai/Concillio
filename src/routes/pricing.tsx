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

export const renderPricing = (c: Context) => {
  c.header('Cache-Control', 'public, max-age=900, must-revalidate')
  c.header('Pragma', '')
  c.header('Expires', '')
  try {
    // Mirror middleware: weak ETag + Last-Modified based on build
    // @ts-ignore
    const etag = `W/"pricing-${__BUILD_ID__}"`
    // @ts-ignore
    const lastMod = __BUILD_TIME__
    c.header('ETag', etag)
    c.header('Last-Modified', lastMod)
  } catch {}
  // canonical always /pricing
  try {
    const head = (c.get as any)?.('head') || {}
    ;(c.set as any)?.('head', { ...head, canonical: 'https://concillio.pages.dev/pricing', title: head.title || 'Pricing – Concillio', description: head.description || 'Choose a plan that fits your team. All prices in USD.' })
    // mark routeName for diagnostics header
    try { (c.set as any)?.('routeName', 'pricing') } catch {}
  } catch {}

  return c.render(
    <main class="pricing-page container mx-auto py-12">
      <section class="pricing-hero">
        <h1 class="page-title">Pricing</h1>
        <p class="sub">All prices in <strong>USD</strong>. Switch plans anytime. Checkout starts server-side via Stripe.</p>
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
          ctaHref="/api/billing/checkout/start?plan=starter"
          ctaLabel="Choose Starter"
        />

        <PricingCard
          planKey="pro"
          title="Pro"
          subtitle="Growing orgs — file evaluation, integrations & advanced reports."
          highlight
          ctaHref="/api/billing/checkout/start?plan=pro"
          ctaLabel="Choose Pro"
        />

        <PricingCard
          planKey="legacy"
          title="Legacy"
          subtitle="Full suite & highest limits."
          ctaHref="/api/billing/checkout/start?plan=legacy"
          ctaLabel="Choose Legacy"
        />
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          // Dev-only helper: when running on localhost or e2b sandbox, redirect pricing CTAs to production GET endpoint
          var host = location.hostname;
          var isDevHost = host === 'localhost' || host === '127.0.0.1' || /\.e2b\.dev$/.test(host);
          if (!isDevHost) return;
          var PROD = 'https://concillio.pages.dev';
          document.addEventListener('click', function(e){
            try{
              var t = e.target instanceof Element ? e.target.closest('a[data-plan]') : null;
              if (!t) return;
              // Respect modifier keys and non-left clicks
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              e.stopPropagation();
              var plan = t.getAttribute('data-plan') || '';
              if (!plan) { location.href = '/pricing'; return; }
              var url = PROD + '/api/billing/checkout/start?plan=' + encodeURIComponent(plan);
              location.href = url;
            }catch(err){ try{ console.warn('pricing intercept error', err); }catch(_){} try{ location.href = '/checkout?plan=' + encodeURIComponent(plan); }catch(_){} }
          }, { capture: true, passive: false });
        })();
      ` }} />

    </main>
  )
}

router.get('/pricing', (c: Context) => {
  return renderPricing(c)
})



export default router
