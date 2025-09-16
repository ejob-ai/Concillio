(function(){
  if (window.__scrollInit) return; window.__scrollInit = true;
  var d = document;

  // Easing function for smooth scroll (easeInOutCubic)
  function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2 }

  // Smoothly scroll to element with easing and optional offset
  function smoothScrollTo(targetY, duration){
    try{
      var startY = window.scrollY || window.pageYOffset || 0;
      var diff = targetY - startY;
      var start;
      function step(ts){
        if (start == null) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = easeInOutCubic(p);
        window.scrollTo(0, Math.round(startY + diff * eased));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }catch(_){ window.scrollTo(0, targetY); }
  }

  // Compute Y position accounting for fixed header height
  function getOffsetTop(el){
    var y = 0;
    while (el){ y += el.offsetTop; el = el.offsetParent; }
    // Approx header height (can be refined):
    var header = d.getElementById('siteHeader');
    var h = header ? header.offsetHeight : 0;
    return Math.max(0, y - (h + 12)); // add small spacing
  }

  // Attach click handlers on nav/menu links with hashes
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
    smoothScrollTo(y, 600);
    history.pushState({}, '', id);
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
  var io = null;
  function buildObserver(){
    try { if (io && io.disconnect) io.disconnect(); } catch(_){ }
    var opts = { rootMargin: (-(getHeaderH()+1))+'px 0px -60% 0px', threshold: [0.1, 0.25, 0.5, 0.75] };
    io = new IntersectionObserver(function(entries){
      entries.filter(function(e){ return e.isIntersecting; })
        .sort(function(a,b){ return b.intersectionRatio - a.intersectionRatio; })
        .slice(0,1)
        .forEach(function(e){ setActive(e.target.id); });
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

    d.addEventListener('click', onNavClick, { capture: true });
    buildObserver();
    // Rebuild observer on resize/orientation (header height/rootMargin changes)
    window.addEventListener('resize', function(){ buildObserver(); }, { passive: true });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})();
