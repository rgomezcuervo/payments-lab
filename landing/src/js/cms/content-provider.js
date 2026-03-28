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
 * @typedef {object} LandingContent
 * @property {LandingSlots} [slots] Contenido por clave de slot.
 */

/**
 * @typedef {object} ContentProvider
 * @property {(tenantId: string) => Promise<LandingContent>} getLandingContent
 */

export {};
