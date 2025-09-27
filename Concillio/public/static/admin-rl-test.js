(function(){
  const start = document.getElementById('start')
  const stop = document.getElementById('stop')
  const out = document.getElementById('log')
  const int = document.getElementById('int')
  let timer = null
  function log(s){ out.textContent += s + "\n"; out.scrollTop = out.scrollHeight }
  async function fire(){
    const url = new URL('/api/council/consult', location.origin)
    url.searchParams.set('lang','en')
    const body = { question: 'Health test', context: 'RL tester' , mock: 1 }
    const r = await fetch(url.toString(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const ra = r.headers.get('Retry-After')
    log(`${new Date().toISOString()} -> ${r.status}${ra?` (Retry-After=${ra})`:''}`)
  }
  function startLoop(){
    if (timer) return
    const ms = Math.max(10, Number(int.value || 200))
    timer = setInterval(fire, ms)
    log('Started @ '+ms+'ms interval')
  }
  function stopLoop(){ if (timer) { clearInterval(timer); timer = null; log('Stopped') } }
  start?.addEventListener('click', startLoop)
  stop?.addEventListener('click', stopLoop)
})();