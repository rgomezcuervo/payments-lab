/** @typedef {'es' | 'en'} Locale */

export const LOCALE_STORAGE_KEY = 'landing.locale';

/** @type {Locale[]} */
export const SUPPORTED_LOCALES = ['es', 'en'];

/**
 * @param {string | undefined} value
 * @returns {Locale | undefined}
 */
export function normalizeLocaleParam(value) {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (v === 'es' || v.startsWith('es-')) return 'es';
  if (v === 'en' || v.startsWith('en-')) return 'en';
  return undefined;
}

/**
 * Idioma inicial: query `?lang=` &gt; localStorage &gt; `navigator.language`.
 *
 * @param {{
 *   location?: Pick<Location, 'search'>;
 *   storage?: Pick<Storage, 'getItem'>;
 *   navigator?: Pick<Navigator, 'language'>;
 * }} [env]
 * @returns {Locale}
 */
export function detectInitialLocale(env = {}) {
  const location = env.location ?? (typeof globalThis !== 'undefined' ? globalThis.location : undefined);
  const storage = env.storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
  const nav = env.navigator ?? (typeof globalThis !== 'undefined' ? globalThis.navigator : undefined);

  if (location?.search) {
    const params = new URLSearchParams(location.search);
    const fromUrl = normalizeLocaleParam(params.get('lang') ?? undefined);
    if (fromUrl) return fromUrl;
  }

  if (storage) {
    try {
      const stored = normalizeLocaleParam(storage.getItem(LOCALE_STORAGE_KEY) ?? undefined);
      if (stored) return stored;
    } catch {
      // private mode / disabled storage
    }
  }

  if (nav?.language) {
    const fromNav = normalizeLocaleParam(nav.language);
    if (fromNav) return fromNav;
  }

  return 'es';
}
