/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { filterActiveBannerItems, initBanners, renderBannerCarousel } from './banners.js';

describe('filterActiveBannerItems', () => {
  it('filters by validFrom and validUntil', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    const items = [
      { title: 'A', validUntil: '2026-01-01' },
      { title: 'B', validFrom: '2026-06-01', validUntil: '2026-12-31' },
      { title: 'C', validFrom: '2027-01-01' },
    ];
    const out = filterActiveBannerItems(items, now);
    expect(out.map((x) => x.title)).toEqual(['B']);
  });
});

describe('initBanners', () => {
  it('hides section when disabled', () => {
    document.body.innerHTML = '<section id="banners"><div data-banner-root></div></section>';
    initBanners(document, { enabled: false, bannerItems: [], sectionRoot: document.body });
    const s = document.getElementById('banners');
    expect(s?.hidden).toBe(true);
  });

  it('renders slides from bannerItems', () => {
    document.body.innerHTML = `
      <section id="banners">
        <div id="cms-banners" data-banner-root data-cms-slot="banner-list"></div>
      </section>`;
    initBanners(document, {
      enabled: true,
      cmsReplacedSlot: false,
      bannerItems: [{ title: 'T', body: 'B', tag: 'x' }],
      sectionRoot: document.body,
    });
    expect(document.querySelector('[data-carousel-slide]')?.textContent).toContain('T');
  });
});

describe('renderBannerCarousel', () => {
  it('fills track and inits carousel host', () => {
    document.body.innerHTML = `
      <div>
        <div data-banner-carousel data-carousel="banners">
          <div data-carousel-track></div>
          <div data-carousel-dots></div>
        </div>
      </div>`;
    const root = document.body.firstElementChild;
    if (!root) throw new Error('fixture');
    renderBannerCarousel(root, [{ title: 'X', body: 'Y', tag: 'z' }]);
    expect(root.querySelectorAll('[data-carousel-slide]').length).toBe(1);
  });
});
