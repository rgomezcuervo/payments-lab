/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from 'vitest';
import { applyTenantBranding, resolveDocumentTitle } from './apply-branding.js';

const sampleConfig = {
  id: 'test-tenant',
  commercialName: 'ACME',
  pageTitle: 'ACME — Cobros',
  logo: { initials: 'AC' },
  colors: {
    primary: '#111111',
    primaryHover: '#222222',
    accent: '#333333',
    surface: '#f5f5f4',
    ink: '#0f172a',
  },
  footerCopyright: '© ACME',
  features: {
    banners: true,
    chat: false,
    cleanMode: true,
  },
};

describe('resolveDocumentTitle', () => {
  it('prefers pageTitleByLocale for the active locale', () => {
    expect(
      resolveDocumentTitle(
        { pageTitle: 'Legacy', pageTitleByLocale: { es: 'Título ES', en: 'EN Title' } },
        { locale: 'en', t: () => 'meta' },
      ),
    ).toBe('EN Title');
  });

  it('falls back to pageTitle when locale has no pageTitleByLocale entry', () => {
    expect(
      resolveDocumentTitle(
        { pageTitle: 'Solo legacy', pageTitleByLocale: { es: 'Solo ES' } },
        { locale: 'en', t: () => 'Meta fallback' },
      ),
    ).toBe('Solo legacy');
  });

  it('uses meta.defaultTitle via t when there is no pageTitle', () => {
    expect(
      resolveDocumentTitle(
        {
          id: 'minimal',
          commercialName: 'Co',
          colors: { primary: '#000', primaryHover: '#000', accent: '#000', surface: '#fff', ink: '#000' },
          logo: { initials: 'C' },
          features: { banners: false, chat: false, cleanMode: false },
        },
        { locale: 'en', t: (k) => (k === 'meta.defaultTitle' ? 'From i18n' : k) },
      ),
    ).toBe('From i18n');
  });

  it('ignores pageTitleByLocale when i18n locale is not passed', () => {
    expect(
      resolveDocumentTitle({
        pageTitle: 'Un solo título',
        pageTitleByLocale: { en: 'Should not use without locale' },
      }),
    ).toBe('Un solo título');
  });

  it('returns undefined when there is no title source', () => {
    expect(resolveDocumentTitle({ id: 'only-id' })).toBeUndefined();
  });

  it('skips empty pageTitleByLocale string and uses pageTitle', () => {
    expect(
      resolveDocumentTitle(
        { pageTitle: 'Fallback', pageTitleByLocale: { en: '   ' } },
        { locale: 'en', t: () => 'meta' },
      ),
    ).toBe('Fallback');
  });
});

describe('applyTenantBranding', () => {
  beforeEach(() => {
    document.title = 'x';
    document.documentElement.removeAttribute('data-brand');
    document.documentElement.removeAttribute('style');
    document.body.innerHTML = `
      <span data-brand-name></span>
      <span data-brand-logo-mark></span>
      <p data-brand-copy></p>
    `;
  });

  it('sets data-brand, CSS variables and title', () => {
    applyTenantBranding(document, sampleConfig);
    expect(document.documentElement.dataset.brand).toBe('test-tenant');
    expect(document.documentElement.style.getPropertyValue('--brand-primary').trim()).toBe('#111111');
    expect(document.title).toBe('ACME — Cobros');
  });

  it('updates logo mark, names, copyright and feature flags', () => {
    applyTenantBranding(document, sampleConfig);
    expect(document.querySelector('[data-brand-name]')?.textContent).toBe('ACME');
    expect(document.querySelector('[data-brand-logo-mark]')?.textContent).toBe('AC');
    expect(document.querySelector('[data-brand-copy]')?.textContent).toBe('© ACME');
    expect(document.body.dataset.featureBanners).toBe('true');
    expect(document.body.dataset.featureChat).toBe('false');
    expect(document.body.dataset.featureCleanMode).toBe('true');
  });
});
