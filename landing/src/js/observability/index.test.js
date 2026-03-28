/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import defaultTenant from '../../config/tenants/default.json';
import {
  applySeoMeta,
  initObservability,
  ogLocaleForLocale,
  resolveCanonicalHref,
  resolveMetaDescription,
} from './index.js';

describe('resolveMetaDescription', () => {
  it('prefers tenant locale-specific description', () => {
    const t = (k) => (k === 'meta.description' ? 'fallback' : k);
    const d = resolveMetaDescription(
      {
        ...defaultTenant,
        metaDescriptionByLocale: { es: 'ES custom', en: 'EN custom' },
      },
      'es',
      t,
    );
    expect(d).toBe('ES custom');
  });

  it('falls back to i18n meta.description', () => {
    const t = (k) => (k === 'meta.description' ? 'from i18n' : k);
    const d = resolveMetaDescription(defaultTenant, 'es', t);
    expect(d).toBe('from i18n');
  });
});

describe('resolveCanonicalHref', () => {
  it('uses tenant canonicalBase when set', () => {
    const loc = { origin: 'http://localhost:5173', pathname: '/a', search: '?x=1', hash: '' };
    const href = resolveCanonicalHref(loc, {
      ...defaultTenant,
      seo: { canonicalBase: 'https://prod.example.com' },
    });
    expect(href).toBe('https://prod.example.com/a?x=1');
  });
});

describe('ogLocaleForLocale', () => {
  it('maps locales', () => {
    expect(ogLocaleForLocale('es')).toBe('es_ES');
    expect(ogLocaleForLocale('en')).toBe('en_US');
  });
});

describe('applySeoMeta', () => {
  it('fills meta tags and JSON-LD', () => {
    document.head.innerHTML = `
      <meta id="meta-description" name="description" content="" />
      <link id="link-canonical" rel="canonical" href="" />
      <meta id="meta-og-title" property="og:title" content="" />
      <meta id="meta-og-desc" property="og:description" content="" />
      <meta id="meta-og-url" property="og:url" content="" />
      <meta id="meta-og-locale" property="og:locale" content="" />
      <meta id="meta-og-image" property="og:image" content="" />
      <meta id="meta-tw-title" name="twitter:title" content="" />
      <meta id="meta-tw-desc" name="twitter:description" content="" />
      <script type="application/ld+json" id="json-ld-landing" data-seo-jsonld>{}</script>
    `;
    document.title = 'Título prueba';
    const t = (k) => {
      if (k === 'meta.description') return 'Desc SEO';
      return k;
    };
    const loc = { href: 'http://localhost/x', origin: 'http://localhost', pathname: '/x', search: '', hash: '' };
    applySeoMeta(document, { tenant: defaultTenant, locale: 'es', t, location: loc });

    expect(document.getElementById('meta-description')?.getAttribute('content')).toBe('Desc SEO');
    expect(document.getElementById('link-canonical')?.getAttribute('href')).toBe('http://localhost/x');
    const ld = document.getElementById('json-ld-landing')?.textContent;
    expect(ld).toContain('Organization');
    expect(ld).toContain('WebSite');
  });
});

describe('initObservability', () => {
  it('registers locale subscriber and pushes page_view', async () => {
    document.head.innerHTML = `
      <meta id="meta-description" name="description" content="" />
      <link id="link-canonical" rel="canonical" href="" />
      <meta id="meta-og-title" property="og:title" content="" />
      <meta id="meta-og-desc" property="og:description" content="" />
      <meta id="meta-og-url" property="og:url" content="" />
      <meta id="meta-og-locale" property="og:locale" content="" />
      <meta id="meta-og-image" property="og:image" content="" />
      <meta id="meta-tw-title" name="twitter:title" content="" />
      <meta id="meta-tw-desc" name="twitter:description" content="" />
      <script type="application/ld+json" id="json-ld-landing" data-seo-jsonld>{}</script>
    `;
    document.title = 'T';
    globalThis.dataLayer = [];
    const listeners = [];
    const cleanup = initObservability({
      document,
      tenantConfig: defaultTenant,
      getLocale: () => 'es',
      t: (k) => (k === 'meta.description' ? 'D' : k),
      subscribeLocale: (fn) => {
        listeners.push(fn);
        return () => {};
      },
      location: { href: 'http://a/', origin: 'http://a', pathname: '/', search: '', hash: '' },
      env: { MODE: 'test', VITE_GTM_CONTAINER_ID: '', VITE_CLARITY_PROJECT_ID: '' },
    });

    expect(globalThis.dataLayer.some((o) => o.event === 'landing_page_view')).toBe(true);
    listeners[0]?.('en');
    expect(globalThis.dataLayer.some((o) => o.event === 'landing_locale_change' && o.locale === 'en')).toBe(true);
    cleanup();
  });
});
