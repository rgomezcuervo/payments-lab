export const CLEAN_MODE_STORAGE_KEY = 'landing:clean-mode';

/**
 * @typedef {object} CleanModeHeaderOptions
 * @property {boolean} [brand] Marca (logo + nombre).
 * @property {boolean} [language] Selector de idioma.
 * @property {boolean} [exit] Botón salir del modo limpio.
 * @property {boolean} [chatShortcut] Atajo para abrir chat (requiere `features.chat`).
 */

const DEFAULT_HEADER_OPTIONS = /** @type {Required<CleanModeHeaderOptions>} */ ({
  brand: true,
  language: true,
  exit: true,
  chatShortcut: false,
});

/**
 * Aplica visibilidad de bloques del header de modo limpio según tenant.
 *
 * @param {Document} doc
 * @param {Partial<CleanModeHeaderOptions> | undefined} options
 * @param {boolean} [chatFeatureEnabled] Si el tenant tiene chat contratado.
 */
export function applyCleanHeaderOptions(doc, options, chatFeatureEnabled = false) {
  const merged = { ...DEFAULT_HEADER_OPTIONS, ...(options && typeof options === 'object' ? options : {}) };
  /** @type {(keyof CleanModeHeaderOptions)[]} */
  const keys = ['brand', 'language', 'exit', 'chatShortcut'];
  for (const key of keys) {
    const el = doc.querySelector(`[data-clean-header-option="${key}"]`);
    if (!(el instanceof HTMLElement)) continue;
    let show = Boolean(merged[key]);
    if (key === 'chatShortcut') {
      show = show && chatFeatureEnabled;
    }
    el.hidden = !show;
  }
}

/**
 * @param {Document} doc
 * @param {object} options
 * @param {boolean} [options.enabled]
 * @param {(key: string) => string} [options.t]
 * @param {Partial<CleanModeHeaderOptions>} [options.cleanModeHeader]
 * @param {boolean} [options.chatFeatureEnabled]
 */
export function initCleanMode(doc, options) {
  const { enabled = false, t, cleanModeHeader: headerOptions, chatFeatureEnabled = false } = options;
  const siteHeader = doc.getElementById('site-header');
  const cleanHeaderEl = doc.getElementById('clean-mode-header');
  const main = doc.getElementById('main-content');
  const cleanMount = doc.getElementById('clean-mode-mount');
  const cleanRoot = doc.getElementById('clean-mode-root');
  const toggle = doc.querySelector('[data-clean-mode-toggle]');

  if (!(siteHeader instanceof HTMLElement) || !(cleanHeaderEl instanceof HTMLElement)) return;
  if (!(main instanceof HTMLElement) || !(cleanMount instanceof HTMLElement)) return;
  if (!(cleanRoot instanceof HTMLElement)) return;
  if (!(toggle instanceof HTMLButtonElement)) return;

  if (!enabled) {
    toggle.hidden = true;
    return;
  }

  toggle.hidden = false;

  applyCleanHeaderOptions(doc, headerOptions, chatFeatureEnabled);

  function wireChatShortcut() {
    const btn = doc.querySelector('[data-clean-chat-open]');
    if (!(btn instanceof HTMLButtonElement)) return;
    btn.addEventListener('click', () => {
      const chatToggle = doc.querySelector('#chat-widget-root [data-chat-toggle]');
      if (chatToggle instanceof HTMLButtonElement) chatToggle.click();
    });
  }
  wireChatShortcut();

  function apply(/** @type {boolean} */ on) {
    doc.body.classList.toggle('clean-mode', on);

    siteHeader.hidden = on;
    siteHeader.setAttribute('aria-hidden', on ? 'true' : 'false');

    cleanHeaderEl.classList.toggle('hidden', !on);
    cleanHeaderEl.setAttribute('aria-hidden', on ? 'false' : 'true');

    main.hidden = on;
    main.setAttribute('aria-hidden', on ? 'true' : 'false');

    cleanMount.classList.toggle('hidden', !on);
    cleanMount.setAttribute('aria-hidden', on ? 'false' : 'true');
    cleanRoot.hidden = !on;
    cleanRoot.setAttribute('aria-hidden', on ? 'false' : 'true');

    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    try {
      globalThis.localStorage?.setItem(CLEAN_MODE_STORAGE_KEY, on ? '1' : '0');
    } catch {
      // ignore
    }
    if (t) {
      toggle.textContent = t(on ? 'nav.cleanModeExit' : 'nav.cleanMode');
      const skip = doc.querySelector('.skip-link');
      if (skip instanceof HTMLAnchorElement) {
        skip.href = on ? '#clean-mode-root' : '#main-content';
      }
    }
  }

  const exitBtn = doc.querySelector('[data-clean-mode-exit]');
  if (exitBtn instanceof HTMLButtonElement) {
    exitBtn.addEventListener('click', () => apply(false));
  }

  let initial = false;
  try {
    initial = globalThis.localStorage?.getItem(CLEAN_MODE_STORAGE_KEY) === '1';
  } catch {
    initial = false;
  }
  apply(initial);

  toggle.addEventListener('click', () => {
    apply(!doc.body.classList.contains('clean-mode'));
  });
}

/**
 * Actualiza el texto del toggle del nav principal tras cambiar idioma.
 *
 * @param {Document} doc
 * @param {(key: string) => string} t
 */
export function syncCleanModeToggle(doc, t) {
  const toggle = doc.querySelector('[data-clean-mode-toggle]');
  if (!(toggle instanceof HTMLButtonElement) || toggle.hidden) return;
  const on = doc.body.classList.contains('clean-mode');
  toggle.textContent = t(on ? 'nav.cleanModeExit' : 'nav.cleanMode');
}
