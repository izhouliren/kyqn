import { projects } from '../data/posts.js';

export function projectsView(main) {
  main.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'terminal-window';

  const header = document.createElement('div');
  header.className = 'terminal-header';
  header.innerHTML = `<span class="title">~/projects/</span><span class="active-badge">${projects.length}</span>`;
  wrap.appendChild(header);

  const body = document.createElement('div');
  body.className = 'terminal-body';

  const ul = document.createElement('ul');
  ul.className = 'tree';
  projects.forEach((p, i) => {
    const li = document.createElement('li');
    if (i === projects.length - 1) li.classList.add('last');
    li.innerHTML = `
      <span class="key">${p.name}</span>
      <span class="val">— ${p.desc}</span>
      <a class="link" href="${p.link}" target="${p.link === '#' ? '_self' : '_blank'}" rel="noopener" style="margin-left:6px;">↗</a>
    `;
    ul.appendChild(li);
  });
  body.appendChild(ul);
  wrap.appendChild(body);
  main.appendChild(wrap);

  return () => {};
}
