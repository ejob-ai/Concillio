(() => {
  if (window.__menuInit) return; window.__menuInit = true;

  // ENV detect
  const IS_PROD = (function(){ try{ const h=location.hostname||''; const p=location.port||''; if (h==='localhost'||h==='127.0.0.1'||h==='0.0.0.0'||(p&&p!=='')) return false; return true; }catch(_){ return true; }})();

  // CONFIG: tune thresholds/delays here
  // - FOCUS_TRAP_DELAY_MS: delay before focusing first element in open menu
  // - CLOSE_ON_HASH_CHANGE: close menu when URL hash changes
  // - USE_LEGACY_IF_PRESENT: dev-only legacy overlay fallback when !IS_PROD (no data-state, no prod hooks)
  const CONFIG = {
    FOCUS_TRAP_DELAY_MS: 0,
    CLOSE_ON_HASH_CHANGE: true,
    USE_LEGACY_IF_PRESENT: !IS_PROD
  };

  const d = document;
  const html = d.documentElement;

  // Elements for legacy overlay pattern (fallback only; dev builds)
  const overlay = d.getElementById('site-menu-overlay'); try{ overlay && overlay.removeAttribute('hidden'); }catch(_){}
  const legacyPanel = d.getElementById('site-menu-panel');
  const panel   = legacyPanel; // only treat a real legacy panel as panel
  const legacyTrigger = d.getElementById('menu-trigger');
  const legacyClose   = d.getElementById('menu-close');

  // Elements for data-menu pattern (dev-only data attributes; no data-state anywhere)
  const dataMenu     = d.getElementById('site-menu') || d.querySelector('[data-menu]') || d.getElementById('site-menu-panel');
  const dataOverlay  = d.getElementById('site-menu-overlay') || d.querySelector('[data-menu-overlay]');
  const dataToggles  = Array.from(d.querySelectorAll('[data-menu-toggle]'));

  const body    = d.body;
  const main    = d.getElementById('mainContent') || d.querySelector('main');

  let lastFocus = null;

  // Defensive: ensure no stuck locks/inert/no-scroll across navigations/hash changes
  function hardResetState(reason){
    try{
      // Reset html/body/menu flags
      html.classList.remove('menu-open');
      body.classList.remove('no-scroll');
      if (main) { try { main.removeAttribute('inert'); } catch(_) {} }
      // Sync ARIA for both patterns
      try{ if (overlay) overlay.setAttribute('aria-hidden','true'); }catch(_){ }
      try{ if (legacyPanel) legacyPanel.setAttribute('aria-hidden','true'); }catch(_){ }
      try{ if (dataMenu) { dataMenu.setAttribute('aria-hidden','true'); dataMenu.setAttribute('inert',''); } }catch(_){ }
      // All toggles collapsed
      try{ dataToggles.forEach(btn => btn.setAttribute('aria-expanded','false')); }catch(_){ }
    }catch(_){ }
  }

  // Utility: first focusable element inside a container
  function firstFocusable(root){
    return root && root.querySelector('[autofocus],button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  }

  // Focus trap for whichever container is open
  function trapFocus(container){
    if (!container) return;
    if (!container.contains(d.activeElement)) {
      const f = firstFocusable(container) || container;
      try { f.focus({ preventScroll: true }); } catch(_) {}
    }
  }

  // ---------- Legacy overlay menu controls ----------
  function legacyIsOpen(){ return overlay && overlay.getAttribute('aria-hidden') === 'false'; }
  function legacySetOpen(open){
    if (!overlay || !panel) return;
    // legacy data-state removed; use aria-hidden only
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    dataToggles.forEach(btn => btn.setAttribute('aria-expanded', String(!!open)));
    if (open){
      lastFocus = d.activeElement;
      body.classList.add('no-scroll');
      if (main) { try { main.setAttribute('inert',''); } catch(_) {} }
      setTimeout(() => trapFocus(panel), CONFIG.FOCUS_TRAP_DELAY_MS);
    } else {
      body.classList.remove('no-scroll');
      if (main) { try { main.removeAttribute('inert'); } catch(_) {} }
      if (lastFocus && typeof lastFocus.focus === 'function') {
        try { lastFocus.focus({ preventScroll: true }); } catch(_){}
      }
    }
  }
  function legacyToggle(){ legacySetOpen(!legacyIsOpen()); }

  // ---------- data-menu pattern controls ----------
  function dataIsOpen(){ return html.classList.contains('menu-open'); }
  function dataSetOpen(open){
    if (!dataMenu) return;
    html.classList.toggle('menu-open', !!open);
    try { dataMenu.setAttribute('aria-hidden', open ? 'false' : 'true'); } catch(_){}
    try { if (open) dataMenu.removeAttribute('inert'); else dataMenu.setAttribute('inert',''); } catch(_){}
    // Ensure overlay aria mirrors state in data-menu pattern
    try { if (dataOverlay) dataOverlay.setAttribute('aria-hidden', open ? 'false' : 'true'); } catch(_){}
    // aria-expanded på alla toggles
    dataToggles.forEach(btn => btn.setAttribute('aria-expanded', String(!!open)));
    if (open){
      lastFocus = d.activeElement;
      body.classList.add('no-scroll');
      if (main) { try { main.setAttribute('inert',''); } catch(_) {} }
      setTimeout(() => trapFocus(dataMenu), CONFIG.FOCUS_TRAP_DELAY_MS);
    } else {
      body.classList.remove('no-scroll');
      if (main) { try { main.removeAttribute('inert'); } catch(_) {} }
      if (lastFocus && typeof lastFocus.focus === 'function') {
        try { lastFocus.focus({ preventScroll: true }); } catch(_){}
      }
    }
  }
  function dataToggle(){ dataSetOpen(!dataIsOpen()); }

  // Public helpers (open/toggle) for external use/symmetry
  function openMobileMenu(){ if (useLegacy) { legacySetOpen(true); } else { dataSetOpen(true); } }
  function toggleMobileMenu(e){
    if (e && e.preventDefault) e.preventDefault();
    // If opening, first hard-reset any potentially stuck state from prior navigations
    if (!html.classList.contains('menu-open')) {
      hardResetState('open');
      return useLegacy ? legacySetOpen(true) : dataSetOpen(true);
    }
    return useLegacy ? legacySetOpen(false) : dataSetOpen(false);
  }
  try { window.openMobileMenu = openMobileMenu; window.toggleMobileMenu = toggleMobileMenu; } catch(_){}

  // Prefer legacy overlay if present (it is visually richer and already styled)
  const useLegacy = CONFIG.USE_LEGACY_IF_PRESENT && !!overlay && !!panel;
  // Dev warning if legacy path triggers (dev-only; no prod hooks)
  try { if (!IS_PROD && useLegacy) console.warn('[menu] Legacy path triggered.'); } catch(_) {}

  // First paint: force closed state and sync aria
  try {
    if (useLegacy) legacySetOpen(false); else if (dataMenu) dataSetOpen(false);
    // Layout pass and ensure header offset observers recalc
    if (overlay) void overlay.offsetHeight; window.dispatchEvent(new Event('resize'));
  } catch(_) {}

  // Bind toggle buttons (supports both #menu-trigger and any [data-menu-toggle])
  const allToggles = new Set([legacyTrigger, ...dataToggles].filter(Boolean));
  // Fix wrong/missing aria-controls on toggles to point at existing panel
  const fallbackPanel = d.getElementById('site-menu') || d.getElementById('site-menu-panel') || dataMenu;
  allToggles.forEach(btn => {
    try{
      const controls = btn.getAttribute('aria-controls');
      if (!controls || !d.getElementById(controls)) {
        if (fallbackPanel && fallbackPanel.id) btn.setAttribute('aria-controls', fallbackPanel.id);
      }
    }catch(_){}
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      toggleMobileMenu(e);
    });
  });

  // Bind close button (works for both patterns)
  if (legacyClose) legacyClose.addEventListener('click', (e) => { e.preventDefault(); if (useLegacy) legacySetOpen(false); else dataSetOpen(false); });

  // Backdrop click to close (legacy overlay and data overlay)
  if (overlay) {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { e.preventDefault(); e.stopPropagation(); legacySetOpen(false); } });
  }
  if (dataOverlay) {
    dataOverlay.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); dataSetOpen(false); });
  }

  // ESC to close
  d.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (useLegacy && legacyIsOpen()) { e.preventDefault(); legacySetOpen(false); return; }
    if (!useLegacy && dataIsOpen())  { e.preventDefault(); dataSetOpen(false); return; }
  });

  // Close on in-panel menu link click (capture)
  d.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (t && t.closest('.menu-link')) { if (useLegacy) legacySetOpen(false); else dataSetOpen(false); }
  }, true);

  // Close on hash changes to avoid lock after anchor navigation
  if (CONFIG.CLOSE_ON_HASH_CHANGE) {
    window.addEventListener('hashchange', () => { try { hardResetState('hashchange'); if (useLegacy) legacySetOpen(false); else dataSetOpen(false); } catch(_){} }, { passive: true });
    window.addEventListener('popstate',   () => { try { hardResetState('popstate'); if (useLegacy) legacySetOpen(false); else dataSetOpen(false); } catch(_){} }, { passive: true });
  }

  // BFCache restore safety
  window.addEventListener('pageshow', (e) => { if (e.persisted) { hardResetState('pageshow'); if (useLegacy) legacySetOpen(false); else dataSetOpen(false); } });
})();
