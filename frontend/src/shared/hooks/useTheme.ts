import { useCallback, useEffect, useState } from 'react';

const THEME_SWITCH_CLASS = 'theme-switching';

function resolveInitialDark() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeClass(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function withoutThemeTransition(callback: () => void) {
  const root = document.documentElement;
  root.classList.add(THEME_SWITCH_CLASS);
  callback();
  void root.offsetHeight;
  root.classList.remove(THEME_SWITCH_CLASS);
}

export function initTheme() {
  applyThemeClass(resolveInitialDark());
}

export function useTheme() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  );

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = useCallback(() => {
    withoutThemeTransition(() => {
      const next = !document.documentElement.classList.contains('dark');
      applyThemeClass(next);
      setIsDark(next);
    });
  }, []);

  return { isDark, toggleTheme };
}
