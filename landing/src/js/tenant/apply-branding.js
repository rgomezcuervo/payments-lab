/**
 * Resuelve el título del documento: `pageTitleByLocale[locale]` → `pageTitle` → `meta.defaultTitle` (i18n).
 *
 * @param {import('./tenant-config.js').TenantConfig} tenantConfig
 * @param {{ locale: import('../i18n/locale-detector.js').Locale; t: (key: string) => string }} [i18n]
 * @returns {string | undefined}
 */
export function resolveDocumentTitle(tenantConfig, i18n) {
  const locale = i18n?.locale;
  if (locale && tenantConfig.pageTitleByLocale && typeof tenantConfig.pageTitleByLocale === 'object') {
    const localized = tenantConfig.pageTitleByLocale[locale];
    if (typeof localized === 'string' && localized.trim() !== '') return localized;
  }
  if (typeof tenantConfig.pageTitle === 'string' && tenantConfig.pageTitle.trim() !== '') {
    return tenantConfig.pageTitle;
  }
  if (i18n?.t) {
    return i18n.t('meta.defaultTitle');
  }
  return undefined;
}

/**
 * Aplica tokens de marca (`--brand-*`), nombre comercial, logo y flags en el DOM.
 *
 * @param {Document} doc
 * @param {import('./tenant-config.js').TenantConfig} tenantConfig
 * @param {{ locale: import('../i18n/locale-detector.js').Locale; t: (key: string) => string }} [i18n] Si se pasa, el título sigue {@link resolveDocumentTitle}.
 */
export function applyTenantBranding(doc, tenantConfig, i18n) {
  const root = doc.documentElement;
  root.dataset.brand = tenantConfig.id;

  const { colors, commercialName, logo, features, footerCopyright } = tenantConfig;

  root.style.setProperty('--brand-primary', colors.primary);
  root.style.setProperty('--brand-primary-hover', colors.primaryHover);
  root.style.setProperty('--brand-accent', colors.accent);
  root.style.setProperty('--brand-surface', colors.surface);
  root.style.setProperty('--brand-ink', colors.ink);

  const resolvedTitle = resolveDocumentTitle(tenantConfig, i18n);
  if (resolvedTitle) {
    doc.title = resolvedTitle;
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
