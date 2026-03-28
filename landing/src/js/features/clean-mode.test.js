/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  CLEAN_MODE_STORAGE_KEY,
  applyCleanHeaderOptions,
  initCleanMode,
  syncCleanModeToggle,
} from './clean-mode.js';

function minimalCleanModeDom() {
  document.body.innerHTML = `
    <div id="landing-shell" class="flex min-h-screen flex-col">
      <header id="site-header"></header>
      <header id="clean-mode-header" class="hidden">
        <div data-clean-header-option="brand">brand</div>
        <div data-clean-header-option="language">lang</div>
        <button type="button" data-clean-header-option="chatShortcut" data-clean-chat-open>chat</button>
        <button type="button" data-clean-header-option="exit" data-clean-mode-exit>exit</button>
      </header>
      <main id="main-content"></main>
      <div id="clean-mode-mount" class="hidden w-full flex-1">
        <div id="clean-mode-root" hidden></div>
      </div>
    </div>
    <footer id="site-footer"></footer>
    <button type="button" data-clean-mode-toggle>Modo limpio</button>`;
}

describe('clean-mode', () => {
  beforeEach(() => {
    try {
      globalThis.localStorage?.removeItem(CLEAN_MODE_STORAGE_KEY);
    } catch {
      // ignore
    }
    document.body.className = '';
  });

  it('syncCleanModeToggle updates label from locale keys', () => {
    minimalCleanModeDom();
    const t = (k) => (k === 'nav.cleanModeExit' ? 'Exit' : 'Clean');
    document.body.classList.add('clean-mode');
    syncCleanModeToggle(document, t);
    expect(document.querySelector('[data-clean-mode-toggle]')?.textContent).toBe('Exit');
  });

  it('initCleanMode reads storage key and toggles layout', () => {
    minimalCleanModeDom();
    try {
      globalThis.localStorage?.setItem(CLEAN_MODE_STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    const t = (k) => k;
    initCleanMode(document, { enabled: true, t });
    expect(document.body.classList.contains('clean-mode')).toBe(true);
    expect(document.getElementById('site-header')?.hidden).toBe(true);
    expect(document.getElementById('clean-mode-header')?.classList.contains('hidden')).toBe(false);
    expect(document.getElementById('main-content')?.hidden).toBe(true);
    expect(document.getElementById('site-footer')?.hidden).toBe(false);
  });

  it('applyCleanHeaderOptions hides blocks when false', () => {
    document.body.innerHTML = `
      <div data-clean-header-option="brand">b</div>
      <div data-clean-header-option="language">l</div>`;
    applyCleanHeaderOptions(document, { brand: false, language: true });
    const brand = document.querySelector('[data-clean-header-option="brand"]');
    const lang = document.querySelector('[data-clean-header-option="language"]');
    expect(brand?.hidden).toBe(true);
    expect(lang?.hidden).toBe(false);
  });

  it('applyCleanHeaderOptions hides chatShortcut without chat feature', () => {
    document.body.innerHTML = `<button type="button" data-clean-header-option="chatShortcut">c</button>`;
    applyCleanHeaderOptions(document, { chatShortcut: true }, false);
    expect(document.querySelector('[data-clean-header-option="chatShortcut"]')?.hidden).toBe(true);
  });
});
