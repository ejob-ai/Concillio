(function () {
  const d = document;

  // Hjälpare: hitta associerad input (via for/id eller aria-controls)
  function resolveInput(el) {
    const forId = el.getAttribute('for') || el.getAttribute('aria-controls');
    if (forId) {
      const input = d.getElementById(forId);
      if (input && (input.type === 'radio' || input.type === 'checkbox')) return input;
    }
    // fallback: om chippen ligger precis efter input
    const prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'INPUT') && (prev.type === 'radio' || prev.type === 'checkbox')) return prev;
    return null;
  }

  d.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const chip = target.closest('.role-chip,[data-role-chip]');
    if (!chip) return;

    // Undvik dubbelhantering om det redan är en nativ label
    if (chip.tagName === 'LABEL' && chip.hasAttribute('for')) {
      // native label-klik funkar – men stoppa ev. föräldrar som kör preventDefault på länkar
      return;
    }

    const input = resolveInput(chip);
    if (!input) return;

    // Säkerställ att chippen kan fokuseras för A11y
    if (!chip.hasAttribute('tabindex')) chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'radio'); // om radio-grupp
    // uppdatera checked-state
    if (input.type === 'radio') {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (input.type === 'checkbox') {
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // flytta fokus till input för skärmläsare/validering
    input.focus({ preventScroll: true });
  }, { capture: true });

  // Tangentbord: Space/Enter aktiverar chip
  d.addEventListener('keydown', (e) => {
    if (!(e.target instanceof Element)) return;
    const chip = e.target.closest('.role-chip,[data-role-chip]');
    if (!chip) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      chip.click();
    }
  }, true);
})();