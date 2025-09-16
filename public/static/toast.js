(()=>{
  if (window.__toastInit) return; window.__toastInit = true;
  const d = document;

  function ensureRoot(){
    let root = d.getElementById('toast-root') || d.querySelector('.toast-container');
    if (!root){
      root = d.createElement('div');
      root.id = 'toast-root';
      root.className = 'toast-container toast-container--bottom';
      root.setAttribute('role','region');
      root.setAttribute('aria-live','polite');
      root.setAttribute('aria-atomic','true');
      d.body.appendChild(root);
    }
    return root;
  }

  function createToast(opts={}){
    const { title, message, msg, html, variant, duration } = opts;
    const v = (variant||'').toLowerCase();
    const root = ensureRoot();
    const t = d.createElement('div');
    t.className = 'toast' + (v==='success'?' toast--success': v==='warning'?' toast--warning': v==='error'?' toast--error':'');
    if (duration && Number(duration) > 0){ try{ t.style.setProperty('--toast-duration', (Number(duration)|0)+'ms'); }catch(_){} }
    const safe = (s)=> (typeof s==='string'? s : '');
    const titleHtml = safe(title) ? `<div class="toast__title">${safe(title)}</div>` : '';
    const msgHtml = safe(html) ? `<div class="toast__msg">${html}</div>` : (safe(message||msg) ? `<div class="toast__msg">${safe(message||msg)}</div>` : '');
    t.innerHTML = `${titleHtml}${msgHtml}<button class="toast__close" aria-label="Close">×</button>`;
    root.appendChild(t);

    const auto = Number(duration||0) || 4200;
    let autoTimer = null;
    if (auto > 0) autoTimer = setTimeout(()=> closeToast(t), auto + 150);

    t.querySelector('.toast__close')?.addEventListener('click', (e)=>{ e.preventDefault(); closeToast(t); });
    t.addEventListener('animationend', (e)=>{
      if (e.animationName === 'toast-out' || e.animationName === 'toast-auto-hide') {
        try{ t.remove(); }catch(_){ t.parentNode && t.parentNode.removeChild(t); }
      }
    });
    return t;
  }

  function closeToast(t){ if (!t) return; try{ t.style.animation = 'toast-out 160ms ease forwards'; }catch(_){} }
  function clearAll(){ const root = ensureRoot(); root.querySelectorAll('.toast').forEach(closeToast); }

  const API = {
    show: (messageOrOpts, opts={}) => {
      const o = (typeof messageOrOpts === 'string') ? { message: messageOrOpts, ...opts } : (messageOrOpts||{});
      return createToast(o);
    },
    success: (msg, opts={}) => createToast({ message: msg, variant:'success', ...opts }),
    warning: (msg, opts={}) => createToast({ message: msg, variant:'warning', ...opts }),
    error:   (msg, opts={}) => createToast({ message: msg, variant:'error',   ...opts }),
    close: closeToast,
    clear: clearAll
  };

  try { window.Toast = API; } catch(_) {}

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ensureRoot); else ensureRoot();
})();