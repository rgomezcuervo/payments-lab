const PANEL_HIDDEN_MOBILE = 'max-md:hidden';

/**
 * @param {HTMLButtonElement} toggle
 * @param {(key: string) => string} translate
 */
function applyToggleAria(toggle, translate) {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  const label = expanded ? translate('nav.closeMenu') : translate('nav.openMenu');
  toggle.setAttribute('aria-label', label);
}

/**
 * Sincroniza etiquetas ARIA del botón menú (p. ej. tras cambiar idioma).
 *
 * @param {HTMLElement} root
 * @param {(key: string) => string} translate
 */
export function syncNavToggleAria(root, translate) {
  const toggle = root.querySelector('[data-nav-toggle]');
  if (!toggle || !(toggle instanceof HTMLButtonElement)) return;
  applyToggleAria(toggle, translate);
}

/**
 * @param {HTMLElement} root
 * @param {{ t?: (key: string) => string }} [options]
 */
export function initNav(root, options = {}) {
  const { t } = options;
  const translate = typeof t === 'function' ? t : () => '';

  const toggle = root.querySelector('[data-nav-toggle]');
  const panel = root.querySelector('[data-nav-panel]');
  if (!toggle || !panel || !(toggle instanceof HTMLButtonElement)) return;

  const mq = window.matchMedia('(min-width: 768px)');

  function setMobileOpen(open) {
    if (mq.matches) return;
    if (open) panel.classList.remove(PANEL_HIDDEN_MOBILE);
    else panel.classList.add(PANEL_HIDDEN_MOBILE);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (t) applyToggleAria(toggle, translate);
    else {
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
  }

  function syncLayout() {
    if (mq.matches) {
      panel.classList.remove(PANEL_HIDDEN_MOBILE);
      toggle.setAttribute('aria-expanded', 'false');
      if (t) applyToggleAria(toggle, translate);
      else toggle.setAttribute('aria-label', 'Abrir menú');
    } else {
      panel.classList.add(PANEL_HIDDEN_MOBILE);
      toggle.setAttribute('aria-expanded', 'false');
      if (t) applyToggleAria(toggle, translate);
      else toggle.setAttribute('aria-label', 'Abrir menú');
    }
  }

  if (t) applyToggleAria(toggle, translate);

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
