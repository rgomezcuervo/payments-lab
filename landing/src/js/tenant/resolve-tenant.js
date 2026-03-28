import defaultConfig from '../../config/tenants/default.json';
import comercioNorte from '../../config/tenants/comercio-norte.json';

/** @type {Record<string, import('./tenant-config.js').TenantConfig>} */
const BY_ID = {
  default: defaultConfig,
  'comercio-norte': comercioNorte,
};

/**
 * @param {import('./tenant-config.js').TenantConfig[]} tenants
 * @returns {Map<string, string>}
 */
function buildHostnameMap(tenants) {
  const map = new Map();
  for (const t of tenants) {
    const list = t.hostnames;
    if (!Array.isArray(list)) continue;
    for (const h of list) {
      map.set(String(h).toLowerCase(), t.id);
    }
  }
  return map;
}

const HOSTNAME_TO_ID = buildHostnameMap([defaultConfig, comercioNorte]);

/**
 * @typedef {object} LocationLike
 * @property {string} [hostname]
 * @property {string} [search]
 */

/**
 * Resuelve tenant por `VITE_TENANT_ID`, query `?tenant=`, hostname o `default`.
 *
 * @param {LocationLike} [loc]
 * @returns {{ tenantId: string, config: import('./tenant-config.js').TenantConfig }}
 */
export function resolveTenant(loc) {
  const safe =
    loc ||
    (typeof globalThis !== 'undefined' && globalThis.location
      ? globalThis.location
      : { hostname: 'localhost', search: '' });

  const hostname = String(safe.hostname || 'localhost').toLowerCase();
  const params = new URLSearchParams(safe.search || '');

  const envRaw =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TENANT_ID;
  const envId = typeof envRaw === 'string' && envRaw.trim() ? envRaw.trim() : '';

  const queryId = params.get('tenant') || '';

  const tenantId =
    (envId && BY_ID[envId] ? envId : '') ||
    (queryId && BY_ID[queryId] ? queryId : '') ||
    HOSTNAME_TO_ID.get(hostname) ||
    'default';

  const config = BY_ID[tenantId] || BY_ID.default;
  return { tenantId, config };
}
