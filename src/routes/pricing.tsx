import { Hono } from 'hono';
import type { Context } from 'hono';
import { jsxRenderer } from '../renderer';
import { PLANS } from '../utils/plans';

const fmtUSD = (n: number) => `$${n.toFixed(2)}`;

const router = new Hono();

router.get('/pricing', jsxRenderer(({ c }: { c: Context }) => {
  c.set('head', {
    title: 'Pricing – Concillio',
    description: 'Choose a plan and get started in minutes.',
  });

  return (
    <main class="pricing-page">
      <section class="pricing-hero container mx-auto">
        <h1 class="page-title">Pricing</h1>
        <p class="subtle">Freemium, Starter, Pro — upgrade anytime. All prices in USD.</p>
      </section>

      <section class="pricing-grid container mx-auto">
        {/* Freemium */}
        <article class="pricing-card">
          <header class="plan-head">
            <h2 class="plan-title">Freemium</h2>
            <div class="plan-price"><span class="price">$0</span> <span class="per">/ mo</span></div>
            <p class="plan-desc">Get started — 1 council, no attachments.</p>
          </header>
          <ul class="plan-features">
            <li>Up to {PLANS.free.councils} council</li>
            <li>Export (CSV)</li>
            <li>Basic role presets</li>
          </ul>
          <div class="plan-cta">
            <a class="btn" href="/signup?plan=free" data-cta data-cta-source="pricing" data-plan="free">Start Free</a>
          </div>
        </article>

        {/* Starter */}
        <article class="pricing-card">
          <header class="plan-head">
            <div class="plan-badge">Great for teams</div>
            <h2 class="plan-title">Starter</h2>
            <div class="plan-price">
              <span class="price">{fmtUSD(PLANS.starter.priceUSD)}</span> <span class="per">/ mo</span>
            </div>
            <p class="plan-desc">For small teams — more councils, PDF export, basic attachments.</p>
          </header>
          <ul class="plan-features">
            <li>Up to {PLANS.starter.councils} councils</li>
            <li>Export to PDF & CSV</li>
            <li>Drive import (basic)</li>
            <li>Attachments up to {PLANS.starter.attachments.maxMB} MB</li>
            <li>Keyword-highlight in documents</li>
          </ul>
          <div class="plan-cta">
            <a class="btn btn-primary" href="/checkout?plan=starter" data-cta data-cta-source="pricing" data-plan="starter">
              Choose Starter
            </a>
          </div>
        </article>

        {/* Pro */}
        <article class="pricing-card is-highlighted">
          <header class="plan-head">
            <div class="plan-badge">Most popular</div>
            <h2 class="plan-title">Pro</h2>
            <div class="plan-price">
              <span class="price">{fmtUSD(PLANS.pro.priceUSD)}</span> <span class="per">/ mo</span>
            </div>
            <p class="plan-desc">Advanced analysis — file evaluation, integrations and reports.</p>
          </header>
          <ul class="plan-features">
            <li>Up to {PLANS.pro.councils} councils</li>
            <li>Custom role templates</li>
            <li>Integrations: Slack + Notion + Drive</li>
            <li>Advanced reports &amp; visualizations</li>
            <li>File evaluation of bids/tenders with scoring</li>
            <li>Multiple attachments per case</li>
          </ul>
          <div class="plan-cta">
            <a class="btn btn-primary" href="/checkout?plan=pro" data-cta data-cta-source="pricing" data-plan="pro">
              Choose Pro
            </a>
          </div>
        </article>

        {/* Legacy (optional to show publicly) */}
        <article class="pricing-card">
          <header class="plan-head">
            <div class="plan-badge">Power users</div>
            <h2 class="plan-title">Legacy</h2>
            <div class="plan-price">
              <span class="price">{fmtUSD(PLANS.legacy.priceUSD)}</span> <span class="per">/ mo</span>
            </div>
            <p class="plan-desc">Higher volumes & advanced workflows.</p>
          </header>
          <ul class="plan-features">
            <li>Up to {PLANS.legacy.councils} councils</li>
            <li>Extended integrations & automations</li>
            <li>Full reports & exports</li>
            <li>Higher attachment volumes</li>
          </ul>
          <div class="plan-cta">
            <a class="btn" href="/checkout?plan=legacy" data-cta data-cta-source="pricing" data-plan="legacy">
              Choose Legacy
            </a>
          </div>
        </article>
      </section>

      {/* Persist last selected plan for later flows */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function(){
            var links = document.querySelectorAll('[data-plan]');
            links.forEach(function(a){
              a.addEventListener('click', function(){
                try{ sessionStorage.setItem('last_plan', a.getAttribute('data-plan') || 'starter'); }catch(e){}
              });
            });
          })();
        `
      }} />
    </main>
  );
}));

export default router;
