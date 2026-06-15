// 一个 ~50 行的 hash router
// 处理 async handler + race condition

const routes = [];
let currentRoute = null;        // 当前 path
let currentKey = 0;             // 自增 counter，区分每次 resolve
let pendingKey = 0;             // 正在跑的 handler 的 key

export function route(pattern, handler) {
  const keys = [];
  const regex = new RegExp(
    '^' +
      pattern
        .replace(/\//g, '\\/')
        .replace(/:(\w+)/g, (_, k) => {
          keys.push(k);
          return '([^\\/]+)';
        }) +
      '$'
  );
  routes.push({ regex, keys, handler, pattern });
}

export function navigate(path) {
  if (location.hash !== '#' + path) {
    location.hash = '#' + path;
  } else {
    // 同一路径：强制重新 resolve（用于刷新当前页）
    resolve();
  }
}

async function resolve() {
  const path = location.hash.replace(/^#/, '') || '/';
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));

      // 自增 key：本次 resolve 抢到 token
      const myKey = ++currentKey;
      const app = document.getElementById('app');

      try {
        // 清空当前内容（同步立刻给用户反馈）
        if (typeof app === 'object' && app) {
          app.innerHTML = '';
        }
        // 跑 handler（可能是 async）
        const result = r.handler(app, params);
        if (result && typeof result.then === 'function') {
          await result;
        }
        // 跑完后检查：本次 resolve 还是最新的吗？
        if (myKey !== currentKey) {
          // 已经被更新的路由切走，丢弃本次结果
          return;
        }
        // 通知导航更新
        window.dispatchEvent(new CustomEvent('route', { detail: { path } }));
        window.scrollTo({ top: 0, behavior: 'instant' });
      } catch (e) {
        console.error('Router handler error:', e);
        if (myKey === currentKey) {
          app.innerHTML = `<p style="padding:24px;color:var(--color-primary);">route 错误：${e.message}</p>`;
        }
      }

      currentRoute = r.pattern;
      return;
    }
  }
  // 404
  const app = document.getElementById('app');
  if (app) app.innerHTML = '<main><p style="padding:24px;">404 — 啥都没有。<a class="link" href="#/">回首页</a></p></main>';
}

export function getCurrentRoute() {
  return currentRoute;
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
