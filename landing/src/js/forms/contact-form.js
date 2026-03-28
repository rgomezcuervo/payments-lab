/** Evento emitido por `initI18nController` al cambiar idioma (debe coincidir con `i18n.js`). */
const LOCALE_CHANGE_EVENT = 'landing:locale-change';

/** @type {Map<string, Promise<void>>} */
const recaptchaLoadPromises = new Map();

/**
 * @param {{ name?: string, email?: string, message?: string }} values
 * @param {(key: string) => string} t
 * @returns {{ ok: boolean, errors: Partial<Record<'name' | 'email' | 'message', string>> }}
 */
export function validateContactInput(values, t) {
  const name = (values.name ?? '').trim();
  const email = (values.email ?? '').trim();
  const message = (values.message ?? '').trim();
  /** @type {Partial<Record<'name' | 'email' | 'message', string>>} */
  const errors = {};

  if (!name) errors.name = t('contact.validation.nameRequired');
  if (!email) errors.email = t('contact.validation.emailRequired');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('contact.validation.emailInvalid');
  if (!message) errors.message = t('contact.validation.messageRequired');

  return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * @param {string} siteKey
 * @param {Window & { grecaptcha?: { ready: (cb: () => void) => void; execute: (k: string, o: { action: string }) => Promise<string> } }} win
 * @returns {Promise<void>}
 */
function ensureRecaptchaV3(siteKey, win) {
  let p = recaptchaLoadPromises.get(siteKey);
  if (p) return p;

  p = new Promise((resolve, reject) => {
    if (win.grecaptcha?.execute) {
      win.grecaptcha.ready(() => resolve());
      return;
    }
    const s = win.document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    s.async = true;
    s.defer = true;
    s.dataset.recaptchaSite = siteKey;
    s.addEventListener('load', () => {
      if (win.grecaptcha?.ready) win.grecaptcha.ready(() => resolve());
      else reject(new Error('recaptcha'));
    });
    s.addEventListener('error', () => reject(new Error('recaptcha')));
    win.document.head.appendChild(s);
  });
  recaptchaLoadPromises.set(siteKey, p);
  return p;
}

/**
 * @param {object} options
 * @param {ParentNode} options.root
 * @param {(key: string) => string} options.t
 * @param {string} [options.submitUrl] URL del backend que verifica el token y persiste el lead (vacío = solo validación cliente + mensaje PoC).
 * @param {string} [options.recaptchaSiteKey] Site key pública reCAPTCHA v3 (`VITE_RECAPTCHA_SITE_KEY`).
 * @param {typeof fetch} [options.fetchFn]
 * @param {(siteKey: string, action: string) => Promise<string>} [options.executeRecaptcha] Inyección para tests o entornos sin script de Google.
 */
export function initContactForm(root, options) {
  const { t, submitUrl = '', recaptchaSiteKey = '', fetchFn = fetch } = options;
  const form = root.querySelector('#contact-form');
  if (!(form instanceof HTMLFormElement)) return () => {};

  const recaptchaHint = root.querySelector('[data-contact-recaptcha-hint]');
  if (recaptchaHint instanceof HTMLElement && recaptchaSiteKey) recaptchaHint.classList.remove('hidden');

  const statusEl = root.querySelector('#contact-form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  /** @param {Partial<Record<'name' | 'email' | 'message', string>>} errs */
  function showFieldErrors(errs) {
    form.querySelectorAll('[data-contact-error]').forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const field = node.getAttribute('data-contact-error');
      if (field !== 'name' && field !== 'email' && field !== 'message') return;
      const msg = errs[field];
      if (msg) {
        node.textContent = msg;
        node.classList.remove('hidden');
      } else {
        node.textContent = '';
        node.classList.add('hidden');
      }
    });

    (['name', 'email', 'message']).forEach((field) => {
      const id =
        field === 'name' ? 'contact-name' : field === 'email' ? 'contact-email' : 'contact-message';
      const input = form.querySelector(`#${id}`);
      if (!(input instanceof HTMLElement)) return;
      const err = errs[/** @type {'name' | 'email' | 'message'} */ (field)];
      if (err) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', `${id}-error`);
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    });
  }

  function clearStatus() {
    if (statusEl instanceof HTMLElement) {
      statusEl.textContent = '';
      statusEl.classList.add('hidden');
      statusEl.classList.remove('text-emerald-700', 'text-red-600');
    }
  }

  function clearErrors() {
    showFieldErrors({});
  }

  /** @param {string} message @param {'ok' | 'err'} kind */
  function setStatus(message, kind) {
    if (!(statusEl instanceof HTMLElement)) return;
    statusEl.classList.remove('hidden');
    statusEl.textContent = message;
    statusEl.classList.toggle('text-emerald-700', kind === 'ok');
    statusEl.classList.toggle('text-red-600', kind === 'err');
  }

  /** @param {boolean} busy */
  function setBusy(busy) {
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = busy;
  }

  /** @param {SubmitEvent} e */
  async function onSubmit(e) {
    e.preventDefault();
    clearStatus();
    clearErrors();

    const fd = new FormData(form);
    const name = String(fd.get('name') ?? '');
    const email = String(fd.get('email') ?? '');
    const message = String(fd.get('message') ?? '');

    const { ok, errors } = validateContactInput({ name, email, message }, t);
    if (!ok) {
      showFieldErrors(errors);
      return;
    }

    setBusy(true);
    /** @type {string | undefined} */
    let recaptchaToken;
    try {
      if (recaptchaSiteKey) {
        const win = /** @type {Window & { grecaptcha?: { ready: (cb: () => void) => void; execute: (k: string, o: { action: string }) => Promise<string> } }} */ (
          form.ownerDocument.defaultView ?? globalThis
        );
        if (options.executeRecaptcha) {
          recaptchaToken = await options.executeRecaptcha(recaptchaSiteKey, 'contact_submit');
        } else {
          await ensureRecaptchaV3(recaptchaSiteKey, win);
          if (!win.grecaptcha?.execute) throw new Error('recaptcha');
          recaptchaToken = await win.grecaptcha.execute(recaptchaSiteKey, { action: 'contact_submit' });
        }
      }

      const payload = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        ...(recaptchaToken ? { recaptchaToken } : {}),
      };

      if (submitUrl && submitUrl !== '#') {
        const res = await fetchFn(submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setStatus(t('contact.errorHttp'), 'err');
          return;
        }
        setStatus(t('contact.success'), 'ok');
        form.reset();
        clearErrors();
        return;
      }

      setStatus(t('contact.successPoc'), 'ok');
      form.reset();
      clearErrors();
    } catch {
      setStatus(t('contact.errorNetwork'), 'err');
    } finally {
      setBusy(false);
    }
  }

  form.addEventListener('submit', onSubmit);

  function onLocaleChange() {
    clearErrors();
    clearStatus();
  }

  root.ownerDocument.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);

  return () => {
    form.removeEventListener('submit', onSubmit);
    root.ownerDocument.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
  };
}
