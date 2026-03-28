/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from 'vitest';
import { loadClarity } from './clarity.js';

describe('loadClarity', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('injects clarity script for a project id', () => {
    loadClarity('abc123');
    const s = document.querySelector('script[data-clarity-tag="abc123"]');
    expect(s).toBeTruthy();
    expect(s?.src).toContain('clarity.ms/tag/abc123');
  });

  it('is a no-op for empty id', () => {
    loadClarity('  ');
    expect(document.querySelectorAll('script[src*="clarity.ms"]').length).toBe(0);
  });
});
