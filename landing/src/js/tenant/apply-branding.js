/**
 * Aplica tokens de marca (`--brand-*`), nombre comercial, logo y flags en el DOM.
 *
 * @param {Document} doc
 * @param {import('./tenant-config.js').TenantConfig} tenantConfig
 */
export function applyTenantBranding(doc, tenantConfig) {
  const root = doc.documentElement;
  root.dataset.brand = tenantConfig.id;

  const { colors, commercialName, pageTitle, logo, features, footerCopyright } = tenantConfig;

  root.style.setProperty('--brand-primary', colors.primary);
  root.style.setProperty('--brand-primary-hover', colors.primaryHover);
  root.style.setProperty('--brand-accent', colors.accent);
  root.style.setProperty('--brand-surface', colors.surface);
  root.style.setProperty('--brand-ink', colors.ink);

  if (pageTitle) {
    doc.title = pageTitle;
  }

  doc.querySelectorAll('[data-brand-name]').forEach((el) => {
    el.textContent = commercialName;
  });

  const mark = doc.querySelector('[data-brand-logo-mark]');
  if (mark instanceof HTMLElement && logo?.initials) {
    mark.textContent = logo.initials;
    mark.style.background = `linear-gradient(135deg, ${colors.primary}, color-mix(in srgb, ${colors.accent} 55%, ${colors.primary}))`;
  }

  if (footerCopyright) {
    doc.querySelectorAll('[data-brand-copy]').forEach((el) => {
      el.textContent = footerCopyright;
    });
  }

  const body = doc.body;
  if (body && features) {
    body.dataset.featureBanners = String(features.banners);
    body.dataset.featureChat = String(features.chat);
    body.dataset.featureCleanMode = String(features.cleanMode);
  }
}
