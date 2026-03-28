import { describe, expect, it } from 'vitest';
import { add } from './smoke.js';

describe('smoke', () => {
  it('runs the test runner', () => {
    expect(add(1, 1)).toBe(2);
  });
});
