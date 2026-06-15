import { logoArt, bootSequence, fillDots } from '../utils/ascii.js';
import { posts, about } from '../data/posts.js';
import { navigate } from '../utils/router.js';
import { prefetch } from '../utils/markdown.js';

const PAGE_SIZE = 10;

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
  lines.forEach((l) => {
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

  // 文章列表（带分页）
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const initialPage = Math.min(totalPages, 1);

  const recent = document.createElement('div');
  recent.className = 'terminal-window';
  const recentHeader = document.createElement('div');
  recentHeader.className = 'terminal-header';
  recent.appendChild(recentHeader);

  const recentBody = document.createElement('div');
  recentBody.className = 'terminal-body';
  const ul = document.createElement('ul');
  ul.className = 'list';
  recentBody.appendChild(ul);

  // 分页容器（先放 body，分页在 ul 下方）
  const pager = document.createElement('div');
  pager.className = 'pager';
  recentBody.appendChild(pager);

  recent.appendChild(recentBody);
  main.appendChild(recent);

  function renderPage(page) {
    // 序号输入校验
    const safePage = Math.max(1, Math.min(totalPages, page | 0));
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pagePosts = posts.slice(start, end);

    // header 数字：当前范围
    recentHeader.innerHTML = `<span class="title">~/recent.md</span><span class="active-badge">${start + 1}-${Math.min(end, posts.length)} / ${posts.length}</span>`;

    // 列表
    ul.innerHTML = '';
    pagePosts.forEach((p) => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `
        <span class="date">${p.date.slice(5)}</span>
        <span class="title">${p.pinned ? '★ ' : ''}${p.title}</span>
        <span class="tag">${(p.tags[0] || 'misc').toUpperCase()}</span>
        <span class="arrow">→</span>
      `;
      li.addEventListener('click', () => navigate('/posts/' + p.slug));
      li.addEventListener('mouseenter', () => prefetch(p.slug));
      li.addEventListener('touchstart', () => prefetch(p.slug), { passive: true });
      ul.appendChild(li);
    });

    // 分页按钮
    pager.innerHTML = '';
    if (totalPages <= 1) {
      pager.style.display = 'none';
      return;
    }
    pager.style.display = '';

    // 「最前」
    const firstBtn = makePagerBtn('« first', safePage === 1, () => renderPage(1));
    pager.appendChild(firstBtn);

    // 「前一页」
    const prevBtn = makePagerBtn('‹ prev', safePage === 1, () => renderPage(safePage - 1));
    pager.appendChild(prevBtn);

    // 数字 1..totalPages
    for (let i = 1; i <= totalPages; i++) {
      const b = makePagerBtn(String(i), false, () => renderPage(i));
      if (i === safePage) b.classList.add('active');
      pager.appendChild(b);
    }

    // 「后一页」
    const nextBtn = makePagerBtn('next ›', safePage === totalPages, () => renderPage(safePage + 1));
    pager.appendChild(nextBtn);

    // 「最后」
    const lastBtn = makePagerBtn('last »', safePage === totalPages, () => renderPage(totalPages));
    pager.appendChild(lastBtn);
  }

  function makePagerBtn(label, disabled, onClick) {
    const b = document.createElement('button');
    b.className = 'pager-btn';
    b.textContent = label;
    if (disabled) b.disabled = true;
    b.addEventListener('click', onClick);
    return b;
  }

  renderPage(initialPage);

  return () => {};
}
