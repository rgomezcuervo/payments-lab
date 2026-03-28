/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from 'vitest';
import { applyLandingContent } from './apply-landing-content.js';

describe('applyLandingContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-cms-slot="hero-visual"><p>old</p></div>
      <div data-cms-slot="other">keep</div>
    `;
  });

  it('replaces innerHTML for matching slots', () => {
    applyLandingContent(document.body, {
      slots: { 'hero-visual': '<p>new</p>' },
    });
    expect(document.querySelector('[data-cms-slot="hero-visual"]')?.innerHTML).toBe('<p>new</p>');
    expect(document.querySelector('[data-cms-slot="other"]')?.textContent?.trim()).toBe('keep');
  });
});
