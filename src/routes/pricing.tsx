import { Hono } from 'hono'

const pricing = new Hono()

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.193 9.193a1 1 0 0 1-1.414 0L3.715 11.55a1 1 0 1 1 1.414-1.414l5.143 5.143 8.486-8.486a1 1 0 0 1 1.527-.085z"/>
    </svg>
  )
}

function PlanCard({
  tier,
  price,
  period = ' / mån',
  badge,
  description,
  features,
  ctaHref,
  highlighted = false,
}: {
  tier: string
  price: string
  period?: string
  badge?: string
  description: string
  features: string[]
  ctaHref: string
  highlighted?: boolean
}) {
  const isFreemium = tier.toLowerCase() === 'freemium'
  const dataCta = isFreemium ? 'primary-pricing-freemium' : `primary-pricing-${tier.toLowerCase()}`
  const dataCtaSource = `pricing:${tier.toLowerCase()}`
  return (
    <div className={`pricing-card ${highlighted ? 'is-highlighted' : ''}`} data-tier={tier}>
      {badge ? <div className="plan-badge" aria-label={badge}>{badge}</div> : null}
      <div className="plan-head">
        <h3 className="plan-title">{tier}</h3>
        <div className="plan-price">
          <span className="price">{price}</span>
          <span className="period">{period}</span>
        </div>
        <p className="plan-desc">{description}</p>
      </div>
      <ul className="plan-features" role="list">
        {features.map((f, i) => (
          <li key={i} className="feature">
            <span className="icon"><CheckIcon /></span>
            <span className="label">{f}</span>
          </li>
        ))}
      </ul>
      <div className="plan-cta">
        <a
          className="btn btn-primary"
          href={ctaHref}
          data-cta={dataCta}
          data-cta-source={dataCtaSource}
          data-plan={tier.toLowerCase() === 'freemium' ? 'free' : tier.toLowerCase()}
        >
          {isFreemium ? 'Get started' : 'Choose plan'}
        </a>
      </div>
    </div>
  )
}

pricing.get('/pricing', (c) => {
  c.header('Cache-Control', 'public, max-age=600')
  const lang = (c.req.query('lang') || '').toLowerCase().startsWith('sv') ? 'sv' : 'en'
  const title = lang === 'sv' ? 'Priser – Concillio' : 'Pricing – Concillio'
  const desc  = lang === 'sv'
    ? 'Välj plan: Freemium, Starter, Pro eller Legacy. Alla går att köpa direkt.'
    : 'Choose Freemium, Starter, Pro, or Legacy. All tiers are self-serve.'
  c.set('head', { title, description: desc })

  return c.render(
    <main className="pricing-page">
      <section className="pricing-hero container">
        <p className="eyebrow">Pricing</p>
        <h1>Simple, fair, premium</h1>
        <p className="sub">
          Start free. Upgrade when you need file analysis, integrations and advanced reporting.
        </p>
      </section>

      <section className="pricing-grid container" aria-label="Plans">
        <PlanCard
          tier="Freemium"
          price="0 kr"
          description="Testa Concillio – ett council och enkel export."
          features={[
            '1 council',
            'Basroller (Strategist, Advisor, Psychologist m.fl.)',
            'Export av beslut i textformat',
            'TOC-navigation',
            'Lägg till små bilagor (≤ 2 MB) för diskussion',
          ]}
          ctaHref="/signup?plan=free"
        />

        <PlanCard
          tier="Starter"
          price="149 kr"
          description="För mindre team – fler councils, PDF-export, enklare bilagor."
          features={[
            'Upp till 3 councils',
            'Export till PDF',
            'Drive/Dropbox import (grund)',
            'Bilagor upp till 10 MB (PDF/Docx)',
            'Keyword-highlight i dokument',
          ]}
          ctaHref="/checkout?plan=starter"
        />

        <PlanCard
          tier="Pro"
          price="349 kr"
          description="Avancerad analys – filutvärdering, integrationer och rapporter."
          badge="Most popular"
          features={[
            'Upp till 10 councils',
            'Custom role templates',
            'Integrationer: Slack + Notion + Drive',
            'Avancerade rapporter & visualiseringar',
            'Filutvärdering av anbud/offerter med poäng & rekommendation',
            'Flera bilagor per ärende (sammanställning)',
          ]}
          ctaHref="/checkout?plan=pro"
          highlighted
        />

        <PlanCard
          tier="Legacy"
          price="549 kr"
          description="För större behov – vänta tills efter lansering (backlog)."
          features={[
            'Obegränsade councils',
            'White-label branding',
            'API access',
            'Scenario planning & AI insights',
            'Stora bilagor & batch-jämförelser',
          ]}
          ctaHref="/checkout?plan=legacy"
        />
      </section>

      <section className="pricing-notes container">
        <p className="small">
          Alla priser exkl. moms. Du kan uppgradera/nedgradera när som helst. Legacy-funktioner lanseras efter start.
        </p>
      </section>
    </main>
  )
})

export default pricing
