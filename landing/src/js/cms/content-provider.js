/**
 * Contrato abstracto para contenido headless (Strapi, Contentful, etc.).
 * La UI solo depende de este contrato y de {@link LandingContent}.
 */

/**
 * Fragmentos HTML opcionales por slot (`data-cms-slot`).
 *
 * @typedef {Record<string, string | null | undefined>} LandingSlots
 */

/**
 * Elemento de carrusel de banners (CMS o config; opcionalmente enlazado a i18n vía `*Key`).
 *
 * @typedef {object} BannerItem
 * @property {string} [tag]
 * @property {string} [title]
 * @property {string} [body]
 * @property {string} [tagKey]
 * @property {string} [titleKey]
 * @property {string} [bodyKey]
 * @property {string} [imageUrl]
 * @property {string} [href]
 * @property {string} [validFrom] Inicio de vigencia (ISO 8601 fecha).
 * @property {string} [validUntil] Fin de vigencia (ISO 8601 fecha).
 */

/**
 * @typedef {object} LandingContent
 * @property {LandingSlots} [slots] Contenido por clave de slot.
 * @property {BannerItem[]} [bannerItems] Lista opcional para el carrusel de banners (Fase 5).
 */

/**
 * @typedef {object} ContentProvider
 * @property {(tenantId: string) => Promise<LandingContent>} getLandingContent
 */

export {};
