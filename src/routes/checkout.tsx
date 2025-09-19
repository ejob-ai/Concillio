import { Hono } from 'hono';
import type { Context } from 'hono';
import { jsxRenderer } from '../renderer';
import { PLANS } from '../utils/plans';

const fmtUSD = (n: number) => `$${n.toFixed(2)}`;

const router = new Hono();

router.get('/checkout', jsxRenderer(({ c }: { c: Context }) => {
  const url = new URL(c.req.url);
  const planKey = (url.searchParams.get('plan') || 'starter') as keyof typeof PLANS;
  const plan = PLANS[planKey] ?? PLANS.starter;

  c.set('head', {
    title: 'Checkout – Concillio',
    description: 'Välj din plan och kom igång på minuter.',
  });

  return (
    <main class="container mx-auto py-8">
      <h1 class="page-title mb-2">Checkout</h1>
      <p class="subtle mb-1">Plan: <strong>{plan.label}</strong></p>
      {'priceUSD' in plan ? (
        <p class="subtle mb-6">Price: <strong>{fmtUSD((plan as any).priceUSD)}</strong> / mo</p>
      ) : <p class="subtle mb-6">Price: <strong>$0</strong> / mo</p>}

      <section class="grid gap-4 md:grid-cols-2">
        <article class="card p-6">
          <h2 class="h3 mb-3">What’s included</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>Up to {plan.councils} councils</li>
            <li>Exports: {plan.exports.pdf ? 'PDF & CSV' : (plan.exports.csv ? 'CSV' : '—')}</li>
            <li>Attachments: {plan.attachments.maxFiles} files / {plan.attachments.maxMB} MB</li>
            <li>AI reports: {plan.aiReports ? 'Yes' : 'No'}</li>
            <li>File evaluation: {plan.fileEval ? 'Yes' : 'No'}</li>
            <li>Integrations: {plan.integrations.length ? plan.integrations.join(', ') : '—'}</li>
          </ul>
        </article>

        <article class="card p-6">
          <h2 class="h3 mb-3">Payment</h2>
          {plan.key === 'free' ? (
            <a class="btn btn-primary" href="/signup?plan=free">Continue to signup</a>
          ) : (
            <button class="btn btn-primary" data-checkout-plan={plan.key}>Proceed to payment</button>
          )}
          <p class="muted mt-3"><a href="/pricing">← Back to pricing</a></p>
        </article>
      </section>

      {/* Auto-prefill plan if missing */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function(){
            try { navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event:'checkout_loaded', ts: Date.now(), path: location.pathname })); } catch(_){ try{ fetch('/api/analytics/council',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'checkout_loaded', ts: Date.now(), path: location.pathname }) }); }catch(__){} }
            var u=new URL(location.href);
            if(!u.searchParams.get('plan')){
              var last = sessionStorage.getItem('last_plan') || 'starter';
              u.searchParams.set('plan', last);
              location.replace(u.toString());
            }
          })();
        `
      }} />
    </main>
  );
}));

export default router;
