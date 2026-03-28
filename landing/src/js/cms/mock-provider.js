import mockLanding from '../../content/mock-landing.json';
import { mergeLandingContent } from './merge-landing-content.js';

/**
 * @returns {import('./content-provider.js').ContentProvider}
 */
export function createMockContentProvider() {
  return {
    async getLandingContent(tenantId) {
      const base = mockLanding.base && typeof mockLanding.base === 'object' ? mockLanding.base : {};
      const tenantBlock =
        mockLanding.tenants && typeof mockLanding.tenants === 'object'
          ? mockLanding.tenants[tenantId]
          : undefined;
      return mergeLandingContent(base, tenantBlock);
    },
  };
}
