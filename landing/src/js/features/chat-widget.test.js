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

  it('toggles panel open and closed via buttons', () => {
    document.body.innerHTML = '<div id="chat-widget-root"></div>';
    initChatWidget(document, { enabled: true });
    const toggle = document.querySelector('[data-chat-toggle]');
    const panel = document.querySelector('#chat-widget-panel');
    if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) throw new Error('fixture');
    expect(panel.classList.contains('hidden')).toBe(true);
    toggle.click();
    expect(panel.classList.contains('hidden')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const closeBtn = document.querySelector('[data-chat-close]');
    if (!(closeBtn instanceof HTMLButtonElement)) throw new Error('fixture');
    closeBtn.click();
    expect(panel.classList.contains('hidden')).toBe(true);
  });

  it('does not duplicate external script on second init', () => {
    document.body.innerHTML = '<div id="chat-widget-root"></div>';
    initChatWidget(document, { enabled: true, scriptUrl: 'https://example.com/a.js' });
    initChatWidget(document, { enabled: true, scriptUrl: 'https://example.com/b.js' });
    expect(document.querySelectorAll('script[data-chat-external="true"]').length).toBe(1);
  });
});
