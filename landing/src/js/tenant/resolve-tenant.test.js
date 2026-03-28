/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveTenant } from './resolve-tenant.js';

describe('resolveTenant', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses window.location when loc is omitted', () => {
    const { tenantId } = resolveTenant();
    expect(tenantId).toBe('default');
  });

  it('resolves default tenant for localhost', () => {
    const { tenantId, config } = resolveTenant({ hostname: 'localhost', search: '' });
    expect(tenantId).toBe('default');
    expect(config.id).toBe('default');
  });

  it('maps hostname comercio-norte.local to comercio-norte', () => {
    const { tenantId } = resolveTenant({ hostname: 'comercio-norte.local', search: '' });
    expect(tenantId).toBe('comercio-norte');
  });

  it('uses query ?tenant= when valid', () => {
    const { tenantId } = resolveTenant({
      hostname: 'localhost',
      search: '?tenant=comercio-norte',
    });
    expect(tenantId).toBe('comercio-norte');
  });

  it('ignores invalid query tenant and falls back to hostname', () => {
    const { tenantId } = resolveTenant({
      hostname: 'comercio-norte.local',
      search: '?tenant=no-existe',
    });
    expect(tenantId).toBe('comercio-norte');
  });

  it('prefers VITE_TENANT_ID over query and hostname', () => {
    vi.stubEnv('VITE_TENANT_ID', 'comercio-norte');
    const { tenantId } = resolveTenant({
      hostname: 'localhost',
      search: '?tenant=default',
    });
    expect(tenantId).toBe('comercio-norte');
  });
});
