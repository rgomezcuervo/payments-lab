/**
 * Widget flotante de chat (stub PoC); carga opcional de script remoto desde config tenant.
 *
 * @param {Document} doc
 * @param {object} options
 * @param {boolean} [options.enabled]
 * @param {string} [options.scriptUrl] URL de script externo (p. ej. widget proveedor).
 */
export function initChatWidget(doc, options) {
  const { enabled = false, scriptUrl } = options;
  const mount = doc.getElementById('chat-widget-root');
  if (!(mount instanceof HTMLElement)) return;

  mount.innerHTML = '';
  mount.hidden = true;
  mount.classList.add('pointer-events-none');
  mount.setAttribute('aria-hidden', 'true');

  if (!enabled) return;

  mount.hidden = false;
  mount.classList.remove('pointer-events-none');
  mount.setAttribute('aria-hidden', 'false');
  mount.innerHTML = `
    <div class="pointer-events-auto fixed bottom-4 right-4 z-[60] flex max-w-sm flex-col items-end gap-2">
      <div
        id="chat-widget-panel"
        class="hidden w-[min(100vw-2rem,22rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-slate-900/5"
        role="dialog"
        aria-labelledby="chat-widget-title"
      >
        <p id="chat-widget-title" class="text-sm font-semibold text-slate-900" data-i18n-key="chat.title">Asistente</p>
        <p class="mt-2 text-sm text-slate-600" data-i18n-key="chat.stub">En este entorno de demostración el chat es una vista previa estática.</p>
        <button
          type="button"
          class="mt-3 text-sm font-medium text-[color:var(--brand-primary)] hover:underline"
          data-chat-close
          data-i18n-key="chat.close"
        >Cerrar</button>
      </div>
      <button
        type="button"
        class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--brand-primary)] text-white shadow-lg transition hover:bg-[color:var(--brand-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-primary)]"
        data-chat-toggle
        aria-expanded="false"
        aria-controls="chat-widget-panel"
        data-i18n-key="chat.open"
        data-i18n-attr="aria-label"
        aria-label="Abrir chat"
      >
        <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  `;

  const toggle = mount.querySelector('[data-chat-toggle]');
  const panel = mount.querySelector('#chat-widget-panel');
  const closeBtn = mount.querySelector('[data-chat-close]');

  function setOpen(/** @type {boolean} */ open) {
    if (panel instanceof HTMLElement) panel.classList.toggle('hidden', !open);
    if (toggle instanceof HTMLButtonElement) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  if (toggle instanceof HTMLButtonElement) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
    });
  }
  if (closeBtn instanceof HTMLButtonElement) {
    closeBtn.addEventListener('click', () => setOpen(false));
  }

  if (typeof scriptUrl === 'string' && scriptUrl.trim() !== '') {
    const existing = doc.querySelector(`script[data-chat-external="true"]`);
    if (!existing) {
      const s = doc.createElement('script');
      s.src = scriptUrl;
      s.async = true;
      s.dataset.chatExternal = 'true';
      doc.head.appendChild(s);
    }
  }
}
