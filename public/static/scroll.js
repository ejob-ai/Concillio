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

  // Scrollspy
  var sections = [];
  function collectSections(){
    sections = Array.from(d.querySelectorAll('section[id], [data-spy]')).map(function(s){
      return { id: s.id || s.getAttribute('data-spy'), el: s };
    }).filter(function(s){ return !!s.id });
  }

  function setActive(id){
    d.querySelectorAll('.nav-link, .menu-link').forEach(function(n){ n.classList.remove('active'); });
    if (!id) return;
    var sel = 'a.nav-link[href="/#'+id+'"], a.menu-link[href="/#'+id+'"], a.nav-link[href="#'+id+'"], a.menu-link[href="#'+id+'"]';
    d.querySelectorAll(sel).forEach(function(n){ n.classList.add('active'); });
  }

  function spy(){
    var y = (window.scrollY || window.pageYOffset || 0);
    var vh = window.innerHeight || d.documentElement.clientHeight;
    var header = d.getElementById('siteHeader');
    var topPad = header ? header.offsetHeight + 24 : 24;
    var best = null, bestOffset = Infinity;
    sections.forEach(function(s){
      var rect = s.el.getBoundingClientRect();
      var top = rect.top + y - topPad;
      var offset = Math.abs(y - top);
      if (top <= y + 1 && offset < bestOffset){ best = s; bestOffset = offset; }
    });
    setActive(best ? best.id : null);
  }

  // Touch scroll polish (inertial/friction-like)
  // We won't override native scrolling; but for momentum feel on older devices,
  // we can ensure passive listeners and avoid blocking.
  // Also, set scroll-behavior: smooth in CSS when allowed.

  function init(){
    collectSections();
    d.addEventListener('click', onNavClick, { capture: true });
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', function(){ collectSections(); spy(); }, { passive: true });
    spy();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})();
