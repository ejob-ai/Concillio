(() => {
  if (window.__menuInit) return; window.__menuInit = true;

  const d = document;
  const html = d.documentElement;

  // Elements for legacy overlay pattern
  const overlay = d.getElementById('site-menu-overlay');
  const panel   = d.getElementById('site-menu-panel') || overlay;
  const legacyTrigger = d.getElementById('menu-trigger');
  const legacyClose   = d.getElementById('menu-close');

  // Elements for data-menu pattern
  const dataMenu     = d.querySelector('[data-menu]');
  const dataOverlay  = d.querySelector('[data-menu-overlay]');
  const dataToggles  = Array.from(d.querySelectorAll('[data-menu-toggle]'));

  const body    = d.body;
  const main    = d.getElementById('mainContent') || d.querySelector('main');

  let lastFocus = null;

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
  function legacyIsOpen(){ return overlay && overlay.getAttribute('data-state') === 'open'; }
  function legacySetOpen(open){
    if (!overlay || !panel) return;
    overlay.setAttribute('data-state', open ? 'open' : 'closed');
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    dataToggles.forEach(btn => btn.setAttribute('aria-expanded', String(!!open)));
    if (open){
      lastFocus = d.activeElement;
      body.classList.add('no-scroll');
      if (main) { try { main.setAttribute('inert',''); } catch(_) {} }
      setTimeout(() => trapFocus(panel), 0);
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
    dataToggles.forEach(btn => btn.setAttribute('aria-expanded', String(!!open)));
    if (open){
      lastFocus = d.activeElement;
      body.classList.add('no-scroll');
      if (main) { try { main.setAttribute('inert',''); } catch(_) {} }
      setTimeout(() => trapFocus(dataMenu), 0);
    } else {
      body.classList.remove('no-scroll');
      if (main) { try { main.removeAttribute('inert'); } catch(_) {} }
      if (lastFocus && typeof lastFocus.focus === 'function') {
        try { lastFocus.focus({ preventScroll: true }); } catch(_){}
      }
    }
  }
  function dataToggle(){ dataSetOpen(!dataIsOpen()); }

  // Prefer legacy overlay if present (it is visually richer and already styled)
  const useLegacy = !!overlay && !!panel;

  // First paint: force closed state and sync aria
  try {
    if (useLegacy) legacySetOpen(false); else if (dataMenu) dataSetOpen(false);
    // Layout pass and ensure header offset observers recalc
    if (overlay) void overlay.offsetHeight; window.dispatchEvent(new Event('resize'));
  } catch(_) {}

  // Bind toggle buttons (supports both #menu-trigger and any [data-menu-toggle])
  const allToggles = new Set([legacyTrigger, ...dataToggles].filter(Boolean));
  allToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (useLegacy) legacyToggle(); else dataToggle();
    });
  });

  // Bind close button for legacy
  if (legacyClose) legacyClose.addEventListener('click', (e) => { e.preventDefault(); legacySetOpen(false); });

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

  // BFCache restore safety
  window.addEventListener('pageshow', (e) => { if (e.persisted) { if (useLegacy) legacySetOpen(false); else dataSetOpen(false); } });
})();
