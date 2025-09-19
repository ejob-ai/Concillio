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

  // =============== UTM capture & forwarding =====
  (function(){
    try {
      var url = new URL(location.href);
      var isPricing = url.pathname.startsWith('/pricing');
      var utmKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
      var hasUtm = utmKeys.some(function(k){ return !!url.searchParams.get(k); });
      var STORAGE_KEY = 'utm_payload';
      var COOKIE_NAME = 'utm_payload';

      function storeAttribution(obj){
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch(_) {}
        try { var v = encodeURIComponent(JSON.stringify(obj)); document.cookie = COOKIE_NAME+'='+v+'; Path=/; Max-Age='+(7*24*60*60)+'; SameSite=Lax'; } catch(_) {}
      }
      function readAttribution(){
        try {
          var ls = localStorage.getItem(STORAGE_KEY);
          if (ls) return JSON.parse(ls);
        } catch(_) {}
        try {
          var m = document.cookie.match(/(?:^|;\s*)utm_payload=([^;]+)/);
          if (m && m[1]) return JSON.parse(decodeURIComponent(m[1]));
        } catch(_) {}
        return null;
      }

      if (isPricing && hasUtm) {
        var payload = { ts: Date.now() };
        utmKeys.forEach(function(k){ var v = url.searchParams.get(k); if (v) payload[k]=v; });
        storeAttribution(payload);
      }

      function appendUtmToHref(a){
        if (!a || !a.getAttribute) return;
        var href = a.getAttribute('href') || '';
        if (!href) return;
        var lower = href.toLowerCase();
        if (lower.indexOf('/signup') === -1 && lower.indexOf('/checkout') === -1) return;
        var attr = readAttribution();
        if (!attr) return;
        try {
          var u = new URL(href, location.origin);
          utmKeys.forEach(function(k){ if (attr[k]) u.searchParams.set(k, attr[k]); });
          a.setAttribute('href', u.toString());
        } catch(_) {}
      }

      // Initial pass
      document.querySelectorAll('a[href]').forEach(appendUtmToHref);
      // Dynamic clicks
      document.addEventListener('click', function(e){
        var a = e.target instanceof Element ? e.target.closest('a[href]') : null;
        if (a) appendUtmToHref(a);
      }, true);

      // Log attribution when visiting checkout
      if (url.pathname.startsWith('/checkout')){
        var attr = readAttribution();
        if (attr){
          try {
            fetch('/api/analytics/council', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'utm_attribution', href: location.href, utm: attr, ts: Date.now() }) });
          } catch(_) {}
        }
      }
    } catch(_) {}
  })();

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

  // Header scroll shadow helper removed in favor of unified .siteHeader.is-scrolled in scroll.js
  // See public/static/scroll.js for the single source of truth.

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

    // Toast helper for theme announcements (if ConcillioToast present)
    function announceThemeToast(theme){
      try{
        if (!window.ConcillioToast) return;
        const isDark = theme === 'dark';
        const sv = document.documentElement.lang === 'sv';
        const msg = sv ? (isDark ? 'Mörkt tema aktiverat' : 'Ljust tema aktiverat') : (isDark ? 'Dark theme enabled' : 'Light theme enabled');
        window.ConcillioToast.success(msg, { duration: 2800 });
      }catch(_){ }
    }
    var __didBootTheme = true; // prevent toast on initial bootstrap

    window.Theme = {
      set(theme){ if (theme !== 'light' && theme !== 'dark') theme = 'light'; persist(theme); apply(theme); if (!__didBootTheme) announceThemeToast(theme); },
      toggle(){ const next = (html.getAttribute('data-theme') === 'dark') ? 'light' : 'dark'; persist(next); apply(next); if (!__didBootTheme) announceThemeToast(next); }
    };

    // turn off bootstrap-suppression after first ready tick
    setTimeout(function(){ __didBootTheme = false; }, 0);
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

  // Persist last selected plan from pricing → checkout to allow frictionless flow when ?plan is missing
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[data-plan]') : null;
    if (!a) return;
    try { sessionStorage.setItem('last_plan', a.getAttribute('data-plan')); } catch {}
  }, { capture: true });

  // =============== Billing: start checkout from /checkout button =============
  document.addEventListener('click', async (e) => {
    try {
      const btn = e.target && e.target.closest ? e.target.closest('[data-checkout-plan]') : null;
      if (!btn) return;
      e.preventDefault();
      const plan = btn.getAttribute('data-checkout-plan') || 'starter';
      let utm = null;
      try { utm = JSON.parse(localStorage.getItem('utm_payload')||'null'); } catch {}
      const r = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan, utm })
      });
      const j = await r.json().catch(()=>({}));
      if (j && j.ok && j.url) { location.href = j.url; return; }
      (window.ConcillioToast && window.ConcillioToast.error) ? window.ConcillioToast.error('Kunde inte starta betalning') : alert('Kunde inte starta betalning');
    } catch (_) {}
  }, { capture: true });

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

  // Defensive: force hard navigation to /pricing in case any handler prevents default
  document.addEventListener('click', function(e){
    try {
      var a = e.target && e.target.closest ? e.target.closest('a[href="/pricing"]') : null;
      if (!a) return;
      e.preventDefault();
      if (typeof window.__menuHardReset__ === 'function') window.__menuHardReset__('nav-pricing');
      location.assign('/pricing');
    } catch(_) {}
  }, true);


});
