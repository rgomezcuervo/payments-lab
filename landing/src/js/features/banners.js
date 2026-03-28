import { initCarousel } from '../ui/testimonials.js';

/**
 * @typedef {import('../cms/content-provider.js').BannerItem} BannerItem
 */

/**
 * @param {BannerItem[]} items
 * @param {Date} [now]
 * @returns {BannerItem[]}
 */
export function filterActiveBannerItems(items, now = new Date()) {
  if (!Array.isArray(items)) return [];
  const t = now.getTime();
  return items.filter((item) => {
    if (item.validFrom) {
      const from = Date.parse(item.validFrom);
      if (!Number.isNaN(from) && t < from) return false;
    }
    if (item.validUntil) {
      const until = Date.parse(item.validUntil);
      if (!Number.isNaN(until) && t > until) return false;
    }
    return true;
  });
}

/**
 * @param {BannerItem} item
 */
function slideHtml(item) {
  const tagAttrs = item.tagKey ? `data-i18n-key="${escapeAttr(item.tagKey)}"` : '';
  const titleAttrs = item.titleKey ? `data-i18n-key="${escapeAttr(item.titleKey)}"` : '';
  const bodyAttrs = item.bodyKey ? `data-i18n-key="${escapeAttr(item.bodyKey)}"` : '';
  const tagText = item.tagKey ? '' : escapeHtml(item.tag ?? '');
  const titleText = item.titleKey ? '' : escapeHtml(item.title ?? '');
  const bodyText = item.bodyKey ? '' : escapeHtml(item.body ?? '');

  const inner = `
    ${item.imageUrl ? `<div class="mb-4 overflow-hidden rounded-2xl border border-slate-200/80"><img src="${escapeUriAttr(item.imageUrl)}" alt="" class="h-40 w-full object-cover" loading="lazy" /></div>` : ''}
    <p class="text-sm font-medium text-teal-700" ${tagAttrs}>${tagText}</p>
    <h3 class="mt-2 text-xl font-semibold text-slate-900" ${titleAttrs}>${titleText}</h3>
    <p class="mt-2 max-w-2xl text-slate-600" ${bodyAttrs}>${bodyText}</p>
  `.trim();

  return `<article class="min-w-full px-6 py-8 sm:px-10" data-carousel-slide>${item.href ? `<a href="${escapeUriAttr(item.href)}" class="block rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[color:var(--brand-primary)]">${inner}</a>` : inner}</article>`;
}

/**
 * @param {string} s
 */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} s
 */
function escapeAttr(s) {
  return escapeHtml(s);
}

/**
 * @param {string} s
 */
function escapeUriAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/</g, '%3C');
}

/**
 * Inyecta slides y arranca el carrusel en el contenedor del slot de banners.
 *
 * @param {ParentNode} root
 * @param {BannerItem[]} items
 */
export function renderBannerCarousel(root, items) {
  const host = root.querySelector('[data-banner-carousel]');
  const track = root.querySelector('[data-carousel-track]');
  if (!host || !track) return;
  const slides = items.map((item) => slideHtml(item)).join('\n');
  track.innerHTML = slides;
  initCarousel(host instanceof HTMLElement ? host : null);
}

/**
 * Oculta la sección de banners o rellena el carrusel desde CMS/config.
 *
 * @param {Document} doc
 * @param {object} options
 * @param {ParentNode} [options.sectionRoot] Por defecto `doc`.
 * @param {BannerItem[] | undefined} options.bannerItems Si viene definido (p. ej. desde CMS) y queda vacío tras filtrar fechas, se oculta la sección.
 * @param {boolean} [options.enabled] Flag tenant `features.banners`.
 * @param {boolean} [options.cmsReplacedSlot] Si el mock CMS inyectó HTML en el slot `banner-list`, no sobrescribir.
 */
export function initBanners(doc, options) {
  const { bannerItems, enabled = true, cmsReplacedSlot = false, sectionRoot = doc } = options;
  const section = sectionRoot.querySelector('#banners');
  if (section instanceof HTMLElement) {
    section.hidden = !enabled;
    section.setAttribute('aria-hidden', enabled ? 'false' : 'true');
  }

  if (!enabled) return;

  if (cmsReplacedSlot) {
    return;
  }

  const listProvided = bannerItems !== undefined;
  const items = filterActiveBannerItems(bannerItems ?? []);

  if (listProvided && items.length === 0) {
    if (section instanceof HTMLElement) {
      section.hidden = true;
      section.setAttribute('aria-hidden', 'true');
    }
    return;
  }

  if (items.length === 0) {
    return;
  }

  const mount = sectionRoot.querySelector('#banners [data-banner-root]');
  if (!(mount instanceof HTMLElement)) return;

  mount.innerHTML = `
    <div
      class="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur"
      data-carousel="banners"
      data-banner-carousel
      aria-roledescription="carrusel"
    >
      <div id="banner-carousel-slides" class="flex transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none" data-carousel-track style="transform: translateX(0)">
        ${items.map((item) => slideHtml(item)).join('\n')}
      </div>
      <div class="flex justify-center gap-2 pb-6" data-carousel-dots></div>
    </div>
  `;

}
