import { navigate, getCurrentRoute } from '../utils/router.js';
import { cycleTheme, getStoredTheme } from '../utils/theme.js';

export function renderHeader() {
  const header = document.createElement('header');
  header.className = 'header';

  const content = document.createElement('div');
  content.className = 'header-content';

  // nav
  const nav = document.createElement('nav');
  nav.className = 'nav';
  const links = [
    { path: '/', label: 'Home' },
    { path: '/posts', label: 'Posts' },
    { path: '/projects', label: 'Projects' },
    { path: '/about', label: 'About' },
  ];
  for (const l of links) {
    const a = document.createElement('a');
    a.textContent = l.label;
    a.dataset.path = l.path;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(l.path);
    });
    nav.appendChild(a);
  }
  content.appendChild(nav);

  // meta (theme + path)
  const meta = document.createElement('div');
  meta.className = 'meta';

  const themeBtn = document.createElement('button');
  themeBtn.className = 'theme-toggle';
  const updateThemeLabel = () => {
    const t = getStoredTheme() || 'auto';
    themeBtn.textContent = `theme: ${t}`;
  };
  updateThemeLabel();
  themeBtn.addEventListener('click', () => {
    cycleTheme();
    updateThemeLabel();
  });
  meta.appendChild(themeBtn);

  const sep = document.createElement('span');
  sep.className = 'meta-text';
  sep.textContent = '·';
  meta.appendChild(sep);

  const pathSpan = document.createElement('span');
  pathSpan.className = 'meta-text';
  pathSpan.id = 'current-path';
  pathSpan.textContent = getCurrentRoute() || '/';
  meta.appendChild(pathSpan);

  content.appendChild(meta);
  header.appendChild(content);

  // 路由变化时更新 selected + path
  window.addEventListener('route', (e) => {
    const cur = e.detail.path;
    nav.querySelectorAll('a').forEach((a) => {
      a.classList.toggle('selected', a.dataset.path === cur);
    });
    pathSpan.textContent = cur;
  });

  return header;
}
