/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initScrollAnimations } from './scroll-animations.js';

describe('initScrollAnimations', () => {
  /** @type {IntersectionObserverCallback | undefined} */
  let ioCallback;
  const observe = vi.fn();
  const unobserve = vi.fn();

  beforeEach(() => {
    observe.mockClear();
    unobserve.mockClear();
    ioCallback = undefined;

    globalThis.IntersectionObserver = vi.fn().mockImplementation((cb) => {
      ioCallback = cb;
      return {
        observe,
        unobserve,
        disconnect: vi.fn(),
      };
    });
  });

  it('does not create an observer when there are no [data-reveal] nodes', () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById('root');
    if (!root) throw new Error('fixture');

    initScrollAnimations(root);

    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
    expect(observe).not.toHaveBeenCalled();
  });

  it('constructs IntersectionObserver with expected options', () => {
    document.body.innerHTML = '<div id="root"><span data-reveal></span></div>';
    const root = document.getElementById('root');
    if (!root) throw new Error('fixture');

    initScrollAnimations(root);

    expect(globalThis.IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(globalThis.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12,
    });
  });

  it('observes each [data-reveal] element', () => {
    document.body.innerHTML = `
      <div id="root">
        <div data-reveal id="a"></div>
        <div data-reveal id="b"></div>
      </div>`;
    const root = document.getElementById('root');
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    if (!root || !a || !b) throw new Error('fixture');

    initScrollAnimations(root);

    expect(observe).toHaveBeenCalledTimes(2);
    expect(observe).toHaveBeenCalledWith(a);
    expect(observe).toHaveBeenCalledWith(b);
  });

  it('adds reveal-visible and unobserves only when entry is intersecting', () => {
    document.body.innerHTML = '<div id="root"><div data-reveal id="x"></div></div>';
    const root = document.getElementById('root');
    const el = document.getElementById('x');
    if (!root || !el) throw new Error('fixture');

    initScrollAnimations(root);
    if (!ioCallback) throw new Error('callback');

    ioCallback([{ isIntersecting: false, target: el }]);
    expect(el.classList.contains('reveal-visible')).toBe(false);
    expect(unobserve).not.toHaveBeenCalled();

    ioCallback([{ isIntersecting: true, target: el }]);
    expect(el.classList.contains('reveal-visible')).toBe(true);
    expect(unobserve).toHaveBeenCalledTimes(1);
    expect(unobserve).toHaveBeenCalledWith(el);
  });

  it('handles multiple entries in one callback', () => {
    document.body.innerHTML = `
      <div id="root">
        <div data-reveal id="p"></div>
        <div data-reveal id="q"></div>
      </div>`;
    const root = document.getElementById('root');
    const p = document.getElementById('p');
    const q = document.getElementById('q');
    if (!root || !p || !q) throw new Error('fixture');

    initScrollAnimations(root);
    if (!ioCallback) throw new Error('callback');

    ioCallback([
      { isIntersecting: true, target: p },
      { isIntersecting: true, target: q },
    ]);

    expect(p.classList.contains('reveal-visible')).toBe(true);
    expect(q.classList.contains('reveal-visible')).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(p);
    expect(unobserve).toHaveBeenCalledWith(q);
  });
});
