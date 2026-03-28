import { describe, expect, it } from 'vitest';
import { detectInitialLocale, normalizeLocaleParam } from './locale-detector.js';

describe('normalizeLocaleParam', () => {
  it('maps es variants', () => {
    expect(normalizeLocaleParam('es')).toBe('es');
    expect(normalizeLocaleParam('ES')).toBe('es');
    expect(normalizeLocaleParam('es-CO')).toBe('es');
  });

  it('maps en variants', () => {
    expect(normalizeLocaleParam('en')).toBe('en');
    expect(normalizeLocaleParam('en-US')).toBe('en');
  });

  it('returns undefined for unknown', () => {
    expect(normalizeLocaleParam('fr')).toBeUndefined();
    expect(normalizeLocaleParam(undefined)).toBeUndefined();
  });
});

describe('detectInitialLocale', () => {
  it('prefers URL lang over storage and navigator', () => {
    const locale = detectInitialLocale({
      location: { search: '?lang=en' },
      storage: { getItem: () => 'es' },
      navigator: { language: 'es' },
    });
    expect(locale).toBe('en');
  });

  it('uses storage when URL has no lang', () => {
    const locale = detectInitialLocale({
      location: { search: '' },
      storage: { getItem: () => 'en' },
      navigator: { language: 'es' },
    });
    expect(locale).toBe('en');
  });

  it('uses navigator when URL and storage empty', () => {
    const locale = detectInitialLocale({
      location: { search: '' },
      storage: { getItem: () => null },
      navigator: { language: 'en-GB' },
    });
    expect(locale).toBe('en');
  });

  it('defaults to es', () => {
    const locale = detectInitialLocale({
      location: { search: '' },
      storage: { getItem: () => null },
      navigator: { language: 'fr-FR' },
    });
    expect(locale).toBe('es');
  });
});
