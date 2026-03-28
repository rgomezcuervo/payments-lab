/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from 'vitest';
import { applyTenantBranding } from './apply-branding.js';

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
