/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { initCarousel } from './testimonials.js';

describe('initCarousel', () => {
  it('advances slides when clicking next', () => {
    document.body.innerHTML = `
      <div data-carousel>
        <div id="t-track" data-carousel-track style="transform: translateX(0)">
          <div data-carousel-slide>a</div>
          <div data-carousel-slide>b</div>
        </div>
        <button type="button" data-carousel-next aria-controls="t-track">next</button>
        <div data-carousel-dots></div>
      </div>`;

    const root = document.querySelector('[data-carousel]');
    const track = document.getElementById('t-track');
    const next = document.querySelector('[data-carousel-next]');
    if (!root || !track || !next) throw new Error('fixture');

    initCarousel(root);

    next.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(track.style.transform).toContain('-100%');
  });
});
