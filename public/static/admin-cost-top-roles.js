(async function () {
  const host = location.origin
  const box = document.getElementById('top-roles-box')
  if (!box) return
  const res = await fetch(`${host}/admin/analytics.json?limit=50`, { headers: { Accept: 'application/json' } })
  if (!res.ok) { box.textContent = `Analytics fetch failed (${res.status})`; return }
  const { rows } = await res.json()
  const sums = {}
  for (const r of rows) {
    const key = (r.role || 'UNKNOWN').toUpperCase()
    sums[key] = (sums[key] || 0) + (Number(r.cost_usd || 0))
  }
  const ranked = Object.entries(sums).sort((a,b)=>b[1]-a[1]).slice(0,8)
  const table = document.createElement('table')
  table.className = 'w-full text-sm'
  table.innerHTML = `
    <thead><tr><th class="text-left">Roll</th><th class="text-right">Kostnad (USD)</th></tr></thead>
    <tbody>${ranked.map(([role,sum])=>`<tr><td>${role}</td><td class="text-right">${sum.toFixed(2)}</td></tr>`).join('')}</tbody>
  `
  box.innerHTML = `<h3 class="font-semibold mb-2">Top roles by cost (last 50)</h3>`
  box.appendChild(table)
})()
