import es from '../../i18n/es.json';
import en from '../../i18n/en.json';
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from './locale-detector.js';

/** @typedef {import('./locale-detector.js').Locale} Locale */

/** @type {Record<Locale, typeof es>} */
const MESSAGES = { es, en };

const LOCALE_EVENT = 'landing:locale-change';

/**
 * @param {unknown} obj
 * @param {string} key dot-separated path
 * @returns {string | undefined}
 */
export function resolveMessage(obj, key) {
  const parts = key.split('.');
  /** @type {unknown} */
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = /** @type {Record<string, unknown>} */ (cur)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

/**
 * @param {Locale} locale
 * @param {string} key
 */
export function t(locale, key) {
  const msg = resolveMessage(MESSAGES[locale], key);
  return msg ?? key;
}

/**
 * Aplica `data-i18n-key` (y opcionalmente `data-i18n-attr`) bajo `root`.
 *
 * @param {ParentNode} root
 * @param {Locale} locale
 */
export function applyI18nToDom(root, locale) {
  const messages = MESSAGES[locale];
  root.querySelectorAll('[data-i18n-key]').forEach((node) => {
    if (!(node instanceof Element)) return;
    const key = node.getAttribute('data-i18n-key');
    if (!key) return;
    const value = resolveMessage(messages, key);
    if (value == null) return;
    const attr = node.getAttribute('data-i18n-attr');
    if (attr) node.setAttribute(attr, value);
    else node.textContent = value;
  });

  const docEl =
    root instanceof Document ? root.documentElement : root instanceof Element ? root.ownerDocument?.documentElement : null;
  if (docEl) docEl.lang = locale;
}

/**
 * @param {Locale} locale
 * @param {HTMLElement | null} liveRegion
 */
export function announceLocaleChange(locale, liveRegion) {
  if (!liveRegion) return;
  const message = t(locale, 'a11y.langChanged');
  liveRegion.textContent = '';
  void liveRegion.offsetHeight;
  liveRegion.textContent = message;
}

/**
 * @param {Locale} locale
 * @param {Pick<Location, 'href'>} [loc]
 */
export function persistLocaleToUrl(locale, loc) {
  const location = loc ?? (typeof globalThis !== 'undefined' ? globalThis.location : undefined);
  if (!location?.href || typeof history === 'undefined' || !history.replaceState) return;

  const url = new URL(location.href);
  url.searchParams.set('lang', locale);
  history.replaceState({}, '', url.pathname + url.search + url.hash);
}

/**
 * @param {Locale} locale
 */
export function persistLocaleToStorage(locale) {
  try {
    globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

/**
 * @param {object} options
 * @param {Document} options.document
 * @param {Locale} options.initialLocale
 * @param {(locale: Locale) => void} [options.onLocaleChange]
 */
export function initI18nController({ document: doc, initialLocale, onLocaleChange }) {
  /** @type {Locale} */
  let locale = SUPPORTED_LOCALES.includes(initialLocale) ? initialLocale : 'es';

  const liveRegion = doc.getElementById('i18n-live');

  function getLocale() {
    return locale;
  }

  function setLocale(next) {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    locale = next;
    persistLocaleToStorage(next);
    persistLocaleToUrl(next);
    applyI18nToDom(doc, locale);
    const langSelect = doc.getElementById('lang-select');
    if (langSelect instanceof HTMLSelectElement) langSelect.value = next;
    announceLocaleChange(locale, liveRegion instanceof HTMLElement ? liveRegion : null);
    doc.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: { locale: next } }));
    onLocaleChange?.(next);
  }

  function translate(key) {
    return t(locale, key);
  }

  applyI18nToDom(doc, locale);
  persistLocaleToUrl(locale);

  return {
    getLocale,
    setLocale,
    t: translate,
    bindLanguageSelect: () => {
      const sel = doc.getElementById('lang-select');
      if (!(sel instanceof HTMLSelectElement)) return;
      sel.value = getLocale();
      sel.addEventListener('change', () => {
        const v = sel.value;
        if (v === 'es' || v === 'en') setLocale(v);
      });
    },
    subscribe: (listener) => {
      /** @param {Event} e */
      const handler = (e) => {
        if (e instanceof CustomEvent && e.detail && typeof e.detail === 'object' && 'locale' in e.detail) {
          listener(/** @type {{ locale: Locale }} */ (e.detail).locale);
        }
      };
      doc.addEventListener(LOCALE_EVENT, handler);
      return () => doc.removeEventListener(LOCALE_EVENT, handler);
    },
  };
}
