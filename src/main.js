import './styles.css';
import { applyStoredTheme } from './utils/theme.js';
import { route, startRouter } from './utils/router.js';
import { renderHeader } from './components/header.js';
import { homeView } from './views/home.js';
import { postsView, postDetailView } from './views/posts.js';
import { projectsView } from './views/projects.js';
import { aboutView } from './views/about.js';

// 1. 主题（必须在 #app 渲染前）
applyStoredTheme();

// 2. 装配 DOM 外壳
const app = document.getElementById('app');
app.innerHTML = '';

const main = document.createElement('main');
main.appendChild(renderHeader());

const content = document.createElement('div');
content.className = 'content';
content.id = 'view-root';
main.appendChild(content);

app.appendChild(main);

// 3. 让 router 把 view 写进 #view-root（默认找 #app）
const _getElementById = document.getElementById.bind(document);
document.getElementById = function (id) {
  if (id === 'app') return _getElementById('view-root');
  return _getElementById(id);
};

// 4. 注册路由
route('/', homeView);
route('/posts', postsView);
route('/posts/:slug', postDetailView);
route('/projects', projectsView);
route('/about', aboutView);

// 5. 启动
startRouter();
