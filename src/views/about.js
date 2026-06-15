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
      <span class="accent-text">${about.name}</span> // ${about.role}
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
  const contactLabel = document.createElement('div');
  contactLabel.className = 'section-label';
  contactLabel.style.marginTop = '20px';
  contactLabel.textContent = '·  contact';
  body.appendChild(contactLabel);

  const contact = document.createElement('p');
  contact.innerHTML = `email — <a class="link" href="mailto:${about.email}">${about.email}</a>`;
  body.appendChild(contact);

  wrap.appendChild(body);
  main.appendChild(wrap);

  return () => {};
}
