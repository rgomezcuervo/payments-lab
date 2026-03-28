/**
 * Datadog Real User Monitoring: inicialización con credenciales de entorno; no-op en desarrollo sin opt-in.
 */

/**
 * @typedef {object} DatadogRumInitResult
 * @property {boolean} started Si se llamó a `datadogRum.init`.
 * @property {'missing_credentials' | 'development_skipped' | 'ok' | 'import_failed'} reason Motivo si no hubo init completo.
 */

/**
 * Inicializa el SDK `@datadog/browser-rum` cuando hay `applicationId` y `clientToken`.
 * En `development` / `test` no carga el SDK salvo `allowInDev: true` (p. ej. clave de prueba).
 *
 * @param {object} options
 * @param {string} [options.applicationId] `VITE_DATADOG_APPLICATION_ID`
 * @param {string} [options.clientToken] `VITE_DATADOG_CLIENT_TOKEN`
 * @param {string} [options.service] `VITE_DATADOG_SERVICE`
 * @param {string} [options.env] `VITE_DATADOG_ENV` o `import.meta.env.MODE`
 * @param {string} [options.site] Host del sitio Datadog (p. ej. `datadoghq.com`, `datadoghq.eu`)
 * @param {string} [options.version] Versión de despliegue opcional
 * @param {boolean} [options.allowInDev] Si es true, inicializa aunque `MODE` sea `development` o `test`
 * @param {string} [options.mode] `import.meta.env.MODE` inyectado para tests
 * @returns {Promise<DatadogRumInitResult>}
 */
export async function initDatadogRum(options) {
  const {
    applicationId,
    clientToken,
    service = 'landing-recaudos',
    env,
    site = 'datadoghq.com',
    version,
    allowInDev = false,
    mode = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE ? import.meta.env.MODE : 'production',
  } = options;

  const appId = typeof applicationId === 'string' ? applicationId.trim() : '';
  const token = typeof clientToken === 'string' ? clientToken.trim() : '';
  if (!appId || !token) {
    return { started: false, reason: 'missing_credentials' };
  }

  const isDevLike = mode === 'development' || mode === 'test';
  if (isDevLike && !allowInDev) {
    return { started: false, reason: 'development_skipped' };
  }

  try {
    const { datadogRum } = await import('@datadog/browser-rum');
    datadogRum.init({
      applicationId: appId,
      clientToken: token,
      site,
      service,
      env: env ?? mode,
      version,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      defaultPrivacyLevel: 'mask-user-input',
    });
    datadogRum.startSessionReplayRecording();
    return { started: true, reason: 'ok' };
  } catch {
    return { started: false, reason: 'import_failed' };
  }
}
