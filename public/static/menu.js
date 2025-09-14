(() => {
  if (window.__menuInit) return; window.__menuInit = true;

  const d = document;
  const overlay = d.getElementById('site-menu-overlay');
  const panel   = d.getElementById('site-menu-panel') || overlay;
  const trigger = d.getElementById('menu-trigger');
  const close   = d.getElementById('menu-close');
  const body    = d.body;
  const main    = d.getElementById('mainContent');

  if(!overlay || !panel) return;

  let lastFocus = null;

  function trapFocus(){
    if (overlay.getAttribute('data-state') !== 'open') return;
    if (!panel.contains(d.activeElement)) {
      const f = panel.querySelector('[autofocus],button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      (f || panel).focus({ preventScroll: true });
    }
  }

  function setOpen(open){
    overlay.setAttribute('data-state', open ? 'open' : 'closed');
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open){
      lastFocus = d.activeElement;
      body.classList.add('no-scroll');
      if (main) main.setAttribute('inert','');
      setTimeout(trapFocus, 0);
    } else {
      body.classList.remove('no-scroll');
      if (main) main.removeAttribute('inert');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        try { lastFocus.focus({ preventScroll: true }); } catch(_){ }
      }
    }
  }

  // First paint: force closed & layout pass
  setOpen(false); void overlay.offsetHeight; window.dispatchEvent(new Event('resize'));

  // Toggle bindings
  trigger && trigger.addEventListener('click', () => setOpen(true));
  close   && close.addEventListener('click',   () => setOpen(false));

  // Backdrop click closes (but only if you actually click the backdrop)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { e.preventDefault(); e.stopPropagation(); setOpen(false); }
  });

  // Allow interactions inside panel; only block "empty" clicks
  panel.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (t && t.closest('[data-theme-toggle],a,button,input,select,textarea,summary,[role="button"]')) return;
    e.stopPropagation();
  });

  // ESC to close
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('data-state') === 'open') {
      e.preventDefault(); setOpen(false);
    }
  });

  // Close on brand/menu links (capture) + BFCache restore
  d.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (t && t.closest('.menu-link')) setOpen(false);
  }, true);
  window.addEventListener('pageshow', (e) => { if (e.persisted) setOpen(false); });
})();
