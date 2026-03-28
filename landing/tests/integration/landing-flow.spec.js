/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountLanding } from '../../src/js/main.js';

function seedLandingDom() {
  document.documentElement.lang = 'es';
  document.documentElement.setAttribute('data-brand', 'default');
  document.head.innerHTML = `
    <title>Plataforma</title>
    <meta id="meta-description" content="" />
    <meta id="meta-og-title" content="" />
    <meta id="meta-og-desc" content="" />
    <meta id="meta-og-url" content="" />
    <meta id="meta-og-locale" content="" />
    <meta id="meta-tw-title" content="" />
    <meta id="meta-tw-desc" content="" />
    <meta id="meta-og-image" content="" />
    <link id="link-canonical" rel="canonical" href="" />
    <script type="application/ld+json" id="json-ld-landing" data-seo-jsonld>{}</script>
  `;
  document.body.innerHTML = `
    <div id="i18n-live" class="sr-only" role="status" aria-live="polite"></div>
    <a class="skip-link" href="#main-content">Skip</a>
    <div id="landing-shell" class="flex min-h-screen flex-col">
      <header id="site-header"></header>
      <header id="clean-mode-header" class="hidden"></header>
      <main id="main-content"></main>
      <div id="clean-mode-mount" class="hidden"></div>
    </div>
    <footer id="site-footer"></footer>
    <div id="chat-widget-root"></div>
  `;
}

beforeEach(() => {
  seedLandingDom();
  try {
    globalThis.localStorage?.clear();
  } catch {
    // ignore
  }
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  });
});

describe('landing integration (jsdom)', () => {
  it('mounts shell and switches language via selector', async () => {
    await mountLanding();
    const sel = document.querySelector('[data-lang-select]');
    expect(sel).toBeTruthy();
    if (!(sel instanceof HTMLSelectElement)) throw new Error('expected lang select');
    sel.value = 'en';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.documentElement.lang).toBe('en');
  });

  it('opens mobile nav when menu toggle is activated', async () => {
    await mountLanding();
    const toggle = document.querySelector('[data-nav-toggle]');
    if (!(toggle instanceof HTMLButtonElement)) throw new Error('missing nav toggle');
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('expands a FAQ panel when its trigger is activated', async () => {
    await mountLanding();
    const trigger = document.querySelector('[data-faq-trigger]');
    if (!(trigger instanceof HTMLButtonElement)) throw new Error('missing FAQ trigger');
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles clean mode from the header control', async () => {
    await mountLanding();
    const cleanToggle = document.querySelector('[data-clean-mode-toggle]');
    if (!(cleanToggle instanceof HTMLButtonElement)) throw new Error('missing clean-mode toggle');
    expect(cleanToggle.hidden).toBe(false);
    cleanToggle.click();
    expect(document.body.classList.contains('clean-mode')).toBe(true);
    cleanToggle.click();
    expect(document.body.classList.contains('clean-mode')).toBe(false);
  });
});
