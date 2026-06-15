// 主题：auto / light / dark
const STORAGE_KEY = 'blog-theme';

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredTheme(theme) {
  if (theme === 'auto') {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  } else {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function applyStoredTheme() {
  const stored = getStoredTheme();
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
  }
}

export function cycleTheme() {
  const cur = getStoredTheme() || 'auto';
  const next = cur === 'auto' ? 'light' : cur === 'light' ? 'dark' : 'auto';
  setStoredTheme(next);
  return next;
}
