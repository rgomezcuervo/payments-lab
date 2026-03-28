import { describe, expect, it } from 'vitest';
import { mergeLandingContent } from './merge-landing-content.js';

describe('mergeLandingContent', () => {
  it('merges slots with tenant override', () => {
    const merged = mergeLandingContent(
      { slots: { a: '1', b: '2' } },
      { slots: { b: 'x', c: '3' } },
    );
    expect(merged.slots).toEqual({ a: '1', b: 'x', c: '3' });
  });
});
