(function () {
  try {
    const html = document.documentElement;

    // Read stored preference (cookie first, then localStorage)
    const m = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/);
    const cookieTheme = m ? decodeURIComponent(m[1]) : null;
    const lsTheme = localStorage.getItem('theme');
    const stored = cookieTheme || lsTheme;

    // DEFAULT = 'light' (not 'system')
    let theme = stored || 'light';

    // Normalize & persist
    if (theme !== 'light' && theme !== 'dark') theme = 'light';
    if (cookieTheme !== theme) {
      document.cookie = `theme=${encodeURIComponent(theme)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
    if (lsTheme !== theme) {
      localStorage.setItem('theme', theme);
    }

    // Apply to <html>
    html.setAttribute('data-theme', theme);
    html.classList.toggle('dark', theme === 'dark');

    // Optional: tell the UA our intent for form controls, scrollbars, etc.
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'color-scheme');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme === 'dark' ? 'dark light' : 'light');
  } catch (_) {}
})();

// App bootstrap after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // =============== Helper: Toast =================
  function showToast(msg, kind){
    try{
      var t = document.createElement('div');
      t.textContent = msg;
      t.className = 'fixed top-4 right-4 z-[80] px-4 py-2 rounded bg-neutral-900/90 border border-neutral-700 shadow text-sm ' + (kind==='error'?'text-red-300':'text-neutral-100');
      document.body.appendChild(t);
      setTimeout(function(){ try{ t.remove(); }catch(_){} }, 3500);
    }catch(_){ alert(msg); }
  }

  // =============== Auth header controls ==========
  function ensureHeaderArea(){
    let host = document.querySelector('[data-auth-host]');
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('data-auth-host','1');
      host.className = 'fixed top-4 left-4 z-[62] flex items-center gap-3';
      document.body.appendChild(host);
    }
    return host;
  }
  function mountLogout(){
    const host = ensureHeaderArea();
    if (host.querySelector('#logout-form')) return;
    const f = document.createElement('form');
    f.method = 'POST'; f.action = '/api/auth/logout'; f.id = 'logout-form'; f.className = 'inline';
    const btn = document.createElement('button'); btn.type = 'submit'; btn.textContent = 'Logga ut';
    btn.className = 'px-3 py-1 rounded border border-neutral-700 text-neutral-300 hover:text-neutral-100';
    f.appendChild(btn);
    host.appendChild(f);
    f.addEventListener('submit', function(e){
      e.preventDefault();
      try{
        const csrf = (document.cookie.match(/(?:^|; )csrf=([^;]+)/)||[])[1] || '';
        fetch('/api/auth/logout', { method:'POST', headers: { 'x-csrf-token': csrf } })
          .then(()=> location.reload()).catch(()=> location.reload());
      }catch(_){ location.reload(); }
    });
  }

  fetch('/api/me').then(r=>r.json()).then(j=>{
    const authed = j && j.ok && j.user;
    document.querySelectorAll('[data-authed="in"]').forEach(el=>{ el.style.display = authed ? '' : 'none'; });
    document.querySelectorAll('[data-authed="out"]').forEach(el=>{ el.style.display = authed ? 'none' : ''; });
    if (authed) {
      try {
        const host = ensureHeaderArea();
        const cur = host.querySelector('[data-avatar]');
        if (!cur) {
          const a = document.createElement('div');
          a.setAttribute('data-avatar','1');
          const name = (j.user.email || '').trim();
          const init = name ? name[0].toUpperCase() : 'U';
          a.textContent = init;
          a.className = 'w-8 h-8 rounded-full bg-[var(--gold)] text-black grid place-items-center font-semibold';
          host.insertBefore(a, host.firstChild);
        }
      } catch(_) {}
      mountLogout();
    }
  }).catch(()=>{});

  // =============== PDF UX helpers ================
  document.addEventListener('click', function(e){
    const target = e.target instanceof Element ? e.target : null;
    const btn = target && target.closest ? target.closest('[data-pdf-trigger]') : null;
    if (btn) showToast('Export started…', 'info');
  }, { capture: true });
  try {
    var url = new URL(location.href);
    if (url.searchParams.get('pdf_fallback') === '1') {
      showToast('PDF export failed; showing HTML instead.', 'error');
      url.searchParams.delete('pdf_fallback');
      history.replaceState({}, '', url.toString());
    }
  } catch(_) {}

  // Header scroll shadow helper
  (function(){
    try{
      var h = document.getElementById('siteHeader');
      if(!h) return;
      var apply = function(){ h.classList.toggle('scrolled', (window.scrollY||window.pageYOffset||0) > 2); };
      apply();
      window.addEventListener('scroll', apply, { passive: true });
    }catch(_){}
  })();

  // =============== A/B Variant ===================
  function getCookie(name){
    try { return (document.cookie.match(new RegExp('(?:^|; )'+name+'=([^;]+)'))||[])[1]||'' } catch(_) { return '' }
  }
  function setCookie(name, value, days){
    try { var max=days?'; Max-Age='+(days*24*60*60):''; document.cookie = name+'='+value+'; Path=/'+max+'; SameSite=Lax'; } catch(_) {}
  }

  // --- theme toggle helpers (append) ---
  (function(){
    const html = document.documentElement;
    function readCookie(name){ try { return (document.cookie.match(new RegExp('(?:^|; )'+name+'=([^;]+)'))||[])[1]||'' } catch(_) { return '' } }
    function setCookie(name, value, days){ try { var d=new Date(); d.setTime(d.getTime()+days*864e5); document.cookie = name+'='+encodeURIComponent(value)+'; expires='+d.toUTCString()+'; path=/; SameSite=Lax'; } catch(_) {} }
    function apply(theme){
      html.setAttribute('data-theme', theme);
      html.classList.toggle('dark', theme === 'dark');
      const isDark = theme === 'dark';
      document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.setAttribute('aria-pressed', String(isDark)));
      let meta = document.querySelector('meta[name="color-scheme"]');
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','color-scheme'); document.head.appendChild(meta); }
      meta.setAttribute('content', isDark ? 'dark light' : 'light');
    }
    function persist(theme){ try { localStorage.setItem('theme', theme); setCookie('theme', theme, 365); } catch(_) {} }
    window.Theme = {
      set(theme){ if (theme !== 'light' && theme !== 'dark') theme = 'light'; persist(theme); apply(theme) },
      toggle(){ const next = (html.getAttribute('data-theme') === 'dark') ? 'light' : 'dark'; persist(next); apply(next) }
    };
    // ---- Theme toggle: capture + bubble + pointer + keyboard ----
    (function(){
      if (!window.Theme || typeof window.Theme.toggle !== 'function') return;

      function activate(btn, e){
        if (!btn) return;
        if (btn.tagName === 'A') e && e.preventDefault();
        if (btn.tagName === 'BUTTON' && !btn.getAttribute('type')) btn.setAttribute('type','button');
        window.Theme.toggle();
      }

      function findToggle(target){
        return target && target.closest ? target.closest('[data-theme-toggle]') : null;
      }

      // Mouse/touch/pointer (capture first, then bubble as fallback)
      const onClick = (e) => activate(findToggle(e.target), e);
      document.addEventListener('click', onClick, true);
      document.addEventListener('click', onClick, false);

      // Pointerup helps on some mobiles where click is prevented/stopped
      document.addEventListener('pointerup', (e) => activate(findToggle(e.target), e), true);

      // Keyboard a11y: Space/Enter
      document.addEventListener('keydown', (e) => {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        const btn = findToggle(e.target);
        if (!btn) return;
        e.preventDefault();
        activate(btn, e);
      }, true);

      // Keep aria-pressed in sync
      function syncPressed(){
        const isDark = document.documentElement.classList.contains('dark');
        document.querySelectorAll('[data-theme-toggle]').forEach(el =>
          el.setAttribute('aria-pressed', isDark ? 'true' : 'false')
        );
      }
      syncPressed();
      const _set = window.Theme.set;
      window.Theme.set = function(mode){ const r=_set(mode); try{ syncPressed(); }catch(_){} return r; };
    })();
  })();
  function initVariant(){
    try{
      var url = new URL(location.href);
      var vq = (url.searchParams.get('v') || url.searchParams.get('variant') || '').toUpperCase();
      var vc = (getCookie('variant')||'').toUpperCase();
      var v = (vq==='A' || vq==='B') ? vq : (vc==='A' || vc==='B' ? vc : (Math.random()<0.5?'A':'B'));
      setCookie('variant', v, 30);
      try { window.__VARIANT__ = v; document.documentElement.setAttribute('data-variant', v); } catch(_) {}
      return v;
    }catch(_){ return 'A' }
  }
  var __V = window.__VARIANT__ || initVariant();

  // =============== Analytics capture =============
  const clickHandler = (e) => {
    try {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      const withEv = target.closest ? target.closest('[data-ev]') : null;
      if (withEv) {
        const evName = withEv.getAttribute('data-ev') || '';
        if (evName) {
          const payloadEvt = {
            event: evName,
            role: 'consensus',
            label: window.__VARIANT__ || getCookie('exp_variant') || null,
            path: location.pathname,
            ts: Date.now()
          };
          fetch('/api/analytics/council', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payloadEvt) }).catch(()=>{});
        }
      }
      const a = target.closest ? target.closest('[data-cta]') : null;
      if (!a) return;
      var src = a.getAttribute('data-cta-source') || '';
      const payload = {
        cta: a.getAttribute('data-cta'),
        source: src + (__V ? ' | v:'+__V : ''),
        href: a.getAttribute('href') || '',
        ts: Date.now()
      };
      fetch('/api/analytics/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(()=>{});
    } catch(_) {}
  };
  addEventListener('click', clickHandler, { capture: true, passive: true });

  // =============== Hamburger / Mobile menu (legacy, disabled when overlay exists) =======
  // If the new overlay menu is present, skip legacy toggle logic to avoid conflicts
  if (!document.getElementById('site-menu-overlay')) {
    function ensureHidden(el, hidden){ if (!el) return; el.classList.toggle('hidden', hidden) }
    const toggles = Array.from(document.querySelectorAll('[data-menu-toggle]'))
    // NOTE: Do NOT auto-bind every button[aria-controls][aria-expanded] to avoid conflicts
    // If you need this behavior elsewhere, add data-menu-toggle to that button explicitly
    if (toggles.length) {
      const closeAll = () => {
        toggles.forEach((btn) => {
          const id = btn.getAttribute('aria-controls')
          const target = id ? document.getElementById(id) : null
          if (!target) return
          btn.setAttribute('aria-expanded', 'false')
          ensureHidden(target, true)
        })
      }
      toggles.forEach((btn) => {
        const id = btn.getAttribute('aria-controls')
        const target = id ? document.getElementById(id) : null
        if (!target) return
        const initialOpen = btn.getAttribute('aria-expanded') === 'true'
        btn.setAttribute('aria-expanded', String(!!initialOpen))
        ensureHidden(target, !initialOpen)
        btn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          const open = btn.getAttribute('aria-expanded') === 'true'
          toggles.forEach((other) => {
            if (other === btn) return
            const oid = other.getAttribute('aria-controls')
            const ot = oid ? document.getElementById(oid) : null
            if (!ot) return
            other.setAttribute('aria-expanded', 'false')
            ensureHidden(ot, true)
          })
          btn.setAttribute('aria-expanded', String(!open))
          ensureHidden(target, open)
        })
      })
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll()
      })
      document.addEventListener('click', (e) => {
        const clickedToggle = toggles.some((btn) => btn.contains(e.target))
        if (clickedToggle) return
        const inAnyMenu = toggles.some((btn) => {
          const id = btn.getAttribute('aria-controls')
          const target = id ? document.getElementById(id) : null
          return target ? target.contains(e.target) : false
        })
        if (!inAnyMenu) closeAll()
      })
    }
  }
});
