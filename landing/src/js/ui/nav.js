const PANEL_HIDDEN_MOBILE = 'max-md:hidden';

/**
 * @param {HTMLElement} root
 */
export function initNav(root) {
  const toggle = root.querySelector('[data-nav-toggle]');
  const panel = root.querySelector('[data-nav-panel]');
  if (!toggle || !panel || !(toggle instanceof HTMLButtonElement)) return;

  const mq = window.matchMedia('(min-width: 768px)');

  function setMobileOpen(open) {
    if (mq.matches) return;
    if (open) panel.classList.remove(PANEL_HIDDEN_MOBILE);
    else panel.classList.add(PANEL_HIDDEN_MOBILE);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  function syncLayout() {
    if (mq.matches) {
      panel.classList.remove(PANEL_HIDDEN_MOBILE);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    } else {
      panel.classList.add(PANEL_HIDDEN_MOBILE);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }
  }

  toggle.addEventListener('click', () => {
    if (mq.matches) return;
    const isHidden = panel.classList.contains(PANEL_HIDDEN_MOBILE);
    setMobileOpen(isHidden);
  });

  mq.addEventListener('change', syncLayout);
  syncLayout();

  panel.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!mq.matches) setMobileOpen(false);
    });
  });
}
