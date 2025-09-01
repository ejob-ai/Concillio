import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'

const ui = new Hono()

ui.use('*', jsxRenderer())

ui.get('/admin', (c) => {
  return c.html(`<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Concillio Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
</head>
<body class="bg-neutral-950 text-neutral-100">
  <div class="max-w-4xl mx-auto p-6 space-y-10">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Concillio Admin</h1>
      <a href="/admin" class="text-sm text-neutral-400 hover:text-neutral-200">Refresh</a>
    </header>

    <section class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-5">
      <h2 class="text-lg font-semibold mb-3">Prompt JSON Schema</h2>
      <div class="mb-3">
        <label class="block text-xs text-neutral-400 mb-1">X-Admin-Token (optional)</label>
        <input id="adminToken" class="bg-neutral-900 border border-neutral-700 rounded p-2 w-full" placeholder="paste token if required" />
      </div>
      <div class="grid md:grid-cols-3 gap-3 mb-3">
        <input id="pack" class="bg-neutral-900 border border-neutral-700 rounded p-2" placeholder="pack_slug (e.g. concillio-core)" />
        <input id="version" class="bg-neutral-900 border border-neutral-700 rounded p-2" placeholder="version (e.g. 1.0.0)" />
        <input id="locale" class="bg-neutral-900 border border-neutral-700 rounded p-2" placeholder="locale (e.g. sv-SE)" />
      </div>
      <textarea id="schema" class="w-full h-48 bg-neutral-900 border border-neutral-700 rounded p-2 font-mono text-sm" placeholder='{"roles": {"CONSENSUS": {"type": "object", "required": ["summary"], "properties": {"summary": {"type": "string"}}}}}'></textarea>
      <div class="mt-3 flex gap-3">
        <button id="btn-validate" class="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500">Validate (Ajv)</button>
        <button id="btn-save" class="px-4 py-2 rounded bg-[#b3a079] text-black hover:brightness-110">Save to DB</button>
      </div>
      <pre id="schema-result" class="mt-3 text-sm text-neutral-300 whitespace-pre-wrap"></pre>
    </section>

    <section class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-5">
      <h2 class="text-lg font-semibold mb-3">Try Dry-Run</h2>
      <div class="grid md:grid-cols-4 gap-3 mb-3">
        <input id="pack2" class="bg-neutral-900 border border-neutral-700 rounded p-2" placeholder="pack_slug" />
        <input id="version2" class="bg-neutral-900 border border-neutral-700 rounded p-2" placeholder="version" />
        <input id="locale2" class="bg-neutral-900 border border-neutral-700 rounded p-2" placeholder="locale" />
        <input id="role2" class="bg-neutral-900 border border-neutral-700 rounded p-2" placeholder="role (e.g. CONSENSUS)" />
      </div>
      <textarea id="data2" class="w-full h-40 bg-neutral-900 border border-neutral-700 rounded p-2 font-mono text-sm" placeholder='{"summary": "...", "risks": ["..."]}'></textarea>
      <div class="mt-3">
        <button id="btn-dryrun" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">Validate Dry-Run</button>
      </div>
      <pre id="dryrun-result" class="mt-3 text-sm text-neutral-300 whitespace-pre-wrap"></pre>
    </section>
  </div>

  <script>
    async function validateSchema() {
      const schemaTxt = document.getElementById('schema').value
      try { JSON.parse(schemaTxt) } catch (e) { show('schema-result', 'Invalid JSON: ' + e.message); return }
      show('schema-result', 'Looks like valid JSON. Ajv compile happens server-side on dry-run.\\nTip: Use Try Dry-Run below to verify per role.')
    }

    async function saveSchema() {
      const pack = document.getElementById('pack').value.trim()
      const version = document.getElementById('version').value.trim()
      const locale = document.getElementById('locale').value.trim()
      const schemaTxt = document.getElementById('schema').value
      if (!pack || !version || !locale) { show('schema-result', 'Missing pack/version/locale'); return }
      try { JSON.parse(schemaTxt) } catch (e) { show('schema-result', 'Invalid JSON: ' + e.message); return }
      const token = document.getElementById('adminToken').value.trim()
      const res = await fetch('/admin/prompts/schema', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Admin-Token': token } : {}) }, body: JSON.stringify({ pack_slug: pack, version, locale, json_schema: schemaTxt }) })
      const data = await res.json()
      show('schema-result', JSON.stringify(data, null, 2))
    }

    async function dryRun() {
      const pack = document.getElementById('pack2').value.trim()
      const version = document.getElementById('version2').value.trim()
      const locale = document.getElementById('locale2').value.trim()
      const role = document.getElementById('role2').value.trim()
      const dataTxt = document.getElementById('data2').value
      let payload
      try { payload = JSON.parse(dataTxt) } catch (e) { show('dryrun-result', 'Invalid JSON: ' + e.message); return }
      const token = document.getElementById('adminToken').value.trim()
      const res = await fetch('/admin/prompts/dry-run', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Admin-Token': token } : {}) }, body: JSON.stringify({ pack_slug: pack, version, locale, role, data: payload }) })
      const data = await res.json()
      show('dryrun-result', JSON.stringify(data, null, 2))
    }

    function show(id, msg) { document.getElementById(id).textContent = msg }
    document.getElementById('btn-validate').addEventListener('click', validateSchema)
    document.getElementById('btn-save').addEventListener('click', saveSchema)
    document.getElementById('btn-dryrun').addEventListener('click', dryRun)
  </script>
</body>
</html>`)
})

export default ui
