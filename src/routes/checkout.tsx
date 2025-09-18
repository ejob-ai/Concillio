import { Hono } from 'hono'
import { PLANS, type PlanKey } from '../utils/plans'

const checkout = new Hono()

checkout.get('/checkout', (c) => {
  const url = new URL(c.req.url)
  const planParam = (url.searchParams.get('plan') || '').toLowerCase() as PlanKey
  const plan: PlanKey = (planParam === 'starter' || planParam === 'pro' || planParam === 'free') ? planParam : 'starter'

  const title = 'Checkout – Concillio'
  const desc = 'Secure checkout for Concillio plans.'
  c.set('head', { title, description: desc })

  const P = PLANS[plan]

  return c.render(
    <main className="container mx-auto px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-['Playfair_Display'] text-3xl text-neutral-100">Checkout</h1>
        <p className="text-neutral-400 mt-1">Plan: <strong className="text-neutral-200 uppercase">{plan}</strong></p>

        <div className="mt-6 border border-neutral-800 rounded-xl p-5 bg-neutral-950/50">
          <div className="text-neutral-300 text-sm">What’s included:</div>
          <ul className="mt-2 text-neutral-100 text-sm list-disc list-inside">
            <li>Councils/month: {P.councilsPerMonth}</li>
            <li>Attachments: {P.attachments.maxFiles} files up to {P.attachments.maxMB} MB</li>
            <li>Exports: {P.exports.csv ? 'CSV' : ''}{P.exports.csv && P.exports.pdf ? ' + ' : ''}{P.exports.pdf ? 'PDF' : (!P.exports.csv ? '—' : '')}</li>
            <li>AI Reports: {P.aiReports ? 'Yes' : 'No'}</li>
            <li>File evaluation: {P.fileEval ? 'Yes' : 'No'}</li>
            <li>Integrations: {P.integrations.length ? P.integrations.join(', ') : '—'}</li>
          </ul>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <a className="btn btn-primary" href={plan === 'free' ? '/signup?plan=free' : '#'} data-cta={`primary-checkout-${plan}`} data-cta-source="checkout">
            {plan === 'free' ? 'Continue to signup' : 'Proceed to payment (coming soon)'}
          </a>
          <a className="btn" href="/pricing" data-cta="secondary-checkout-back" data-cta-source="checkout">Back to pricing</a>
        </div>

        <p className="text-neutral-400 text-sm mt-3">Note: This is a placeholder checkout page. Payment integration will be connected here.</p>
      </div>
      {/* Step 2: If ?plan is missing, add it from sessionStorage.last_plan (default 'starter') */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          try {
            var u = new URL(location.href);
            if (!u.searchParams.get('plan')) {
              var p = 'starter';
              try { p = sessionStorage.getItem('last_plan') || 'starter'; } catch(_){ }
              u.searchParams.set('plan', p);
              location.replace(u.toString());
            }
          } catch(_) {}
        })();
      ` }} />
    </main>
  )
})

export default checkout
