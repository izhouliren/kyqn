#!/usr/bin/env node
// post-build: 给 dist/index.html 注入每篇 markdown 文章的 <link rel="modulepreload">
// 跑法: node scripts/inject-preload.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found, run `npm run build` first');
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

// 找所有文章 chunk 文件
const files = fs.readdirSync(path.join(distDir, 'assets'));
const articleSlugs = [
  'hello-world',
  'spacemit-k3-llama-cpp-benchmark',
  'openclaw-node-onboarding',
  'linux-kernel-viz',
  'cron-isolated-mode',
];

const articleFiles = files
  .filter((f) => {
    if (!f.endsWith('.js')) return false;
    const m = f.match(/^([\w-]+)-([A-Za-z0-9_-]{6,})\.js$/);
    return m && articleSlugs.includes(m[1]);
  })
  .sort();

if (articleFiles.length === 0) {
  console.log('No article chunks found, skipping');
  process.exit(0);
}

// 跳过已有 preload
if (html.includes('rel="modulepreload" crossorigin href="/assets/hello-world-')) {
  console.log('Article preload already injected, skipping');
  process.exit(0);
}

// 插入
const links = articleFiles
  .map((f) => `<link rel="modulepreload" crossorigin href="/assets/${f}">`)
  .join('\n    ');

html = html.replace(
  /<script type="module" crossorigin src="([^"]+)"><\/script>/,
  `<script type="module" crossorigin src="$1"></script>\n    ${links}`
);

fs.writeFileSync(htmlPath, html);
console.log(`Injected ${articleFiles.length} article preload links:`);
for (const f of articleFiles) console.log(`  - ${f}`);
