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
