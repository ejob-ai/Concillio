(() => {
  if (window.__menuInit) return; // idempotens-vakt
  window.__menuInit = true;

  const overlay = document.getElementById('site-menu-overlay');
  const panel   = document.getElementById('site-menu-panel') || overlay;
  const trigger = document.getElementById('menu-trigger') || document.querySelector('[aria-controls="site-menu-overlay"]');
  const close   = document.getElementById('menu-close') || document.querySelector('#site-menu-overlay [data-close], #site-menu-overlay button[aria-label="Close"]');
  const main    = document.getElementById('mainContent') || document.querySelector('main'); // inert disabled; overlay blocks background

  if (!overlay || !trigger) return; // sidan saknar header/meny

  // iOS scroll-lock-detektering
  const isiOS = /iP(ad|hone|od)/.test(navigator.platform) ||
                (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

  const saved = { bodyPadRight:'', bodyPos:'', bodyTop:'', scrollY:0 };
  let lastFocus = null;

  const sw = () => window.innerWidth - document.documentElement.clientWidth;

  function focusFirst(scope){
    const el = scope?.querySelector('[autofocus],button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (el) { try { el.focus(); } catch {} return; }
    if (scope && !scope.hasAttribute('tabindex')) scope.setAttribute('tabindex','-1');
    try { scope?.focus(); } catch {}
  }

  function onKeydown(e){
    if (e.key === 'Escape') { setOpen(false); return; } // ESC to close
    if (e.key !== 'Tab') return;
    const items = (panel || overlay).querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  function setOpen(open){
    const pnl = panel || overlay;
    // ARIA + state
    overlay.setAttribute('aria-hidden', String(!open));
    overlay.setAttribute('data-state', open ? 'open' : 'closed');
    trigger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    // NOTE: inert is disabled to avoid UA issues; overlay itself blocks background interactions

    if (open){
      // scrollbar-komp
      saved.bodyPadRight = document.body.style.paddingRight || '';
      const w = sw(); if (w > 0) document.body.style.paddingRight = w + 'px';

      // iOS fix
      saved.scrollY = window.scrollY || 0;
      saved.bodyPos = document.body.style.position || '';
      saved.bodyTop = document.body.style.top || '';
      if (isiOS){ document.body.style.position = 'fixed'; document.body.style.top = (-saved.scrollY) + 'px'; }

      lastFocus = document.activeElement;
      focusFirst(pnl);
      document.addEventListener('keydown', onKeydown);
    } else {
      document.body.style.paddingRight = saved.bodyPadRight;
      if (isiOS){
        document.body.style.position = saved.bodyPos;
        document.body.style.top = saved.bodyTop;
        window.scrollTo(0, saved.scrollY || 0);
      }
      document.removeEventListener('keydown', onKeydown);
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch {} }
    }
  }

  // init – ensure fully closed state and remove any leftover scroll locks
  setOpen(false);

  trigger.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setOpen(true);  });
  close   && close.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) setOpen(false); });
  // Defensive: click outside panel closes, but clicks inside panel should NOT bubble to overlay
  if (panel) panel.addEventListener('click', (e) => { e.stopPropagation(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setOpen(false); });

  // Close on navigation via brand/menu links and home
  try {
    document.querySelectorAll('a.brand, .menu-link, a[href="/"]').forEach((a) => {
      a.addEventListener('click', () => setOpen(false), { capture: true });
    });
  } catch(_) {}

  // Close when restoring from bfcache (back/forward)
  window.addEventListener('pageshow', (e) => { if (e.persisted) setOpen(false); });

  // Dev-hjälp (syns bara i icke-prod om du vill)
  // window.__menu = { open: () => setOpen(true), close: () => setOpen(false) };
})();