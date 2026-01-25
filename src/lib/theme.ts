export type ThemeMode = 'light' | 'dark';

export const THEME_KEY = 'syntropy-theme';
export const THEME_EVENT = 'syntropy-theme-change';

export const getTheme = (): ThemeMode => {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'dark' ? 'dark' : 'light';
};

export const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const setTheme = (theme: ThemeMode) => {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);

  // ✅ custom event for same-tab syncing
  window.dispatchEvent(
    new CustomEvent(THEME_EVENT, { detail: { theme } })
  );
};
