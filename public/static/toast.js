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
})();