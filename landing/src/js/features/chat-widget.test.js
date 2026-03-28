/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { initChatWidget } from './chat-widget.js';

describe('initChatWidget', () => {
  it('leaves mount empty when disabled', () => {
    document.body.innerHTML = '<div id="chat-widget-root"></div>';
    initChatWidget(document, { enabled: false });
    const m = document.getElementById('chat-widget-root');
    expect(m?.innerHTML.trim()).toBe('');
    expect(m?.hidden).toBe(true);
  });

  it('injects panel and toggle when enabled', () => {
    document.body.innerHTML = '<div id="chat-widget-root"></div>';
    initChatWidget(document, { enabled: true });
    expect(document.querySelector('[data-chat-toggle]')).toBeTruthy();
    expect(document.querySelector('#chat-widget-panel')).toBeTruthy();
  });

  it('appends external script when scriptUrl provided', () => {
    document.body.innerHTML = '<div id="chat-widget-root"></div>';
    initChatWidget(document, { enabled: true, scriptUrl: 'https://example.com/widget.js' });
    expect(document.querySelector('script[data-chat-external="true"]')?.getAttribute('src')).toBe(
      'https://example.com/widget.js',
    );
  });
});
