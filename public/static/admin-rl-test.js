(function(){
  const out = document.getElementById('rlOut');
  const btn = document.getElementById('rlTest');
  if (!btn || !out) return;
  btn.addEventListener('click', async () => {
    out.textContent = 'Running...';
    const body = JSON.stringify({
      question: 'rl ui test',
      lineup: { roles: [{ role_key: 'STRATEGIST', weight: 1, position: 0 }] }
    });
    const headers = { 'Content-Type': 'application/json' };
    const url = '/api/council/consult';
    const codes = [];
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch(url, { method: 'POST', headers, body });
        const ra = r.headers.get('Retry-After');
        codes.push(r.status + (ra ? ` (Retry-After:${ra})` : ''));
      } catch (e) {
        codes.push('ERR');
      }
    }
    out.textContent = codes.join('\n');
  });
})();
