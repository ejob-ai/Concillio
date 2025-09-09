import { Hono } from 'hono'

export const adminHealth = new Hono()

function isAllowed(c: any){
  if (String((c.env as any)?.DEV||'').toLowerCase()==='true') return true
  const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || ''
  const allow = String((c.env as any)?.ADMIN_IP_ALLOWLIST || '').split(',').map((s:string)=>s.trim()).filter(Boolean)
  return allow.length ? allow.includes(ip) : false
}

adminHealth.get('/admin/health', async (c) => {
  if (!isAllowed(c)) return c.text('Not allowed', 403)
  const html = `<!doctype html><html><head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Admin Health</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head><body class="bg-neutral-950 text-neutral-100">
    <section class="max-w-3xl mx-auto p-6 space-y-6">
      <h1 class="text-2xl font-semibold">Admin Health</h1>
      <div class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-5 space-y-3">
        <h2 class="text-lg">Rate-limit tester (/api/council/consult)</h2>
        <div class="text-sm text-neutral-300">Sends rapid POSTs (mock=1) to trigger 2/sec and 5/10min RL. Shows 429s and Retry-After.</div>
        <div class="flex items-center gap-3 flex-wrap">
          <button id="start" class="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500">Start burst</button>
          <button id="stop" class="px-4 py-2 rounded bg-red-600 hover:bg-red-500">Stop</button>
          <label class="text-sm text-neutral-400">Interval ms <input id="int" type="number" value="200" class="ml-2 w-24 bg-neutral-900 border border-neutral-700 rounded p-1"/></label>
        </div>
        <pre id="log" class="mt-3 text-xs bg-neutral-950/70 border border-neutral-800 rounded p-3 h-64 overflow-auto"></pre>
      </div>
    </section>
    <script src="/static/admin-rl-test.js" defer></script>
  </body></html>`
  return c.html(html)
})

export default adminHealth
