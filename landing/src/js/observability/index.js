/**
 * Observabilidad: SEO (meta, JSON-LD), GTM, Clarity, Datadog RUM; orquestación por tenant y entorno.
 */

import { bindGtmCtaListeners, loadGtm, pushDataLayerEvent } from './gtm.js';
import { loadClarity } from './clarity.js';
import { initDatadogRum } from './datadog-rum.js';

/**
 * @typedef {import('../tenant/tenant-config.js').TenantConfig} TenantConfig
 * @typedef {import('../i18n/locale-detector.js').Locale} Locale
 */

/**
 * @param {TenantConfig} tenant
 * @param {Locale} locale
 * @param {(key: string) => string} t
 * @returns {string}
 */
export function resolveMetaDescription(tenant, locale, t) {
  if (tenant.metaDescriptionByLocale && typeof tenant.metaDescriptionByLocale === 'object') {
    const localized = tenant.metaDescriptionByLocale[locale];
    if (typeof localized === 'string' && localized.trim() !== '') return localized;
  }
  if (typeof tenant.metaDescription === 'string' && tenant.metaDescription.trim() !== '') {
    return tenant.metaDescription;
  }
  return t('meta.description');
}

/**
 * @param {Locale} locale
 * @returns {string}
 */
export function ogLocaleForLocale(locale) {
  return locale === 'en' ? 'en_US' : 'es_ES';
}

/**
 * @param {Location} loc
 * @param {TenantConfig} tenant
 * @returns {string}
 */
export function resolveCanonicalHref(loc, tenant) {
  const base =
    tenant.seo && typeof tenant.seo.canonicalBase === 'string' && tenant.seo.canonicalBase.trim() !== ''
      ? tenant.seo.canonicalBase.replace(/\/$/, '')
      : loc.origin;
  try {
    const path = loc.pathname || '/';
    return new URL(`${path}${loc.search}`, `${base}/`).href;
  } catch {
    return `${base}${loc.pathname}`;
  }
}

/**
 * Actualiza meta tags, canonical y JSON-LD (`Organization` + `WebSite`).
 *
 * @param {Document} doc
 * @param {object} ctx
 * @param {TenantConfig} ctx.tenant
 * @param {Locale} ctx.locale
 * @param {(key: string) => string} ctx.t
 * @param {Pick<Location, 'href' | 'origin' | 'pathname' | 'search' | 'hash'>} ctx.location
 */
export function applySeoMeta(doc, { tenant, locale, t, location: loc }) {
  const title = doc.title || t('meta.defaultTitle');
  const description = resolveMetaDescription(tenant, locale, t);
  const canonical = resolveCanonicalHref(loc, tenant);
  const ogLocale = ogLocaleForLocale(locale);

  /** @param {string} id @param {string} content */
  const setMetaById = (id, content) => {
    const el = doc.getElementById(id);
    if (el instanceof HTMLMetaElement) el.content = content;
  };

  setMetaById('meta-description', description);
  setMetaById('meta-og-title', title);
  setMetaById('meta-og-desc', description);
  setMetaById('meta-og-url', canonical);
  setMetaById('meta-og-locale', ogLocale);
  setMetaById('meta-tw-title', title);
  setMetaById('meta-tw-desc', description);

  const ogImage =
    tenant.seo && typeof tenant.seo.ogImage === 'string' && tenant.seo.ogImage.trim() !== ''
      ? tenant.seo.ogImage.trim()
      : '';
  const ogImageEl = doc.getElementById('meta-og-image');
  if (ogImageEl instanceof HTMLMetaElement) {
    if (ogImage) ogImageEl.content = ogImage;
    else ogImageEl.removeAttribute('content');
  }

  const canonicalEl = doc.getElementById('link-canonical');
  if (canonicalEl instanceof HTMLLinkElement) canonicalEl.href = canonical;

  const ldNode = doc.querySelector('#json-ld-landing, script[type="application/ld+json"][data-seo-jsonld]');
  if (ldNode instanceof HTMLScriptElement) {
    const orgId = `${canonical}#organization`;
    const siteId = `${canonical}#website`;
    /** @type {object[]} */
    const graph = [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: tenant.commercialName,
        url: canonical,
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        name: tenant.commercialName,
        url: canonical,
        publisher: { '@id': orgId },
      },
    ];
    ldNode.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }
}

/**
 * @typedef {object} InitObservabilityOptions
 * @property {Document} document
 * @property {TenantConfig} tenantConfig
 * @property {() => Locale} getLocale
 * @property {(key: string) => string} t
 * @property {(fn: (locale: Locale) => void) => () => void} subscribeLocale
 * @property {Pick<Location, 'href' | 'origin' | 'pathname' | 'search' | 'hash'>} location
 * @property {ImportMeta['env']} env
 */

/**
 * Inicializa SEO, GTM, Clarity, Datadog RUM y listeners de dataLayer.
 *
 * @param {InitObservabilityOptions} options
 * @returns {() => void} Limpieza (listeners GTM + suscripción locale).
 */
export function initObservability(options) {
  const { document: doc, tenantConfig, getLocale, t, subscribeLocale, location: loc, env } = options;

  function refreshSeo() {
    applySeoMeta(doc, {
      tenant: tenantConfig,
      locale: getLocale(),
      t,
      location: loc,
    });
  }

  refreshSeo();

  const gtmId = env.VITE_GTM_CONTAINER_ID;
  if (typeof gtmId === 'string' && gtmId.trim() !== '') loadGtm(gtmId);

  const clarityOn = tenantConfig.observability?.clarity !== false;
  const clarityId = env.VITE_CLARITY_PROJECT_ID;
  if (clarityOn && typeof clarityId === 'string' && clarityId.trim() !== '') loadClarity(clarityId);

  void initDatadogRum({
    applicationId: typeof env.VITE_DATADOG_APPLICATION_ID === 'string' ? env.VITE_DATADOG_APPLICATION_ID : '',
    clientToken: typeof env.VITE_DATADOG_CLIENT_TOKEN === 'string' ? env.VITE_DATADOG_CLIENT_TOKEN : '',
    service: typeof env.VITE_DATADOG_SERVICE === 'string' && env.VITE_DATADOG_SERVICE ? env.VITE_DATADOG_SERVICE : undefined,
    env: typeof env.VITE_DATADOG_ENV === 'string' && env.VITE_DATADOG_ENV ? env.VITE_DATADOG_ENV : undefined,
    site: typeof env.VITE_DATADOG_SITE === 'string' && env.VITE_DATADOG_SITE ? env.VITE_DATADOG_SITE : undefined,
    allowInDev: env.VITE_DATADOG_ALLOW_IN_DEV === 'true',
    mode: typeof env.MODE === 'string' ? env.MODE : undefined,
  });

  const unbindCta = bindGtmCtaListeners(doc);
  const unsub = subscribeLocale((locale) => {
    pushDataLayerEvent('landing_locale_change', { locale });
    refreshSeo();
  });

  pushDataLayerEvent('landing_page_view', { tenant_id: tenantConfig.id, locale: getLocale() });

  return () => {
    unbindCta();
    unsub();
  };
}
