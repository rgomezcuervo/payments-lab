/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindGtmCtaListeners, ensureDataLayer, loadGtm, pushDataLayerEvent } from './gtm.js';

describe('gtm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.dataLayer;
  });

  it('ensureDataLayer creates an array on window', () => {
    const dl = ensureDataLayer();
    expect(Array.isArray(dl)).toBe(true);
    expect(globalThis.dataLayer).toBe(dl);
  });

  it('pushDataLayerEvent appends with event name', () => {
    pushDataLayerEvent('landing_cta_pay', { href: '#x' });
    expect(globalThis.dataLayer?.pop()).toEqual({ event: 'landing_cta_pay', href: '#x' });
  });

  it('loadGtm injects script with idle callback', () => {
    const doc = document;
    const ric = vi.fn((cb) => {
      cb();
    });
    loadGtm('GTM-ABC12', doc, { requestIdleCallback: ric, setTimeout: globalThis.setTimeout });
    expect(ric).toHaveBeenCalled();
    const scripts = doc.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]');
    expect(scripts.length).toBeGreaterThan(0);
    expect(scripts[0].src).toContain('GTM-ABC12');
  });

  it('loadGtm falls back to setTimeout when no requestIdleCallback', () => {
    const doc = document;
    const st = vi.fn((cb) => {
      cb();
    });
    loadGtm('GTM-XYZ99', doc, { setTimeout: st });
    expect(st).toHaveBeenCalled();
  });

  it('bindGtmCtaListeners pushes landing_* on data-gtm-event click', () => {
    document.body.innerHTML = '<a href="#c" data-gtm-event="cta_pay">Go</a>';
    const un = bindGtmCtaListeners(document);
    globalThis.dataLayer = [];
    document.querySelector('a')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(globalThis.dataLayer).toContainEqual(
      expect.objectContaining({ event: 'landing_cta_pay', href: '#c', element: 'a' }),
    );
    un();
  });
});
