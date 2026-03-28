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

  it('returns empty array for non-array input', () => {
    expect(filterActiveBannerItems(/** @type {unknown} */ (null))).toEqual([]);
  });

  it('keeps items when date bounds parse to NaN', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    const out = filterActiveBannerItems([{ title: 'X', validFrom: 'not-a-date', validUntil: 'also-bad' }], now);
    expect(out.length).toBe(1);
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

  it('does not replace carousel when cmsReplacedSlot is true', () => {
    document.body.innerHTML = `
      <section id="banners">
        <div data-banner-root data-cms-slot="banner-list"><p id="cms-mark">cms</p></div>
      </section>`;
    initBanners(document, {
      enabled: true,
      cmsReplacedSlot: true,
      bannerItems: [{ title: 'T', body: 'B', tag: 'x' }],
      sectionRoot: document.body,
    });
    expect(document.getElementById('cms-mark')).toBeTruthy();
    expect(document.querySelector('[data-carousel-slide]')).toBeNull();
  });

  it('hides section when list is provided but empty after date filter', () => {
    document.body.innerHTML = '<section id="banners"><div data-banner-root></div></section>';
    initBanners(document, {
      enabled: true,
      cmsReplacedSlot: false,
      bannerItems: [{ title: 'Old', validUntil: '2020-01-01' }],
      sectionRoot: document.body,
    });
    const s = document.getElementById('banners');
    expect(s?.hidden).toBe(true);
  });

  it('renders slide with href and image when provided', () => {
    document.body.innerHTML = `
      <section id="banners">
        <div data-banner-root></div>
      </section>`;
    initBanners(document, {
      enabled: true,
      bannerItems: [
        {
          title: 'T',
          body: 'B',
          tag: 'x',
          href: 'https://example.com/p',
          imageUrl: 'https://example.com/i.jpg',
        },
      ],
      sectionRoot: document.body,
    });
    expect(document.querySelector('[data-carousel-slide] a[href="https://example.com/p"]')).toBeTruthy();
    expect(document.querySelector('img[src="https://example.com/i.jpg"]')).toBeTruthy();
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

  it('uses i18n keys when titleKey is set', () => {
    document.body.innerHTML = `
      <div>
        <div data-banner-carousel data-carousel="banners">
          <div data-carousel-track></div>
          <div data-carousel-dots></div>
        </div>
      </div>`;
    const root = document.body.firstElementChild;
    if (!root) throw new Error('fixture');
    renderBannerCarousel(root, [{ titleKey: 'banner.1.title', bodyKey: 'banner.1.body', tagKey: 'banner.1.tag' }]);
    const slide = root.querySelector('[data-carousel-slide]');
    expect(slide?.querySelector('[data-i18n-key="banner.1.title"]')).toBeTruthy();
  });
});
