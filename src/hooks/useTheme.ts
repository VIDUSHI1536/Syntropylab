import { useCallback, useEffect, useState } from 'react';
import { ThemeMode, getTheme, setTheme as persistTheme, applyTheme, THEME_EVENT, THEME_KEY } from '@/lib/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => getTheme());

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    persistTheme(t); // ✅ updates localStorage + html class + dispatch event
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    // ✅ apply on initial load
    applyTheme(theme);
  }, []); // only once

  useEffect(() => {
    // ✅ listen same tab updates
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ theme: ThemeMode }>;
      setThemeState(ce.detail.theme);
      applyTheme(ce.detail.theme);
    };

    window.addEventListener(THEME_EVENT, handler);

    return () => window.removeEventListener(THEME_EVENT, handler);
  }, []);

  useEffect(() => {
    // ✅ listen other tabs updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
