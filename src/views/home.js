import { logoArt, bootSequence, fillDots } from '../utils/ascii.js';
import { posts, about } from '../data/posts.js';
import { navigate } from '../utils/router.js';
import { prefetch } from '../utils/markdown.js';

export function homeView(main) {
  main.innerHTML = '';

  // boot 序列（带闪烁光标的命令行）
  const boot = document.createElement('div');
  boot.className = 'boot';
  const logo = document.createElement('pre');
  logo.className = 'logo-ascii';
  logo.textContent = logoArt;
  boot.appendChild(logo);

  const lines = bootSequence();
  lines.forEach((l, i) => {
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = `
      <span class="spinner">${l.spinner}</span>
      <span class="label">${l.label}</span>
      <span class="dots">${fillDots(l.spinner + ' ' + l.label, 56)}</span>
      <span class="value ${l.pending ? 'pending' : ''}">${l.value}</span>
    `;
    boot.appendChild(line);
  });

  // 闪烁光标
  const cursorLine = document.createElement('div');
  cursorLine.className = 'line';
  cursorLine.innerHTML = `<span class="spinner">$</span><span class="label">${about.name}@blog</span><span class="dots">:~${fillDots(about.name + '@blog:~', 30)}</span><span class="cursor"></span>`;
  boot.appendChild(cursorLine);

  main.appendChild(boot);

  // 简介块
  const intro = document.createElement('div');
  intro.className = 'terminal-window';
  intro.innerHTML = `
    <div class="terminal-header">
      <span class="title">~/about.txt</span>
      <span class="active-badge">READING</span>
    </div>
    <div class="terminal-body bio">
      <p>${about.intro[0]}</p>
      <p>${about.intro[1]}</p>
      <p>${about.intro[2]}</p>
      <button class="cta-button primary" data-go="/posts">→ read posts</button>
    </div>
  `;
  intro.querySelector('[data-go]').addEventListener('click', () => navigate('/posts'));
  main.appendChild(intro);

  // 最新文章
  const recent = document.createElement('div');
  recent.className = 'terminal-window';
  const recentHeader = document.createElement('div');
  recentHeader.className = 'terminal-header';
  recentHeader.innerHTML = '<span class="title">~/recent.md</span><span class="active-badge">3</span>';
  recent.appendChild(recentHeader);

  const recentBody = document.createElement('div');
  recentBody.className = 'terminal-body';
  const ul = document.createElement('ul');
  ul.className = 'list';
  posts.slice(0, 5).forEach((p) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <span class="date">${p.date.slice(5)}</span>
      <span class="title">${p.title}</span>
      <span class="tag">${(p.tags[0] || 'misc').toUpperCase()}</span>
      <span class="arrow">→</span>
    `;
    li.addEventListener('click', () => navigate('/posts/' + p.slug));
    li.addEventListener('mouseenter', () => prefetch(p.slug));
    li.addEventListener('touchstart', () => prefetch(p.slug), { passive: true });
    ul.appendChild(li);
  });
  recentBody.appendChild(ul);
  recent.appendChild(recentBody);
  main.appendChild(recent);

  return () => {};
}
