(function(){
  if (window.__scrollInit) return; window.__scrollInit = true;

  // CONFIG: tune thresholds/delays here
  // - SCROLL_DURATION_MS: smooth scroll duration when allowed
  // - EXTRA_TOP_PX: extra top spacing above target after header offset
  // - IO_ROOT_MARGIN_BOTTOM: bottom rootMargin used for scrollspy (as % or px string)
  var CONFIG = {
    SCROLL_DURATION_MS: 600,
    EXTRA_TOP_PX: 12,
    IO_ROOT_MARGIN_BOTTOM: '-60%'
  };

  // CONFIG — Scrollspy (stadigare thresholds + mild hysteresis)
  const IO_THRESHOLDS = [0.25, 0.5, 0.75]; // stadigare än [0.1, 0.25, 0.5, 0.75]
  const IO_EXTRA_TOP_PX = 12;              // extra buffert ovanför header
  const IO_BOTTOM_BIAS = 0.60;             // -60% botten — byt till .50 om du vill byta tidigare
  const STABLE_DELAY_MS = 100;             // hysteresis för att undvika “flimmer”

  var d = document;

  // Easing function for smooth scroll (easeInOutCubic)
  function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2 }

  var prefersReduced = (function(){ try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch(_) { return false } })();

  // Smoothly scroll to element with easing and optional offset (returns a Promise)
  function smoothScrollTo(targetY, duration){
    return new Promise(function(resolve){
      try{
        if (prefersReduced || !duration || duration <= 0){ window.scrollTo(0, targetY); return resolve(); }
        var startY = window.scrollY || window.pageYOffset || 0;
        var diff = targetY - startY;
        var start;
        function step(ts){
          if (start == null) start = ts;
          var p = Math.min(1, (ts - start) / duration);
          var eased = easeInOutCubic(p);
          window.scrollTo(0, Math.round(startY + diff * eased));
          if (p < 1) requestAnimationFrame(step); else resolve();
        }
        requestAnimationFrame(step);
      }catch(_){ window.scrollTo(0, targetY); resolve(); }
    });
  }

  // Compute Y position accounting for fixed header height
  function getOffsetTop(el){
    var y = 0;
    while (el){ y += el.offsetTop; el = el.offsetParent; }
    // Approx header height (can be refined):
    var header = d.getElementById('siteHeader');
    var h = header ? header.offsetHeight : 0;
    return Math.max(0, y - (h + CONFIG.EXTRA_TOP_PX));
  }

  // Attach click handlers on nav/menu links with hashes
  function focusSection(el){
    try{
      var prevTabIndex = el.getAttribute('tabindex');
      el.setAttribute('tabindex','-1');
      el.focus({ preventScroll: true });
      if (prevTabIndex === null) el.removeAttribute('tabindex');
    }catch(_){ }
  }

  function closeMobileMenu(){
    try {
      var overlay = d.getElementById('site-menu-overlay');
      var panel = d.getElementById('site-menu');
      var trigger = d.getElementById('menu-trigger');
      var main = d.getElementById('mainContent') || d.querySelector('main');
      if (overlay){
        overlay.setAttribute('aria-hidden','true');
      }
      if (panel){ panel.setAttribute('aria-hidden','true'); }
      if (trigger){ trigger.setAttribute('aria-expanded','false'); }
      d.body.classList.remove('no-scroll');
      if (main){ try{ main.removeAttribute('inert'); }catch(_){ } }

      // Also support data-menu approach (html.menu-open + inert)
      var htmlEl = d.documentElement;
      var menuEl = d.querySelector('[data-menu]');
      if (htmlEl && htmlEl.classList.contains('menu-open')) htmlEl.classList.remove('menu-open');
      if (menuEl){
        try{ menuEl.setAttribute('aria-hidden','true'); }catch(_){ }
        try{ menuEl.setAttribute('inert',''); }catch(_){ }
      }
    } catch(_) {}
  }

  function onNavClick(e){
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    // only handle internal anchors that exist
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var target = d.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var y = getOffsetTop(target);
    smoothScrollTo(y, CONFIG.SCROLL_DURATION_MS).then(function(){
      // Uppdatera URL och aria-current oavsett motion
      try { history.replaceState(null, '', id); } catch(_){ }
      try {
        links.forEach(function(l){ l.classList.toggle('active', l.hash === id); l.removeAttribute('aria-current'); });
        var tid = id.replace(/^#/, ''); var el = byId[tid]; if (el) el.setAttribute('aria-current', 'page');
      } catch(_){ }
      // Flytta fokus till målsektion för skärmläsare
      focusSection(target);
      // Om klick kom från mobilmenyn, stäng den
      if (a.classList.contains('menu-link')) closeMobileMenu();
    });
  }

  // Scrollspy via IntersectionObserver
  var links = Array.prototype.slice.call(d.querySelectorAll('.nav-link, .menu-link'));
  var byId = (function(){
    var entries = links.map(function(a){
      var h = a.getAttribute('href') || '';
      var id = (h.split('#')[1] || '').trim();
      return [id, a];
    }).filter(function(p){ return !!p[0] });
    try { return Object.fromEntries(entries); } catch(_) {
      var o = {}; entries.forEach(function(p){ o[p[0]] = p[1]; }); return o;
    }
  })();
  function getHeaderH(){
    var el = d.querySelector('header') || d.getElementById('siteHeader');
    return (el && el.getBoundingClientRect ? el.getBoundingClientRect().height : 72) || 72;
  }
  function setActive(id){
    links.forEach(function(a){ a.classList.toggle('active', a.hash === ('#'+id)); });
    // A11y
    links.forEach(function(a){ a.removeAttribute('aria-current'); });
    try { var el = byId[id]; if (el) el.setAttribute('aria-current','page'); } catch(_){ }
    try { history.replaceState(null, '', '#'+id); } catch(_){ }
  }

  // Hysteresis för att undvika flimmer när IO växlar ofta
  var stableTimer = null, pendingId = null;
  function scheduleSetActive(nextId){
    if (pendingId === nextId || STABLE_DELAY_MS === 0) return setActive(nextId);
    pendingId = nextId;
    clearTimeout(stableTimer);
    stableTimer = setTimeout(function(){ pendingId = null; setActive(nextId); }, STABLE_DELAY_MS);
  }
  var io = null;
  function buildObserver(){
    try { if (io && io.disconnect) io.disconnect(); } catch(_){ }
    var headerH = getHeaderH();
    var rootMargin = '-' + (headerH + IO_EXTRA_TOP_PX) + 'px 0px -' + Math.round(IO_BOTTOM_BIAS * 100) + '% 0px';
    var opts = { rootMargin: rootMargin, threshold: IO_THRESHOLDS };
    io = new IntersectionObserver(function(entries){
      var best = entries
        .filter(function(e){ return e.isIntersecting; })
        .sort(function(a,b){ return b.intersectionRatio - a.intersectionRatio; })[0];
      if (best && best.target && best.target.id) scheduleSetActive(best.target.id);
    }, opts);
    // Observe .section[id] and section[id]
    var seen = new Set();
    var els = Array.prototype.slice.call(d.querySelectorAll('.section[id], section[id]'));
    els.forEach(function(s){ if (s && s.id && !seen.has(s.id)) { seen.add(s.id); io.observe(s); } });
  }

  // Touch scroll polish (inertial/friction-like)
  // We won't override native scrolling; but for momentum feel on older devices,
  // we can ensure passive listeners and avoid blocking.
  // Also, set scroll-behavior: smooth in CSS when allowed.

  function init(){
    // Keep CSS var --header-offset in sync with actual header height
    try {
      var headerEl = d.querySelector('header') || d.getElementById('siteHeader');
      if (headerEl && 'ResizeObserver' in window) {
        var ro = new ResizeObserver(function(){
          try{
            var h = (headerEl.getBoundingClientRect().height || 72);
            d.documentElement.style.setProperty('--header-offset', (h + 8) + 'px');
          }catch(_){ d.documentElement.style.setProperty('--header-offset', '80px'); }
        });
        ro.observe(headerEl);
        // Initialize immediately as well
        try{
          var h0 = (headerEl.getBoundingClientRect().height || 72);
          d.documentElement.style.setProperty('--header-offset', (h0 + 8) + 'px');
        }catch(_){ }
      }
    } catch(_) {}

    // Global anchor handler (header + mobile menu links)
    d.addEventListener('click', onNavClick, { capture: true });

    // If a .menu-link with hash is clicked, intercept and close menu after scroll
    d.addEventListener('click', function(e){
      var a = e.target && e.target.closest ? e.target.closest('.menu-link[href^="#"]') : null;
      if (!a) return;
      e.preventDefault();
      var id = a.getAttribute('href') || '';
      var target = d.querySelector(id);
      if (!target){ try{ location.hash = id.replace(/^#*/, '#'); }catch(_){ } closeMobileMenu(); return; }
      var y = getOffsetTop(target);
      smoothScrollTo(y, CONFIG.SCROLL_DURATION_MS).then(function(){
        focusSection(target);
        closeMobileMenu();
        try{ history.replaceState(null, '', id); }catch(_){ }
        try{
          links.forEach(function(l){ l.classList.toggle('active', l.hash === id); l.removeAttribute('aria-current'); });
          var tid = id.replace(/^#/, ''); var el = byId[tid]; if (el) el.setAttribute('aria-current', 'page');
        }catch(_){ }
      });
    }, true);
    buildObserver();
    // Rebuild observer on resize/orientation (header height/rootMargin changes)
    window.addEventListener('resize', function(){ buildObserver(); }, { passive: true });
    window.addEventListener('orientationchange', function(){ buildObserver(); }, { passive: true });

    // Safety net: close menu on hash change
    window.addEventListener('hashchange', function(){ closeMobileMenu(); }, { passive: true });

    // Path-based nav active state for docs links (fast & robust)
    try {
      var p = location.pathname;
      var isBoard = p.indexOf('/docs/lineups') === 0;
      var isRoles = p.indexOf('/docs/roller') === 0;
      var mark = function(href){
        try {
          var a = document.querySelector('a.nav-link[href="' + href + '"]');
          if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
        } catch(_) {}
      };
      if (isBoard) mark('/docs/lineups');
      if (isRoles) mark('/docs/roller');
      // Keep Roles active when navigating hashes within /docs/roller
      window.addEventListener('hashchange', function(){
        try { if ((location.pathname||'').indexOf('/docs/roller') === 0) mark('/docs/roller'); } catch(_){ }
      });
    } catch(_){ }

  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})();
