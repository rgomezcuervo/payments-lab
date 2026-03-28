/**
 * Microsoft Clarity: inyección opcional del tag (puede desactivarse por tenant).
 */

/**
 * Inserta el snippet oficial de Clarity si aún no existe para este `projectId`.
 *
 * @param {string} projectId Identificador del proyecto en Clarity.
 * @param {Document} [doc]
 */
export function loadClarity(projectId, doc = globalThis.document) {
  const id = typeof projectId === 'string' ? projectId.trim() : '';
  if (!id) return;
  if ([...doc.querySelectorAll('script[data-clarity-tag]')].some((s) => s.dataset.clarityTag === id)) return;
  const win = doc.defaultView;
  if (!win) return;

  const c = /** @type {Window & Record<string, unknown>} */ (win);
  const a = 'clarity';
  c[a] =
    c[a] ||
    function clarityQueue() {
      const fn = /** @type {function & { q?: unknown[] }} */ (c[a]);
      if (!fn.q) fn.q = [];
      fn.q.push(arguments);
    };
  const t = doc.createElement('script');
  t.async = true;
  t.src = `https://www.clarity.ms/tag/${encodeURIComponent(id)}`;
  t.dataset.clarityTag = id;
  const first = doc.getElementsByTagName('script')[0];
  if (first?.parentNode) first.parentNode.insertBefore(t, first);
  else doc.head.appendChild(t);
}
