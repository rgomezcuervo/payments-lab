/**
 * @param {ParentNode} root
 */
export function initFaqAccordion(root) {
  const items = root.querySelectorAll('[data-faq-item]');

  items.forEach((item) => {
    const trigger = item.querySelector('[data-faq-trigger]');
    const panel = item.querySelector('[data-faq-panel]');
    const icon = item.querySelector('[data-faq-icon]');
    if (!trigger || !panel || !(trigger instanceof HTMLButtonElement)) return;

    function setItemState(/** @type {boolean} */ open) {
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.classList.toggle('hidden', !open);
      item.setAttribute('data-state', open ? 'open' : 'closed');
      if (icon instanceof HTMLElement) icon.classList.toggle('rotate-180', open);
    }

    setItemState(false);

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
  });
}
