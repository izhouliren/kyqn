// Markdown 渲染：fetch + marked + 内存缓存 + prefetch
//
// 优化点：
// 1. 内存缓存（Map）：同篇文章不重复加载
// 2. 静态资源用 fetch + 显式 URL，不走 import() 的 module loader 开销
// 3. prefetch() 暴露给 view，在 hover 文章列表项时预取

import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import makefile from 'highlight.js/lib/languages/makefile';
import diff from 'highlight.js/lib/languages/diff';
import ini from 'highlight.js/lib/languages/ini';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import sql from 'highlight.js/lib/languages/sql';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('go', go);
hljs.registerLanguage('makefile', makefile);
hljs.registerLanguage('diff', diff);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('shell', bash);
import { posts as postsMeta } from '../data/posts.js';

// Vite glob：让 build 时每篇 .md 变成独立 chunk，dev 也能取到
const articleModules = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default' });

// 让所有外链自动在新标签打开
const renderer = new marked.Renderer();
const origLink = renderer.link.bind(renderer);
renderer.link = ({ href, title, text, tokens }) => {
  const html = origLink({ href, title, text, tokens });
  if (/^https?:\/\//.test(href)) {
    return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
  }
  return html;
};

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (_) {}
    }
    return code;
  }
}));

marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
  renderer,
});

// 文章 -> URL 映射表（dev: 直接 import；prod: build 注入）
// 走 fetch 拿 ?raw 资源：dev 走 Vite 的 /src/posts/xxx.md?raw，prod 走 Vite build 出的 /assets/xxx-xxx.js
// 为了统一：dev/prod 都用 fetch('/src/posts/xxx.md?raw')，但这只在 dev 工作
// prod 的 chunk 是个 ESM module 不是 raw markdown，URL 是 /assets/xxx-HASH.js
//
// 解决：让 Vite 把每个 .md 编译成 raw import 并通过 build manifest 暴露
// 简化方案：dev/prod 统一用 dynamic import 拿 raw（性能差距很小，因为 chunk 已经被浏览器缓存）

const cache = new Map();   // slug -> Promise<{data, html}>
const inFlight = new Map(); // slug -> Promise<{data, html}> 防止并发重复请求

// frontmatter 解析（极简）
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) {
      let v = kv[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (v.startsWith('[') && v.endsWith(']')) {
        v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
      data[kv[1]] = v;
    }
  }
  return { data, body: raw.slice(m[0].length) };
}

// 实际加载函数
async function _load(slug) {
  const key = `../posts/${slug}.md`;
  const loader = articleModules[key];
  if (!loader) throw new Error(`找不到文章：${slug}`);
  const raw = await loader();
  const { data, body } = parseFrontmatter(raw);
  const html = marked.parse(body);
  return { data, html };
}

// 公开 API：带缓存
export function loadPost(slug) {
  // 命中缓存
  if (cache.has(slug)) return cache.get(slug);
  // 正在加载：复用 inflight
  if (inFlight.has(slug)) return inFlight.get(slug);

  const p = _load(slug)
    .then((r) => {
      cache.set(slug, Promise.resolve(r));
      inFlight.delete(slug);
      return r;
    })
    .catch((e) => {
      inFlight.delete(slug);
      return { data: {}, html: `<p>文章加载失败：${e.message}</p>`, error: e };
    });
  inFlight.set(slug, p);
  return p;
}

// 预取（不阻塞、不抛错）
export function prefetch(slug) {
  if (cache.has(slug) || inFlight.has(slug)) return;
  // 用 requestIdleCallback 推迟到空闲时
  const run = () => loadPost(slug);
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 100);
  }
}

// 批量预取所有文章（首次访问 home/posts 时调用）
export function prefetchAll() {
  for (const p of postsMeta) prefetch(p.slug);
}
