(function(){
  function show(id, msg){ var el=document.getElementById(id); if (el) el.textContent = msg }
  async function validateSchema(){
    const el = document.getElementById('schema'); if (!el) return;
    const schemaTxt = el.value
    try { JSON.parse(schemaTxt) } catch (e) { show('schema-result', 'Invalid JSON: ' + e.message); return }
    show('schema-result', 'Looks like valid JSON. Ajv compile happens server-side on dry-run.\nTip: Use Try Dry-Run below to verify per role.')
  }
  async function saveSchema(){
    const pack = (document.getElementById('pack')||{}).value?.trim?.() || ''
    const version = (document.getElementById('version')||{}).value?.trim?.() || ''
    const locale = (document.getElementById('locale')||{}).value?.trim?.() || ''
    const schemaTxt = (document.getElementById('schema')||{}).value || ''
    if (!pack || !version || !locale) { show('schema-result', 'Missing pack/version/locale'); return }
    try { JSON.parse(schemaTxt) } catch (e) { show('schema-result', 'Invalid JSON: ' + e.message); return }
    const token = (document.getElementById('adminToken')||{}).value?.trim?.() || ''
    const res = await fetch('/admin/prompts/schema', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Admin-Token': token } : {}) }, body: JSON.stringify({ pack_slug: pack, version, locale, json_schema: schemaTxt }) })
    const data = await res.json()
    show('schema-result', JSON.stringify(data, null, 2))
  }
  async function dryRun(){
    const pack = (document.getElementById('pack2')||{}).value?.trim?.() || ''
    const version = (document.getElementById('version2')||{}).value?.trim?.() || ''
    const locale = (document.getElementById('locale2')||{}).value?.trim?.() || ''
    const role = (document.getElementById('role2')||{}).value?.trim?.() || ''
    const dataTxt = (document.getElementById('data2')||{}).value || ''
    let payload
    try { payload = JSON.parse(dataTxt) } catch (e) { show('dryrun-result', 'Invalid JSON: ' + e.message); return }
    const token = (document.getElementById('adminToken')||{}).value?.trim?.() || ''
    const res = await fetch('/admin/prompts/dry-run', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Admin-Token': token } : {}) }, body: JSON.stringify({ pack_slug: pack, version, locale, role, data: payload }) })
    const data = await res.json()
    show('dryrun-result', JSON.stringify(data, null, 2))
  }
  document.addEventListener('DOMContentLoaded', function(){
    var v=document.getElementById('btn-validate'); if (v) v.addEventListener('click', validateSchema)
    var s=document.getElementById('btn-save'); if (s) s.addEventListener('click', saveSchema)
    var d=document.getElementById('btn-dryrun'); if (d) d.addEventListener('click', dryRun)
  })
})();