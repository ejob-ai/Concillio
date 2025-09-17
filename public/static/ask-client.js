(() => {
  const T = window.ConcillioToast;
  const log = (...a) => console.debug('[ask]', ...a);

  async function loadPresets() {
    const url = '/api/lineups/presets';
    log('fetch', url);
    let res;
    try {
      res = await fetch(url, { credentials: 'same-origin', headers: { 'accept': 'application/json' } });
    } catch (e) {
      log('network error', e);
      T && T.error('Network error', { title: 'Line-ups' });
      return null;
    }
    if (!res.ok) {
      log('bad status', res.status, res.statusText);
      T && T.error(`Server error ${res.status}`, { title: 'Line-ups' });
      return null;
    }
    let data;
    try {
      data = await res.json();
    } catch (e) {
      log('json parse error', e);
      T && T.error('Invalid JSON', { title: 'Line-ups' });
      return null;
    }
    log('presets', data);
    return Array.isArray(data?.presets) ? data.presets : data;
  }

  function renderPresets(listEl, data) {
    if (!Array.isArray(data) || !listEl) return;
    listEl.innerHTML = '';
    for (const p of data) {
      // Tillåt både {id,label} och strängar
      const id = p?.id || String(p);
      const label = p?.label || p?.name || String(p);
      const li = document.createElement('li');
      li.innerHTML = `
        <input class="sr-only" type="radio" name="lineup" id="lineup-${id}" value="${id}">
        <label class="role-chip" for="lineup-${id}" data-role-chip>${label}</label>
      `;
      listEl.appendChild(li);
    }
    // trigga aktiv-states sync om ask.js är laddad
    const first = listEl.querySelector('input[type="radio"]');
    if (first) first.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function init() {
    const listEl = document.querySelector('[data-lineups-list]');
    if (!listEl) { log('no [data-lineups-list] found'); return; }
    listEl.setAttribute('data-loading', 'true');

    const data = await loadPresets();
    listEl.removeAttribute('data-loading');

    if (!data || !data.length) {
      log('no data to render');
      const empty = document.querySelector('[data-lineups-empty]');
      if (empty) empty.hidden = false;
      T && T.warning('No line-ups available');
      return;
    }
    renderPresets(listEl, data);
  }

  window.addEventListener('DOMContentLoaded', init);
})();