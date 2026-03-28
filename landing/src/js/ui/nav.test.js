/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initNav, syncNavToggleAria } from './nav.js';

function mockMatchMedia(matches) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

/** @returns {{ setMatches: (m: boolean) => void }} */
function mockMatchMediaWithListeners(initialMatches) {
  let matches = initialMatches;
  /** @type {((ev: { matches: boolean }) => void)[]} */
  const listeners = [];
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_evt, cb) => {
        listeners.push(cb);
      },
      removeEventListener: vi.fn(),
    })),
  });
  return {
    setMatches(m) {
      matches = m;
      listeners.forEach((cb) => cb({ matches: m }));
    },
  };
}

describe('syncNavToggleAria', () => {
  it('sets aria-label from translate when collapsed', () => {
    document.body.innerHTML = `
      <header>
        <button type="button" data-nav-toggle aria-expanded="false"></button>
      </header>`;
    const header = document.querySelector('header');
    if (!header) throw new Error('fixture');
    syncNavToggleAria(header, (k) => (k === 'nav.openMenu' ? 'Open' : 'Close'));
    const toggle = document.querySelector('[data-nav-toggle]');
    expect(toggle?.getAttribute('aria-label')).toBe('Open');
  });

  it('no-ops when toggle is missing', () => {
    document.body.innerHTML = '<header></header>';
    const header = document.querySelector('header');
    if (!header) throw new Error('fixture');
    expect(() => syncNavToggleAria(header, () => 'x')).not.toThrow();
  });
});

describe('initNav', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header>
        <button type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav-panel"></button>
        <div id="site-nav-panel" data-nav-panel class="flex flex-col max-md:hidden"></div>
      </header>`;
  });

  it('opens and closes the mobile panel', () => {
    mockMatchMedia(false);
    const header = document.querySelector('header');
    const toggle = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-nav-panel]');
    if (!header || !toggle || !panel) throw new Error('fixture');

    initNav(header);

    expect(panel.classList.contains('max-md:hidden')).toBe(true);
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(panel.classList.contains('max-md:hidden')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(panel.classList.contains('max-md:hidden')).toBe(true);
  });

  it('does not toggle when viewport is desktop width', () => {
    mockMatchMedia(true);
    const header = document.querySelector('header');
    const toggle = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-nav-panel]');
    if (!header || !toggle || !panel) throw new Error('fixture');

    initNav(header);
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('uses t() for aria-labels when provided', () => {
    mockMatchMedia(false);
    const header = document.querySelector('header');
    const toggle = document.querySelector('[data-nav-toggle]');
    if (!header || !toggle) throw new Error('fixture');

    initNav(header, {
      t: (key) => (key === 'nav.openMenu' ? 'OPEN_MENU' : 'CLOSE_MENU'),
    });
    expect(toggle.getAttribute('aria-label')).toBe('OPEN_MENU');
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(toggle.getAttribute('aria-label')).toBe('CLOSE_MENU');
  });

  it('uses Spanish defaults when t is omitted', () => {
    mockMatchMedia(false);
    const header = document.querySelector('header');
    const toggle = document.querySelector('[data-nav-toggle]');
    if (!header || !toggle) throw new Error('fixture');

    initNav(header);
    expect(toggle.getAttribute('aria-label')).toBe('Abrir menú');
  });

  it('closes panel when a hash link is clicked on mobile', () => {
    mockMatchMedia(false);
    document.body.innerHTML = `
      <header>
        <button type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav-panel"></button>
        <div id="site-nav-panel" data-nav-panel class="flex flex-col max-md:hidden">
          <a href="#section">Go</a>
        </div>
      </header>`;
    const header = document.querySelector('header');
    const panel = document.querySelector('[data-nav-panel]');
    const link = document.querySelector('a');
    if (!header || !panel || !link) throw new Error('fixture');

    initNav(header);
    const toggle = document.querySelector('[data-nav-toggle]');
    toggle?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(panel.classList.contains('max-md:hidden')).toBe(false);
    link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(panel.classList.contains('max-md:hidden')).toBe(true);
  });

  it('runs syncLayout when matchMedia changes', () => {
    const { setMatches } = mockMatchMediaWithListeners(false);
    const header = document.querySelector('header');
    const panel = document.querySelector('[data-nav-panel]');
    if (!header || !panel) throw new Error('fixture');

    initNav(header);
    setMatches(true);
    expect(panel.classList.contains('max-md:hidden')).toBe(false);
  });
});
