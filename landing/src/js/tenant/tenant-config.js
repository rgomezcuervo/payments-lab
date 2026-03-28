/**
 * Configuración declarativa por tenant (marca blanca).
 *
 * @typedef {object} TenantConfig
 * @property {string} id Identificador estable (coincide con nombre lógico del tenant).
 * @property {string} commercialName Nombre comercial mostrado en cabecera y pie.
 * @property {string} [pageTitle] Título único del documento (legacy; se usa si no hay `pageTitleByLocale` para el locale).
 * @property {Partial<Record<'es' | 'en', string>>} [pageTitleByLocale] Título por idioma; tiene prioridad sobre `pageTitle` cuando existe entrada no vacía.
 * @property {{ initials: string }} logo Marca por iniciales en el mark del logo.
 * @property {object} colors Paleta mapeada a variables CSS `--brand-*`.
 * @property {string} colors.primary
 * @property {string} colors.primaryHover
 * @property {string} colors.accent
 * @property {string} colors.surface
 * @property {string} colors.ink
 * @property {string} [footerCopyright] Línea de copyright en pie.
 * @property {object} features Flags para banners, chat, modo limpio (Fase 5+).
 * @property {boolean} features.banners
 * @property {boolean} features.chat
 * @property {boolean} features.cleanMode
 * @property {string} [chatScriptUrl] URL opcional de script de widget de chat (terceros).
 * @property {{ brand?: boolean, language?: boolean, exit?: boolean, chatShortcut?: boolean }} [cleanModeHeader] Cabecera modo limpio: qué bloques mostrar (atajo chat requiere `features.chat`).
 * @property {string[]} [hostnames] Hostnames que resuelven a este tenant.
 * @property {string} [metaDescription] Descripción SEO por defecto (si no hay `metaDescriptionByLocale` para el idioma).
 * @property {Partial<Record<'es' | 'en', string>>} [metaDescriptionByLocale] Descripción SEO por idioma.
 * @property {{ clarity?: boolean }} [observability] Telemetría opcional; `clarity: false` desactiva Microsoft Clarity aunque exista `VITE_CLARITY_PROJECT_ID`.
 * @property {{ canonicalBase?: string, ogImage?: string }} [seo] `canonicalBase` URL absoluta sin path para construir canonical/OG; `ogImage` opcional para `og:image`.
 */

export {};
