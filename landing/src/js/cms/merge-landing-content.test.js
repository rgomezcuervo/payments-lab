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

  it('uses tenant bannerItems when present', () => {
    const merged = mergeLandingContent(
      { bannerItems: [{ title: 'A' }] },
      { bannerItems: [{ title: 'B' }] },
    );
    expect(merged.bannerItems).toEqual([{ title: 'B' }]);
  });

  it('falls back to base bannerItems', () => {
    const merged = mergeLandingContent({ bannerItems: [{ title: 'A' }] }, { slots: {} });
    expect(merged.bannerItems).toEqual([{ title: 'A' }]);
  });
});
