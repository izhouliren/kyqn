# izhouliren // blog

个人博客。git-merge.com 风格 + Vite + 纯原生 JS。

## 开发

```bash
npm install
npm run dev        # http://localhost:5173
```

## 构建

```bash
npm run build      # → dist/
npm run preview    # 本地预览 dist
```

## 部署到 Vercel

1. 把这个目录推到 GitHub 仓库（例如 `izhouliren/izhouliren.github.io`）
2. 在 Vercel 控制台 Import 该仓库
3. 框架自动识别为 Vite，不用额外配置
4. 部署

## 目录

```
src/
├── components/    # 头部、复用组件
├── data/          # posts/projects 元数据
├── utils/         # router、theme、ASCII
├── views/         # 4 个页面：home/posts/projects/about
├── styles.css     # git-merge 风格变量 + 暗/亮模式
└── main.js
```

## 加新文章

编辑 `src/data/posts.js`，在 `posts` 数组前面加：

```js
{
  slug: 'my-new-post',
  title: '我的新文章',
  date: '2026-06-15',
  tags: ['meta'],
  excerpt: '简介',
},
```

路由 `/posts/:slug` 会自动可用。

## 风格参考

- 字体：Spline Sans Mono（主体）+ JetBrains Mono（代码）
- 强调色：橙红（light: `#e94f0d`，dark: `#ff6122`）
- 布局：CSS Grid，1300px 最大宽度
- 暗/亮模式：跟随系统 + localStorage 覆盖
