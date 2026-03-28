/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initNav } from './nav.js';

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
});
