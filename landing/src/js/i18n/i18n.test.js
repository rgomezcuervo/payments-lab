/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  announceLocaleChange,
  applyI18nToDom,
  initI18nController,
  persistLocaleToStorage,
  persistLocaleToUrl,
  resolveMessage,
  t,
} from './i18n.js';

describe('resolveMessage', () => {
  it('resolves nested keys', () => {
    expect(resolveMessage({ nav: { brand: 'X' } }, 'nav.brand')).toBe('X');
  });

  it('returns undefined for missing keys', () => {
    expect(resolveMessage({ nav: {} }, 'nav.missing')).toBeUndefined();
  });

  it('returns undefined when path hits non-object', () => {
    expect(resolveMessage({ nav: 'string' }, 'nav.brand')).toBeUndefined();
  });
});

describe('t', () => {
  it('returns Spanish string for es', () => {
    expect(t('es', 'nav.services')).toBe('Servicios');
  });

  it('returns English string for en', () => {
    expect(t('en', 'nav.services')).toBe('Services');
  });

  it('falls back to key when missing', () => {
    expect(t('es', 'totally.missing.key')).toBe('totally.missing.key');
  });
});

describe('applyI18nToDom', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '<body><p data-i18n-key="nav.services"></p></body>';
  });

  it('sets textContent from locale', () => {
    applyI18nToDom(document, 'en');
    const p = document.querySelector('p');
    expect(p?.textContent).toBe('Services');
    expect(document.documentElement.lang).toBe('en');
  });

  it('sets attribute when data-i18n-attr is present', () => {
    document.body.innerHTML = '<button type="button" data-i18n-key="banners.prev" data-i18n-attr="aria-label"></button>';
    applyI18nToDom(document, 'en');
    const btn = document.querySelector('button');
    expect(btn?.getAttribute('aria-label')).toBe('Previous');
  });

  it('updates lang when root is an Element', () => {
    document.body.innerHTML = '<div id="sub"><span data-i18n-key="nav.faq"></span></div>';
    const sub = document.getElementById('sub');
    if (!sub) throw new Error('fixture');
    applyI18nToDom(sub, 'es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('skips nodes when message is missing', () => {
    document.body.innerHTML = '<p data-i18n-key="nonexistent.key.xyz">keep</p>';
    applyI18nToDom(document, 'es');
    expect(document.querySelector('p')?.textContent).toBe('keep');
  });
});

describe('announceLocaleChange', () => {
  it('does nothing when liveRegion is null', () => {
    announceLocaleChange('es', null);
  });

  it('writes status message to live region', () => {
    const live = document.createElement('div');
    announceLocaleChange('en', live);
    expect(live.textContent).toBe('Language changed to English');
  });
});

describe('persistLocaleToUrl', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates search param lang', () => {
    const replaceState = vi.fn();
    vi.stubGlobal('history', { replaceState });
    persistLocaleToUrl('en', {
      href: 'https://example.test/foo?x=1#h',
    });
    expect(replaceState).toHaveBeenCalledWith({}, '', expect.stringContaining('lang=en'));
  });

  it('is a no-op without href', () => {
    const replaceState = vi.fn();
    vi.stubGlobal('history', { replaceState });
    persistLocaleToUrl('es', { href: '' });
    expect(replaceState).not.toHaveBeenCalled();
  });
});

describe('persistLocaleToStorage', () => {
  it('ignores storage errors', () => {
    const setItem = vi.fn(() => {
      throw new Error('disabled');
    });
    vi.stubGlobal('localStorage', { setItem });
    expect(() => persistLocaleToStorage('en')).not.toThrow();
    vi.unstubAllGlobals();
  });
});

describe('initI18nController', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = `
      <body>
        <div id="i18n-live"></div>
        <select id="lang-select"><option value="es">Español</option><option value="en">English</option></select>
        <p data-i18n-key="nav.services"></p>
      </body>`;
  });

  it('falls back to es for unsupported initialLocale', () => {
    const ctrl = initI18nController({
      document,
      initialLocale: /** @type {'es'} */ ('xx'),
    });
    expect(ctrl.getLocale()).toBe('es');
  });

  it('setLocale ignores invalid locale', () => {
    const ctrl = initI18nController({ document, initialLocale: 'es' });
    ctrl.setLocale(/** @type {'es'} */ ('xx'));
    expect(ctrl.getLocale()).toBe('es');
  });

  it('setLocale syncs selects marked with data-lang-select', () => {
    document.documentElement.innerHTML = `
      <body>
        <div id="i18n-live"></div>
        <select data-lang-select><option value="es">Español</option><option value="en">English</option></select>
        <p data-i18n-key="nav.services"></p>
      </body>`;
    const ctrl = initI18nController({ document, initialLocale: 'es' });
    ctrl.setLocale('en');
    const sel = document.querySelector('[data-lang-select]');
    expect(sel instanceof HTMLSelectElement && sel.value).toBe('en');
  });

  it('t() returns strings for the active locale', () => {
    const ctrl = initI18nController({ document, initialLocale: 'en' });
    expect(ctrl.t('nav.services')).toBe('Services');
  });

  it('setLocale updates DOM, select, and invokes onLocaleChange', () => {
    const onLocaleChange = vi.fn();
    const ctrl = initI18nController({
      document,
      initialLocale: 'es',
      onLocaleChange,
    });
    ctrl.setLocale('en');
    expect(ctrl.getLocale()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    const sel = document.getElementById('lang-select');
    expect(sel instanceof HTMLSelectElement && sel.value).toBe('en');
    expect(document.querySelector('p')?.textContent).toBe('Services');
    expect(onLocaleChange).toHaveBeenCalledWith('en');
  });

  it('subscribe receives locale from custom event', () => {
    const ctrl = initI18nController({ document, initialLocale: 'es' });
    const fn = vi.fn();
    const unsub = ctrl.subscribe(fn);
    ctrl.setLocale('en');
    expect(fn).toHaveBeenCalledWith('en');
    unsub();
    ctrl.setLocale('es');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('subscribe ignores non-matching events', () => {
    const ctrl = initI18nController({ document, initialLocale: 'es' });
    const fn = vi.fn();
    ctrl.subscribe(fn);
    document.dispatchEvent(new Event('landing:locale-change'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('bindLanguageSelect wires change to setLocale', () => {
    const ctrl = initI18nController({ document, initialLocale: 'es' });
    ctrl.bindLanguageSelect();
    const sel = document.getElementById('lang-select');
    if (!(sel instanceof HTMLSelectElement)) throw new Error('fixture');
    sel.value = 'en';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    expect(ctrl.getLocale()).toBe('en');
  });

  it('bindLanguageSelect does nothing when select is missing', () => {
    document.body.innerHTML = '<p data-i18n-key="nav.services"></p>';
    const ctrl = initI18nController({ document, initialLocale: 'es' });
    expect(() => ctrl.bindLanguageSelect()).not.toThrow();
  });
});
