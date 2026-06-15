import { posts } from '../data/posts.js';
import { navigate } from '../utils/router.js';
import { loadPost, prefetch } from '../utils/markdown.js';

export function postsView(main) {
  main.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'terminal-window';

  const header = document.createElement('div');
  header.className = 'terminal-header';
  header.innerHTML = `<span class="title">~/posts/</span><span class="active-badge">${posts.length}</span>`;
  wrap.appendChild(header);

  const body = document.createElement('div');
  body.className = 'terminal-body';

  const ul = document.createElement('ul');
  ul.className = 'list';
  posts.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    if (i === posts.length - 1) li.classList.add('last');
    li.innerHTML = `
      <span class="date">${p.date}</span>
      <span class="title">${p.pinned ? '★ ' : ''}${p.title}</span>
      <span class="tag">${(p.tags[0] || 'misc').toUpperCase()}</span>
      <span class="arrow">→</span>
    `;
    li.addEventListener('click', () => navigate('/posts/' + p.slug));
    // hover/touchstart 就预取
    li.addEventListener('mouseenter', () => prefetch(p.slug));
    li.addEventListener('touchstart', () => prefetch(p.slug), { passive: true });
    ul.appendChild(li);
  });
  body.appendChild(ul);
  wrap.appendChild(body);
  main.appendChild(wrap);
}

export function postDetailView(main, params) {
  // 1. 立刻渲染骨架（同步）—— 用户看到 "loading..."
  main.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'terminal-window';

  const header = document.createElement('div');
  header.className = 'terminal-header';
  header.innerHTML = `<span class="title">~/posts/${params.slug}.md</span><span class="active-badge">LOADING</span>`;
  wrap.appendChild(header);

  const body = document.createElement('div');
  body.className = 'terminal-body';
  body.innerHTML = '<p style="color:var(--color-text-muted);"><span class="cursor"></span> 加载中…</p>';
  wrap.appendChild(body);
  main.appendChild(wrap);

  // 2. 取消标志：路由切走后，set 这次加载就放弃
  let cancelled = false;
  const cleanup = () => {
    cancelled = true;
  };

  // 3. 异步加载
  (async () => {
    const { data, html, error } = await loadPost(params.slug);

    // 已被新路由抢占 → 什么都不做
    if (cancelled) return;

    // 找不到
    if (error && /Cannot find module|Failed to fetch|404/.test(error.message)) {
      main.innerHTML = '';
      const err = document.createElement('div');
      err.className = 'terminal-window';
      err.innerHTML = `
        <div class="terminal-header"><span class="title">404</span><span class="active-badge">NOT FOUND</span></div>
        <div class="terminal-body">
          <p>文章 <code>${escapeHtml(params.slug)}</code> 不存在。</p>
          <p style="margin-top:8px;"><a class="link" href="#/posts">← 返回列表</a></p>
        </div>
      `;
      main.appendChild(err);
      return;
    }

    // 优先用 frontmatter 里的元数据
    const meta = posts.find((p) => p.slug === params.slug) || {};
    const title = data.title || meta.title || params.slug;
    const date = data.date || meta.date || '';
    const tags = data.tags || meta.tags || [];

    // 更新 header 状态
    header.querySelector('.active-badge').textContent = (tags[0] || 'POST').toUpperCase();
    header.querySelector('.title').textContent = `~/posts/${params.slug}.md`;

    // 渲染正文
    body.classList.add('article');
    body.innerHTML = `
      <h1>${escapeHtml(title)}</h1>
      <div class="article-meta">
        <span>${escapeHtml(date)}</span>
        <span>·</span>
        <span>${tags.map(escapeHtml).join(', ')}</span>
      </div>
      ${html}
      <hr style="border:none;border-top:1px dashed var(--color-text-muted);opacity:0.3;margin:32px 0 16px;">
      <p><a class="link" href="#/posts">← 返回列表</a></p>
    `;
  })();

  // 4. 返回 cleanup：路由切走时被 router 调用
  return cleanup;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
