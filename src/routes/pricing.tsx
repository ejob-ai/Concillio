import { Hono } from 'hono'
import { renderer } from '../renderer'

const pricing = new Hono()
pricing.use(renderer)

function getLang(c: any): 'sv' | 'en' {
  try {
    const url = new URL(c.req.url)
    const v = (url.searchParams.get('lang') || url.searchParams.get('locale') || 'sv').toLowerCase()
    return (v === 'en' ? 'en' : 'sv') as any
  } catch { return 'sv' }
}

pricing.get('/pricing', (c) => {
  const lang = getLang(c)
  const title = lang === 'sv' ? 'Priser' : 'Pricing'
  try { c.set('head', { title: `Concillio – ${title}`, description: lang==='sv' ? 'Premium‑prissättning för Concillio' : 'Premium pricing for Concillio' }) } catch {}

  const plans = lang === 'sv'
    ? [
        { n: 'Individuell', p: '$249/m', f: ['Full tillgång till rådet','Ceremoniella protokoll','Council Consensus'] },
        { n: 'Team', p: '$699/m', f: ['Upp till 5 användare','Delade ärenden och historik','Prioriterad support'] },
        { n: 'Enterprise', p: 'Custom', f: ['Säkerhets- & juridiska tillägg','SLA & dedikerad kontakt','Integrationer'] }
      ]
    : [
        { n: 'Individual', p: '$249/m', f: ['Full access to the council','Ceremonial minutes','Council Consensus'] },
        { n: 'Team', p: '$699/m', f: ['Up to 5 users','Shared cases and history','Priority support'] },
        { n: 'Enterprise', p: 'Custom', f: ['Security & legal add-ons','SLA & dedicated liaison','Integrations'] }
      ]

  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-10 bg-white text-slate-900">
      <header class="mb-6">
        <h1 class="font-['Crimson_Text'] text-3xl text-slate-900">{title}</h1>
        <p class="text-slate-600 mt-1">{lang==='sv' ? 'Premium‑prissättning' : 'Premium pricing'}</p>
      </header>

      <div class="grid md:grid-cols-3 gap-6 border-t border-slate-200 pt-6">
        {plans.map((pl) => (
          <div class="border border-slate-200 rounded-xl p-6 bg-white card-premium">
            <div class="text-neutral-200 text-xl font-semibold">{pl.n}</div>
            <div class="mt-1 text-[var(--concillio-gold)] text-2xl">{pl.p}</div>
            <ul class="mt-4 text-neutral-300 space-y-2 text-sm">
              {pl.f.map((x) => (<li>• {x}</li>))}
            </ul>
            <div class="mt-6 flex gap-3 flex-wrap">
              <a href={lang==='sv'?`/waitlist?lang=${lang}`:`/waitlist?lang=${lang}`} data-cta="primary-pricing" data-cta-source="pricing:card" class="inline-flex items-center justify-center px-5 py-3 rounded-xl btn-primary-gold text-white font-medium shadow border border-[var(--navy)]">{lang==='sv'?'Ansök om inbjudan':'Apply for invite'}</a>
              <a href={lang==='sv'?`/contact?lang=${lang}`:`/contact?lang=${lang}`} data-cta="secondary-contact-sales" data-cta-source="pricing:card" class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 text-slate-700">{lang==='sv'?'Kontakta oss':'Contact sales'}</a>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
})

export default pricing
