/** @vitest-environment jsdom */

import { describe, expect, it, vi } from 'vitest';
import { initContactForm, validateContactInput } from './contact-form.js';

function tEs(key) {
  const map = {
    'contact.validation.nameRequired': 'Indica tu nombre.',
    'contact.validation.emailRequired': 'Indica un correo electrónico.',
    'contact.validation.emailInvalid': 'El correo no tiene un formato válido.',
    'contact.validation.messageRequired': 'Escribe un mensaje.',
    'contact.success': 'ok',
    'contact.successPoc': 'poc',
    'contact.errorNetwork': 'net',
    'contact.errorHttp': 'http',
  };
  return map[/** @type {keyof typeof map} */ (key)] ?? key;
}

describe('validateContactInput', () => {
  it('rejects empty fields', () => {
    const r = validateContactInput({ name: '', email: '', message: '' }, tEs);
    expect(r.ok).toBe(false);
    expect(r.errors.name).toBeDefined();
    expect(r.errors.email).toBeDefined();
    expect(r.errors.message).toBeDefined();
  });

  it('rejects invalid email', () => {
    const r = validateContactInput({ name: 'A', email: 'bad', message: 'Hi' }, tEs);
    expect(r.ok).toBe(false);
    expect(r.errors.email).toBeDefined();
  });

  it('accepts valid payload', () => {
    const r = validateContactInput(
      { name: ' Ana ', email: 'a@b.co', message: ' Hola ' },
      tEs,
    );
    expect(r.ok).toBe(true);
    expect(Object.keys(r.errors).length).toBe(0);
  });
});

describe('initContactForm', () => {
  it('shows field errors on invalid submit', () => {
    document.body.innerHTML = `
      <div id="contacto">
        <form id="contact-form" action="#" method="post" novalidate>
          <p id="contact-form-status" class="hidden" role="status"></p>
          <input id="contact-name" name="name" value="" />
          <input id="contact-email" name="email" value="" />
          <textarea id="contact-message" name="message"></textarea>
          <p id="contact-name-error" class="hidden" data-contact-error="name"></p>
          <p id="contact-email-error" class="hidden" data-contact-error="email"></p>
          <p id="contact-message-error" class="hidden" data-contact-error="message"></p>
          <button type="submit">Go</button>
        </form>
      </div>`;

    initContactForm(document.body, { t: tEs });
    const form = document.getElementById('contact-form');
    if (!(form instanceof HTMLFormElement)) throw new Error('fixture');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const nameErr = document.querySelector('[data-contact-error="name"]');
    expect(nameErr?.textContent).toBe('Indica tu nombre.');
    expect(nameErr?.classList.contains('hidden')).toBe(false);
  });

  it('posts JSON when submitUrl is set and shows success', async () => {
    document.body.innerHTML = `
      <div>
        <form id="contact-form" action="#" method="post" novalidate>
          <p id="contact-form-status" class="hidden" role="status"></p>
          <input id="contact-name" name="name" value="Ana" />
          <input id="contact-email" name="email" value="ana@example.com" />
          <textarea id="contact-message" name="message">Hola</textarea>
          <p class="hidden" data-contact-error="name"></p>
          <p class="hidden" data-contact-error="email"></p>
          <p class="hidden" data-contact-error="message"></p>
          <button type="submit">Go</button>
        </form>
      </div>`;

    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    initContactForm(document.body, {
      t: tEs,
      submitUrl: 'https://api.example.com/contact',
      fetchFn,
      executeRecaptcha: async () => 'tok',
      recaptchaSiteKey: 'test-key',
    });

    const form = document.getElementById('contact-form');
    if (!(form instanceof HTMLFormElement)) throw new Error('fixture');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => expect(fetchFn).toHaveBeenCalled());
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe('https://api.example.com/contact');
    expect(init?.method).toBe('POST');
    const body = JSON.parse(String(init?.body));
    expect(body.name).toBe('Ana');
    expect(body.email).toBe('ana@example.com');
    expect(body.message).toBe('Hola');
    expect(body.recaptchaToken).toBe('tok');

    await vi.waitFor(() => {
      expect(document.getElementById('contact-form-status')?.textContent).toBe('ok');
    });
  });

  it('uses PoC success when no submitUrl', async () => {
    document.body.innerHTML = `
      <div>
        <form id="contact-form" action="#" method="post" novalidate>
          <p id="contact-form-status" class="hidden text-sm font-medium" role="status"></p>
          <input id="contact-name" name="name" value="Ana" />
          <input id="contact-email" name="email" value="ana@example.com" />
          <textarea id="contact-message" name="message">Hola</textarea>
          <p class="hidden" data-contact-error="name"></p>
          <p class="hidden" data-contact-error="email"></p>
          <p class="hidden" data-contact-error="message"></p>
          <button type="submit">Go</button>
        </form>
      </div>`;

    initContactForm(document.body, {
      t: tEs,
      submitUrl: '',
      executeRecaptcha: async () => 'tok',
      recaptchaSiteKey: 'k',
    });

    const form = document.getElementById('contact-form');
    if (!(form instanceof HTMLFormElement)) throw new Error('fixture');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      const st = document.getElementById('contact-form-status');
      expect(st?.textContent).toBe('poc');
    });
  });
});
