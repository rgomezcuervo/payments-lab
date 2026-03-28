import { describe, expect, it } from 'vitest';
import { createMockContentProvider } from './mock-provider.js';

describe('createMockContentProvider', () => {
  it('returns merged landing content per tenant', async () => {
    const cms = createMockContentProvider();
    const def = await cms.getLandingContent('default');
    const norte = await cms.getLandingContent('comercio-norte');
    expect(def.slots?.['hero-visual']).toBeUndefined();
    expect(norte.slots?.['hero-visual']).toBeDefined();
  });
});
