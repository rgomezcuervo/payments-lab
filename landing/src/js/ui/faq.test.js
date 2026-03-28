/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { initFaqAccordion } from './faq.js';

describe('initFaqAccordion', () => {
  it('toggles panels and aria-expanded', () => {
    document.body.innerHTML = `
      <div>
        <div data-faq-item>
          <button type="button" data-faq-trigger aria-expanded="false" aria-controls="p1" id="t1"></button>
          <div id="p1" class="hidden" data-faq-panel></div>
        </div>
        <div data-faq-item>
          <button type="button" data-faq-trigger aria-expanded="false" aria-controls="p2" id="t2"></button>
          <div id="p2" class="hidden" data-faq-panel></div>
        </div>
      </div>`;

    const root = document.body.firstElementChild;
    if (!root) throw new Error('fixture');

    initFaqAccordion(root);

    const t1 = document.getElementById('t1');
    const p1 = document.getElementById('p1');
    if (!t1 || !p1) throw new Error('fixture');

    t1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(t1.getAttribute('aria-expanded')).toBe('true');
    expect(p1.classList.contains('hidden')).toBe(false);

    t1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(t1.getAttribute('aria-expanded')).toBe('false');
    expect(p1.classList.contains('hidden')).toBe(true);
  });
});
