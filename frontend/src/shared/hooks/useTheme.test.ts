import { beforeEach, describe, expect, it } from 'vitest';
import { applyThemeClass, initTheme, resolveInitialDark } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
  });

  it('resolveInitialDark prefers stored theme', () => {
    localStorage.setItem('theme', 'dark');
    expect(resolveInitialDark()).toBe(true);
  });

  it('applyThemeClass updates document and storage', () => {
    applyThemeClass(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('initTheme applies stored dark preference', () => {
    localStorage.setItem('theme', 'dark');
    initTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
