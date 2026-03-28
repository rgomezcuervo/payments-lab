/**
 * Google Tag Manager: `dataLayer` inicial, carga diferida del contenedor y helpers de eventos.
 */

/**
 * @typedef {{ event?: string; [key: string]: unknown }} DataLayerPush
 */

/**
 * Garantiza `window.dataLayer` como arreglo mutable.
 *
 * @param {Pick<Window, 'dataLayer'>} [win]
 * @returns {DataLayerPush[]}
 */
export function ensureDataLayer(win = globalThis) {
  const w = /** @type {Window & { dataLayer?: DataLayerPush[] }} */ (win);
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  return w.dataLayer;
}

/**
 * Empuja un evento al `dataLayer` (consumido por GTM).
 *
 * @param {string} eventName Nombre del evento (p. ej. `landing_cta_pay`).
 * @param {Record<string, unknown>} [payload] Campos adicionales del dataLayer.
 */
export function pushDataLayerEvent(eventName, payload = {}) {
  const dl = ensureDataLayer();
  dl.push({ event: eventName, ...payload });
}

/**
 * Carga el script `gtm.js` de forma diferida (`requestIdleCallback` o `setTimeout`).
 *
 * @param {string} containerId Identificador del contenedor (`GTM-XXXX`).
 * @param {Document} [doc]
 * @param {Pick<typeof globalThis, 'requestIdleCallback' | 'setTimeout'>} [deps]
 */
export function loadGtm(containerId, doc = globalThis.document, deps = globalThis) {
  const id = typeof containerId === 'string' ? containerId.trim() : '';
  if (!id || !/^GTM-[A-Z0-9]+$/i.test(id)) return;

  function inject() {
    const w = /** @type {Window & { dataLayer?: DataLayerPush[] }} */ (doc.defaultView ?? globalThis);
    const dl = ensureDataLayer(w);
    dl.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = doc.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
    const first = doc.getElementsByTagName('script')[0];
    if (first?.parentNode) first.parentNode.insertBefore(s, first);
    else doc.head.appendChild(s);
  }

  if (typeof deps.requestIdleCallback === 'function') {
    deps.requestIdleCallback(() => inject(), { timeout: 2000 });
  } else {
    deps.setTimeout(inject, 0);
  }
}

/**
 * Delegación de clics: elementos con `data-gtm-event` disparan `landing_${nombre}` en el dataLayer.
 *
 * @param {ParentNode} root
 * @returns {() => void} Función para eliminar el listener.
 */
export function bindGtmCtaListeners(root) {
  const doc = root instanceof Document ? root : root.ownerDocument;
  if (!doc) return () => {};

  /** @param {MouseEvent} e */
  function onClick(e) {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const el = t.closest('[data-gtm-event]');
    if (!el || !(root === doc || root.contains(el))) return;
    const name = el.getAttribute('data-gtm-event');
    if (!name || !name.trim()) return;
    /** @type {Record<string, unknown>} */
    const detail = { element: el.tagName.toLowerCase() };
    const href = el.getAttribute('href');
    if (href) detail.href = href;
    pushDataLayerEvent(`landing_${name.trim()}`, detail);
  }

  doc.addEventListener('click', onClick);
  return () => doc.removeEventListener('click', onClick);
}
