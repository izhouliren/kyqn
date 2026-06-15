// Markdown 渲染：marked + 链接处理（外链自动 target=_blank）+ 表格/任务列表
import { marked } from 'marked';

// 让所有外链自动在新标签打开
const renderer = new marked.Renderer();
const origLink = renderer.link.bind(renderer);
renderer.link = ({ href, title, text, tokens }) => {
  const html = origLink({ href, title, text, tokens });
  // 只给 http(s) 外链加 target
  if (/^https?:\/\//.test(href)) {
    return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
  }
  return html;
};

marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown（表格、删除线、任务列表、autolink）
  breaks: false,    // 单换行不转 <br>（保留 Markdown 语义）
  pedantic: false,
  renderer,
});

// 文章 frontmatter 解析（极简：只读开头的 --- ... --- 块里的 key: value）
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) {
      let v = kv[2].trim();
      // 去掉包裹的引号
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      // tags: [a, b, c] 或 [a,b,c]
      if (v.startsWith('[') && v.endsWith(']')) {
        v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
      data[kv[1]] = v;
    }
  }
  return { data, body: raw.slice(m[0].length) };
}

// 加载并渲染一篇文章：返回 { data, html }
export async function loadPost(slug) {
  try {
    // Vite 静态资源：使用 ?raw 拿到字符串，?url 拿到 URL
    const mod = await import(`../posts/${slug}.md?raw`);
    const { data, body } = parseFrontmatter(mod.default);
    const html = marked.parse(body);
    return { data, html };
  } catch (e) {
    return { data: {}, html: `<p>文章加载失败：${e.message}</p>`, error: e };
  }
}
