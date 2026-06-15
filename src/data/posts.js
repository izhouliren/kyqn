// Posts 元数据（不再含 excerpt，正文从 src/posts/<slug>.md 加载）
// 文章按数组顺序展示，可以把重要文章放前面

export const about = {
  name: 'kaiyuanqingnian',
  role: 'tinkerer · linux · risc-v · self-hosted',
  location: 'Shanghai, CN',
  email: 'kaiyuanqingnian@…',
  intro: [
    '一个 <strong>爱折腾</strong>的人。日常和 Linux 内核、RISC-V 板子、自部署服务打交道。',
    '这里记录我踩过的坑、做过的实验、跑过的基准。',
    '如果发现内容有错，<a class="link" href="#">提个 issue</a> 或者直接发邮件。',
  ],
  tree: [
    { key: 'os',        val: 'Bianbu 4.0.1 / Debian trixie' },
    { key: 'editor',    val: 'neovim' },
    { key: 'shell',     val: 'bash + zsh (mixed)' },
    { key: 'langs',     val: 'python, go, rust (learning)' },
    { key: 'hw',        val: 'kyqn · macmini · 3B6000 · pi5' },
    { key: 'uptime',    val: '24/7 unless power outage' },
  ],
};

// slug 必须和 src/posts/<slug>.md 文件名一致
// 列表里只放"摘要信息"，正文走 .md 文件
export const posts = [
  {
    slug: 'hello-world',
    title: 'Hello, world. 重新开始写博客。',
    date: '2026-06-15',
    tags: ['meta'],
    pinned: true,
  },
  {
    slug: 'arch-chinese-input-method-script',
    title: '一键配好 Arch Linux 的中文输入法',
    date: '2026-06-15',
    tags: ['linux', 'arch', 'fcitx5'],
  },
  {
    slug: 'spacemit-k3-llama-cpp-benchmark',
    title: '在 SpacemiT K3 Pico ITX 上跑 llama.cpp',
    date: '2026-06-15',
    tags: ['risc-v', 'llm', 'benchmark'],
  },
  {
    slug: 'openclaw-node-onboarding',
    title: '把 SpacemiT K3 接入 OpenClaw 集群',
    date: '2026-06-15',
    tags: ['openclaw', 'risc-v'],
  },
  {
    slug: 'linux-kernel-viz',
    title: 'Linux Kernel 贡献数据可视化',
    date: '2026-06-14',
    tags: ['viz', 'linux', 'vercel'],
  },
  {
    slug: 'hello-risc-v',
    title: '在 RISC-V 板子上跑 OpenClaw node',
    date: '2026-06-14',
    tags: ['risc-v', 'openclaw'],
  },
  {
    slug: 'cron-isolated-mode',
    title: 'Cron 任务必须用 isolated 模式',
    date: '2026-06-12',
    tags: ['openclaw', 'cron', 'lesson'],
  },
  {
    slug: 'diy-nas-build',
    title: 'DIY NAS：从零搭一台 12TB 的家用存储',
    date: '2026-06-12',
    tags: ['hardware', 'storage'],
  },
  {
    slug: 'pi5-cooling-test',
    title: '树莓派 5 散热对比：官方风扇 vs 第三方塔式',
    date: '2026-06-10',
    tags: ['pi', 'hardware'],
  },
  {
    slug: 'nginx-reverse-proxy',
    title: '用 nginx 给自部署服务做反代 + HTTPS',
    date: '2026-06-08',
    tags: ['nginx', 'self-host'],
  },
  {
    slug: 'cron-isolated-deep',
    title: 'Cron 任务卡死的根因排查（deep dive）',
    date: '2026-06-06',
    tags: ['openclaw', 'cron', 'debug'],
  },
  {
    slug: 'samba-permission-trap',
    title: 'Samba 共享权限的 4 个常见坑',
    date: '2026-06-04',
    tags: ['samba', 'linux'],
  },
  {
    slug: 'markdown-render-perf',
    title: 'marked 渲染 1000 篇文章要多久？',
    date: '2026-06-02',
    tags: ['perf', 'js'],
  },
  {
    slug: 'git-merge-clone',
    title: '用 git-merge.com 的视觉做个人博客',
    date: '2026-05-30',
    tags: ['blog', 'css'],
  },
  {
    slug: 'risc-v-cooling-quirk',
    title: 'SpacemiT K3 散热：风冷 vs 被动散热',
    date: '2026-05-28',
    tags: ['risc-v', 'hardware'],
  },
];

export const projects = [
  {
    name: 'openclaw',
    desc: '多节点 AI agent 集群',
    link: 'https://github.com/izhouliren/openclaw',
    tag: 'infra',
  },
  {
    name: 'linux-kernel-viz',
    desc: '内核贡献数据可视化',
    link: 'https://github.com/izhouliren/linux-kernel-viz',
    tag: 'viz',
  },
  {
    name: 'helloworld',
    desc: 'kernel commit 分析数据 + 爬虫',
    link: 'https://github.com/izhouliren/helloworld',
    tag: 'data',
  },
  {
    name: 'personal-blog',
    desc: '本站，git-merge 风格 + Vite + marked',
    link: '#',
    tag: 'meta',
  },
];
