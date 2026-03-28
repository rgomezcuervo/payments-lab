/**
 * Inyecta HTML en nodos `[data-cms-slot="<clave>"]` dentro del subárbol indicado.
 *
 * @param {ParentNode} root
 * @param {import('./content-provider.js').LandingContent} content
 */
export function applyLandingContent(root, content) {
  if (!root || !content?.slots) return;
  const { slots } = content;
  for (const [slot, html] of Object.entries(slots)) {
    if (html == null || html === '') continue;
    const el = root.querySelector(`[data-cms-slot="${String(slot).replace(/"/g, '')}"]`);
    if (el) el.innerHTML = html;
  }
}
