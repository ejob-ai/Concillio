(() => {
  const root = () => document.getElementById('toast-root');

  function closeWithAnim(el) {
    // Respektera reduced motion (ingen extra out-animation)
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { el.remove(); return; }
    el.style.animation = 'toast-out 160ms ease forwards';
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  function createToast({ title, message, variant = 'success', duration } = {}) {
    const host = root();
    if (!host) return null;

    const el = document.createElement('div');
    el.className = `toast toast--${variant}`;
    if (duration) el.style.setProperty('--toast-duration', `${duration}ms`);

    el.innerHTML = `
      <div class="toast__body">
        ${title ? `<div class="toast__title">${title}</div>` : ''}
        ${message ? `<div class="toast__msg">${message}</div>` : ''}
      </div>
      <button class="toast__close" aria-label="Close notification" title="Close">✕</button>
    `;

    // Close interactions
    const close = () => closeWithAnim(el);
    el.querySelector('.toast__close')?.addEventListener('click', close);

    // Pause on hover
    el.addEventListener('mouseenter', () => { el.style.animationPlayState = 'paused'; });
    el.addEventListener('mouseleave', () => { el.style.animationPlayState = 'running'; });

    host.appendChild(el);

    // Auto-remove timer (läser aktuell --toast-duration)
    const computed = getComputedStyle(el).getPropertyValue('--toast-duration').trim();
    const ms = /^\d+ms$/.test(computed) ? parseInt(computed, 10) : 4200;
    const timer = setTimeout(() => { close(); clearTimeout(timer); }, ms);

    return el;
  }

  // Publikt API
  window.ConcillioToast = {
    show: createToast,
    success: (message, opts = {}) => createToast({ message, variant: 'success', ...opts }),
    warning: (message, opts = {}) => createToast({ message, variant: 'warning', ...opts }),
    error:   (message, opts = {}) => createToast({ message, variant: 'error',   ...opts }),
  };
  try { window.Toast = window.ConcillioToast; } catch(_) {}
})();

// Concillio toast attribute hooks: forms and click helpers
(function () {
  try {
    const d = document;
    const T = window.ConcillioToast;
    if (!T) return;

    // 1) [data-toast-success]: show toast after submit (works with normal and ajax forms)
    d.addEventListener('submit', async (e) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;

      const msg = form.getAttribute('data-toast-success');
      const err = form.getAttribute('data-toast-error') || 'Something went wrong';

      // If handled via JS/fetch
      if (form.hasAttribute('data-ajax')) {
        e.preventDefault();
        try {
          const endpoint = form.getAttribute('action') || location.pathname;
          const method = (form.getAttribute('method') || 'POST').toUpperCase();
          const body = new FormData(form);

          const res = await fetch(endpoint, { method, body, credentials: 'same-origin' });
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

          if (msg) T.success(msg, { duration: 3200 });
          // Optional: reset form
          // form.reset();
        } catch (ex) {
          T.error(err, { duration: 4200, title: 'Error' });
        }
        return;
      }

      // Non-ajax forms: optimistic feedback
      if (msg) T.success(msg, { duration: 2800 });
    });

    // 2) [data-toast-click]: show toast on click (e.g., "Copied", "Added")
    d.addEventListener('click', (e) => {
      const t = e.target;
      const el = (t && t.closest) ? t.closest('[data-toast-click]') : null;
      if (!el) return;
      const text = el.getAttribute('data-toast-click') || 'Done';
      T.success(text, { duration: 2200 });
    }, { capture: true });

    // 3) Optional global error hook (leave commented by default)
    // window.addEventListener('error', () => T.error('Unexpected error', { duration: 4200 }), { once: true });
  } catch {}
})();