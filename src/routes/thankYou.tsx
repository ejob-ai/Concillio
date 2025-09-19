// src/routes/thankYou.tsx
import { Hono } from 'hono'
import { jsxRenderer } from '../renderer'

const router = new Hono()

router.get('/thank-you', jsxRenderer(({ c }) => {
  const plan = c.req.query('plan') || 'unknown'

  return (
    <main id="mainContent" class="thank-you-page">
      <section class="max-w-2xl mx-auto py-16 px-6 text-center">
        <h1 class="text-3xl font-bold mb-4">Thank you!</h1>
        <p class="text-lg mb-6">
          Your subscription <span class="font-semibold">{plan}</span> is now active.
        </p>
        <a href="/" class="btn-primary">Go back home</a>
      </section>

      {/* Analytics inline */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            try {
              const utm = JSON.parse(localStorage.getItem("utm_payload") || "{}");
              fetch("/api/analytics/council", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event: "checkout_success",
                  plan: ${JSON.stringify(plan)},
                  utm
                })
              });
            } catch(e) { console.warn("analytics failed", e); }
          })();
        `,
        }}
      />
    </main>
  )
}))

export default router
