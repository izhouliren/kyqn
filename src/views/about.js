import { about } from '../data/posts.js';

export function aboutView(main) {
  main.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'terminal-window';

  const header = document.createElement('div');
  header.className = 'terminal-header';
  header.innerHTML = `<span class="title">~/about</span><span class="active-badge">README</span>`;
  wrap.appendChild(header);

  const body = document.createElement('div');
  body.className = 'terminal-body bio';

  // ASCII 风格的身份卡片
  body.innerHTML = `
    <p style="margin-bottom:16px;">
      ${about.name ? `<span class="accent-text">${about.name}</span>` : ""}${about.name && about.role ? " // " : ""}${about.role || ""}
    </p>
    ${about.intro.map((p) => `<p>${p}</p>`).join('')}
  `;

  // 树状 metadata
  const treeLabel = document.createElement('div');
  treeLabel.className = 'section-label';
  treeLabel.style.marginTop = '20px';
  treeLabel.textContent = '·  environment';
  body.appendChild(treeLabel);

  const tree = document.createElement('ul');
  tree.className = 'tree';
  about.tree.forEach((item, i) => {
    const li = document.createElement('li');
    if (i === about.tree.length - 1) li.classList.add('last');
    li.innerHTML = `<span class="key">${item.key}</span><span class="dots"></span><span class="val">${item.val}</span>`;
    tree.appendChild(li);
  });
  body.appendChild(tree);

  // 联系
  if (about.email) {
    const contactLabel = document.createElement('div');
    contactLabel.className = 'section-label';
    contactLabel.style.marginTop = '20px';
    contactLabel.textContent = '·  contact';
    body.appendChild(contactLabel);

    const contact = document.createElement('p');
    contact.innerHTML = `email — <a class="link" href="mailto:${about.email}">${about.email}</a>`;
    body.appendChild(contact);
  }

  wrap.appendChild(body);
  main.appendChild(wrap);

  return () => {};
}


// 复用函数：把 about 内容渲染到指定的 container
export function renderAboutBody(target, aboutData, opts = {}) {
  // 创建可滚动的 content wrapper
  const contentBox = document.createElement('div');
  contentBox.className = 'about-content';
  target.appendChild(contentBox);

  contentBox.innerHTML = `
    <p style="margin-bottom:12px;">
      ${aboutData.name ? `<span class="accent-text">${aboutData.name}</span>` : ""}${aboutData.name && aboutData.role ? " // " : ""}${aboutData.role || ""}
    </p>
    ${aboutData.intro.map((p) => `<p>${p}</p>`).join('')}
  `;

  const treeLabel = document.createElement('div');
  treeLabel.className = 'section-label';
  treeLabel.style.marginTop = '14px';
  treeLabel.textContent = '·  environment';
  contentBox.appendChild(treeLabel);

  const tree = document.createElement('ul');
  tree.className = 'tree';
  aboutData.tree.forEach((item, i) => {
    const li = document.createElement('li');
    if (i === aboutData.tree.length - 1) li.classList.add('last');
    li.innerHTML = `<span class="key">${item.key}</span><span class="dots"></span><span class="val">${item.val}</span>`;
    tree.appendChild(li);
  });
  contentBox.appendChild(tree);

  if (aboutData.email) {
    const contactLabel = document.createElement('div');
    contactLabel.className = 'section-label';
    contactLabel.style.marginTop = '14px';
    contactLabel.textContent = '·  contact';
    contentBox.appendChild(contactLabel);

    const contact = document.createElement('p');
    contact.innerHTML = `email — <a class="link" href="mailto:${aboutData.email}">${aboutData.email}</a>`;
    contentBox.appendChild(contact);
  }

  // read more 链接 → 跳到完整 about 页（放在 contentBox 外面，永远可见）
  if (opts.collapsible !== false) {
    const more = document.createElement('a');
    more.className = 'read-more-link';
    more.href = '#/about';
    more.textContent = '→ read more';
    target.appendChild(more);
  }
}
