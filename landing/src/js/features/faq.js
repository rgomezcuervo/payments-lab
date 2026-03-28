/**
 * Acordeón FAQ: clic y teclado (flechas, Inicio, Fin).
 *
 * @param {ParentNode} root
 */
export function initFaqAccordion(root) {
  const items = root.querySelectorAll('[data-faq-item]');
  const triggers = Array.from(root.querySelectorAll('[data-faq-trigger]')).filter(
    (t) => t instanceof HTMLButtonElement,
  );

  items.forEach((item) => {
    const trigger = item.querySelector('[data-faq-trigger]');
    const panel = item.querySelector('[data-faq-panel]');
    const icon = item.querySelector('[data-faq-icon]');
    if (!trigger || !panel || !(trigger instanceof HTMLButtonElement)) return;

    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.add('hidden');
    item.setAttribute('data-state', 'closed');
    if (icon instanceof HTMLElement) icon.classList.remove('rotate-180');

    trigger.addEventListener('click', () => {
      const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
      items.forEach((other) => {
        const t = other.querySelector('[data-faq-trigger]');
        const p = other.querySelector('[data-faq-panel]');
        const ic = other.querySelector('[data-faq-icon]');
        if (!t || !p || !(t instanceof HTMLButtonElement)) return;
        const isThis = other === item;
        const open = isThis ? !wasOpen : false;
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
        p.classList.toggle('hidden', !open);
        other.setAttribute('data-state', open ? 'open' : 'closed');
        if (ic instanceof HTMLElement) ic.classList.toggle('rotate-180', open);
      });
    });

    trigger.addEventListener('keydown', (e) => {
      if (!(e instanceof KeyboardEvent)) return;
      const idx = triggers.indexOf(trigger);
      if (idx < 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        triggers[(idx + 1) % triggers.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        triggers[(idx - 1 + triggers.length) % triggers.length]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        triggers[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        triggers[triggers.length - 1]?.focus();
      }
    });
  });
}
