import navHtml from '../components/nav.html?raw';
import heroHtml from '../components/hero.html?raw';
import servicesHtml from '../components/services.html?raw';
import benefitsHtml from '../components/benefits.html?raw';
import bannersHtml from '../components/banners.html?raw';
import testimonialsHtml from '../components/testimonials.html?raw';
import faqHtml from '../components/faq.html?raw';
import contactHtml from '../components/contact.html?raw';
import footerHtml from '../components/footer.html?raw';

import { applyLandingContent } from './cms/apply-landing-content.js';
import { createMockContentProvider } from './cms/mock-provider.js';
import { applyTenantBranding } from './tenant/apply-branding.js';
import { resolveTenant } from './tenant/resolve-tenant.js';
import { applyI18nToDom, initI18nController } from './i18n/i18n.js';
import { detectInitialLocale } from './i18n/locale-detector.js';
import { initNav, syncNavToggleAria } from './ui/nav.js';
import { initScrollAnimations } from './ui/scroll-animations.js';
import { initCarousel } from './ui/testimonials.js';
import { initFaqAccordion } from './ui/faq.js';

const SECTIONS = [
  heroHtml,
  servicesHtml,
  benefitsHtml,
  bannersHtml,
  testimonialsHtml,
  faqHtml,
  contactHtml,
].join('\n');

export async function mountLanding() {
  const { tenantId, config } = resolveTenant(
    typeof globalThis !== 'undefined' && globalThis.location ? globalThis.location : undefined,
  );
  const cms = createMockContentProvider();
  const landingContent = await cms.getLandingContent(tenantId);

  const header = document.getElementById('site-header');
  const main = document.getElementById('main-content');
  const footer = document.getElementById('site-footer');
  if (!header || !main || !footer) return;

  header.innerHTML = navHtml;
  main.innerHTML = SECTIONS;
  footer.innerHTML = footerHtml;

  const initialLocale = detectInitialLocale({
    location: typeof globalThis !== 'undefined' && globalThis.location ? globalThis.location : undefined,
    storage: typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined,
    navigator: typeof globalThis !== 'undefined' ? globalThis.navigator : undefined,
  });

  const i18n = initI18nController({
    document,
    initialLocale,
    onLocaleChange: () => {
      applyTenantBranding(document, config, { locale: i18n.getLocale(), t: i18n.t });
      syncNavToggleAria(header, i18n.t);
    },
  });
  i18n.bindLanguageSelect();

  applyTenantBranding(document, config, { locale: i18n.getLocale(), t: i18n.t });
  applyLandingContent(document.documentElement, landingContent);
  applyI18nToDom(document, i18n.getLocale());
  applyTenantBranding(document, config, { locale: i18n.getLocale(), t: i18n.t });

  initNav(header, { t: i18n.t });
  initScrollAnimations(document);
  document.querySelectorAll('[data-carousel]').forEach((el) => {
    if (el instanceof HTMLElement) initCarousel(el);
  });
  initFaqAccordion(main);
}
