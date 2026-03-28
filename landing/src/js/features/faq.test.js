/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { initFaqAccordion } from './faq.js';

describe('initFaqAccordion', () => {
  it('moves focus with ArrowDown, ArrowUp, Home and End', () => {
    document.body.innerHTML = `
      <div>
        <div data-faq-item>
          <button type="button" data-faq-trigger id="t1" aria-controls="p1"></button>
          <div id="p1" class="hidden" data-faq-panel></div>
        </div>
        <div data-faq-item>
          <button type="button" data-faq-trigger id="t2" aria-controls="p2"></button>
          <div id="p2" class="hidden" data-faq-panel></div>
        </div>
        <div data-faq-item>
          <button type="button" data-faq-trigger id="t3" aria-controls="p3"></button>
          <div id="p3" class="hidden" data-faq-panel></div>
        </div>
      </div>`;

    const root = document.body.firstElementChild;
    if (!root) throw new Error('fixture');

    initFaqAccordion(root);

    const t1 = document.getElementById('t1');
    const t2 = document.getElementById('t2');
    const t3 = document.getElementById('t3');
    if (!t1 || !t2 || !t3) throw new Error('fixture');

    t1.focus();
    t1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(t2);

    t2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(t1);

    t2.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(t3);

    t3.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(t1);

    t3.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(t1);

    t1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(t3);
  });

  it('ignores keydown when event is not a KeyboardEvent', () => {
    document.body.innerHTML = `
      <div>
        <div data-faq-item>
          <button type="button" data-faq-trigger id="t1"></button>
          <div class="hidden" data-faq-panel></div>
        </div>
      </div>`;

    const root = document.body.firstElementChild;
    if (!root) throw new Error('fixture');
    initFaqAccordion(root);

    const t1 = document.getElementById('t1');
    if (!(t1 instanceof HTMLElement)) throw new Error('fixture');

    t1.focus();
    const ev = new Event('keydown', { bubbles: true });
    t1.dispatchEvent(ev);
    expect(document.activeElement).toBe(t1);
  });

  it('toggles faq icon rotation when opening and closing', () => {
    document.body.innerHTML = `
      <div>
        <div data-faq-item>
          <button type="button" data-faq-trigger id="t1"></button>
          <span data-faq-icon class="faq-chevron" id="ic"></span>
          <div class="hidden" data-faq-panel id="p1"></div>
        </div>
      </div>`;

    const root = document.body.firstElementChild;
    if (!root) throw new Error('fixture');
    initFaqAccordion(root);

    const t1 = document.getElementById('t1');
    const ic = document.getElementById('ic');
    if (!t1 || !ic) throw new Error('fixture');

    t1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ic.classList.contains('rotate-180')).toBe(true);

    t1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ic.classList.contains('rotate-180')).toBe(false);
  });

  it('skips items without a button trigger', () => {
    document.body.innerHTML = `
      <div>
        <div data-faq-item>
          <div data-faq-trigger id="bad">not a button</div>
          <div data-faq-panel></div>
        </div>
        <div data-faq-item>
          <button type="button" data-faq-trigger id="ok"></button>
          <div class="hidden" data-faq-panel id="pok"></div>
        </div>
      </div>`;

    const root = document.body.firstElementChild;
    if (!root) throw new Error('fixture');

    expect(() => initFaqAccordion(root)).not.toThrow();

    const ok = document.getElementById('ok');
    const pok = document.getElementById('pok');
    if (!ok || !pok) throw new Error('fixture');

    ok.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ok.getAttribute('aria-expanded')).toBe('true');
    expect(pok.classList.contains('hidden')).toBe(false);
  });

  it('closes other panels when opening one (accordion behavior)', () => {
    document.body.innerHTML = `
      <div>
        <div data-faq-item>
          <button type="button" data-faq-trigger id="a"></button>
          <div class="hidden" data-faq-panel id="pa"></div>
        </div>
        <div data-faq-item>
          <button type="button" data-faq-trigger id="b"></button>
          <div class="hidden" data-faq-panel id="pb"></div>
        </div>
      </div>`;

    const root = document.body.firstElementChild;
    if (!root) throw new Error('fixture');
    initFaqAccordion(root);

    const a = document.getElementById('a');
    const b = document.getElementById('b');
    const pa = document.getElementById('pa');
    const pb = document.getElementById('pb');
    if (!a || !b || !pa || !pb) throw new Error('fixture');

    a.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(pa.classList.contains('hidden')).toBe(false);

    b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(pa.classList.contains('hidden')).toBe(true);
    expect(pb.classList.contains('hidden')).toBe(false);
  });
});
