import { posts, about } from '../data/posts.js';
import { navigate } from '../utils/router.js';
import { prefetch } from '../utils/markdown.js';
import { startAsciiFlow } from '../utils/canvas-animation.js';

// 从 canvas-animation.js 提取的 F 数组
// 简化：直接复用
import { F as ASCII_TEXT } from '../utils/canvas-animation-const.js';
import { renderAboutBody } from './about.js';

const PAGE_SIZE = 10;

export function homeView(main) {
  main.innerHTML = '';

  // ===== Hero: 大框 + 流动方块动画 =====
  const hero = document.createElement('div');
  hero.className = 'hero';

  const mainBlock = document.createElement('div');
  mainBlock.className = 'main-block';
  const heroHotkey = document.createElement('div');
  heroHotkey.className = 'hero-hotkey';
  heroHotkey.textContent = 'scroll ↓';
  mainBlock.appendChild(heroHotkey);

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'canvas-wrapper';
  const canvas = document.createElement('canvas');
  canvas.className = 'branches-canvas';
  canvasWrap.appendChild(canvas);
  mainBlock.appendChild(canvasWrap);

  // 底部的"数据条"
  const banner = document.createElement('div');
  banner.className = 'banner-data';
  banner.innerHTML = `
    <span class="banner-title">~/${(about.name || "kaiyuanqingnian").toLowerCase()}/</span>
    <span class="banner-sub">a tinkerer's log · linux · risc-v · self-hosted</span>
  `;
  mainBlock.appendChild(banner);

  // ===== 右侧 3 个方块 =====
  const side = document.createElement('div');
  side.className = 'side-block';

  // 方块 1: ~/about（复用 about 页面）
  const aboutPanel = document.createElement('div');
  aboutPanel.className = 'panel terminal-window';
  const aboutHeader = document.createElement('div');
  aboutHeader.className = 'terminal-header';
  aboutHeader.innerHTML = '<span class="title">~/about</span><span class="active-badge">README</span>';
  aboutPanel.appendChild(aboutHeader);
  const aboutBody = document.createElement('div');
  aboutBody.className = 'terminal-body bio about-compact';
  aboutPanel.appendChild(aboutBody);
  side.appendChild(aboutPanel);
  renderAboutBody(aboutBody, about);

  // 方块 2: B 站
  const panel2 = document.createElement('div');
  panel2.className = 'panel terminal-window';
  panel2.innerHTML = `
    <div class="terminal-header">
      <span class="title">~/bilibili</span>
      <span class="active-badge">UID:51420401</span>
    </div>
    <div class="terminal-body bilibili-panel">
      <p class="bilibili-desc">在 B 站记录折腾过程。</p>
      <a class="bilibili-btn" href="https://space.bilibili.com/51420401" target="_blank" rel="noopener noreferrer">
        <span class="bilibili-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="flex-shrink:0">
  <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906l-1.173 1.12zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773H5.333zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374a1.295 1.295 0 0 1-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374a1.295 1.295 0 0 1-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386z"/>
</svg></span>
        <span class="bilibili-text">开源青年</span>
      </a>
    </div>
  `;
  side.appendChild(panel2);

  // 方块 3: 第三个 panel
  const panel3 = document.createElement('div');
  panel3.className = 'panel terminal-window';
  panel3.innerHTML = `
    <div class="terminal-header">
      <span class="title">~/panel-3.txt</span>
      <span class="active-badge">PLACEHOLDER</span>
    </div>
    <div class="terminal-body">
      <p class="placeholder-text">[ 第三个方块内容待填 ]</p>
    </div>
  `;
  side.appendChild(panel3);

  // 顶层：左右两栏（大框 + 3 方块）
  const top = document.createElement('div');
  top.className = 'hero-top';
  top.appendChild(mainBlock);
  top.appendChild(side);
  hero.appendChild(top);

  // ===== 大框下面：posts 列表（带分页）=====
  const postsPanel = document.createElement('div');
  postsPanel.className = 'panel terminal-window posts-panel';
  const postsHeader = document.createElement('div');
  postsHeader.className = 'terminal-header';
  postsPanel.appendChild(postsHeader);
  const postsBody = document.createElement('div');
  postsBody.className = 'terminal-body';
  const ul = document.createElement('ul');
  ul.className = 'list';
  postsBody.appendChild(ul);
  const pager = document.createElement('div');
  pager.className = 'pager';
  postsBody.appendChild(pager);
  postsPanel.appendChild(postsBody);
  hero.appendChild(postsPanel);

  main.appendChild(hero);

  // ===== 启动 canvas 动画 =====
  const stopAnim = startAsciiFlow(canvas, ASCII_TEXT);

  // ===== 分页 + 列表渲染 =====
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const initialPage = 1;

  function renderPage(page) {
    const safePage = Math.max(1, Math.min(totalPages, page | 0));
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pagePosts = posts.slice(start, end);

    postsHeader.innerHTML = `<span class="title">~/recent.md</span><span class="active-badge">${start + 1}-${Math.min(end, posts.length)} / ${posts.length}</span>`;

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

    pager.innerHTML = '';
    if (totalPages <= 1) {
      pager.style.display = 'none';
      return;
    }
    pager.style.display = '';
    const firstBtn = makePagerBtn('« first', safePage === 1, () => renderPage(1));
    pager.appendChild(firstBtn);
    const prevBtn = makePagerBtn('‹ prev', safePage === 1, () => renderPage(safePage - 1));
    pager.appendChild(prevBtn);
    for (let i = 1; i <= totalPages; i++) {
      const b = makePagerBtn(String(i), false, () => renderPage(i));
      if (i === safePage) b.classList.add('active');
      pager.appendChild(b);
    }
    const nextBtn = makePagerBtn('next ›', safePage === totalPages, () => renderPage(safePage + 1));
    pager.appendChild(nextBtn);
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

  return () => stopAnim();
}
