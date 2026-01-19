import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "开源青年",
  description: "一个VitePress网站",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文稿', link: '/official-examples/markdown-articles' }
    ],

    sidebar: [
      {
        text: '文稿',
        items: [
          {
            text: '官方示例',
            items: [
              { text: 'Markdown文稿', link: '/official-examples/markdown-articles' },
              { text: '运行时API文稿', link: '/official-examples/api-articles' }
            ]
          },
          {
            text: 'Linux 30年',
            items: [
              { text: '被嘲笑是"黑客玩具"？Linux是如何在微软和UNIX的夹缝中逆天改命的？', link: '/linux-30-years/linux-history' }
            ]
          },
          { text: 'EndevaourOS 适中化设置', link: '/articles/endeavouros-moderate-setup' },
          { text: 'CachyOS 安装初始化脚本', link: '/articles/cachyos-install-script' },
            
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://gitcode.com/ozhouliren' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/51420401' },
      { icon: 'wechat', link: '#', ariaLabel: '公众号' }
    ],
    
    // GitHub 编辑链接配置
    editLink: {
      pattern: 'https://github.com/izhouliren/kyqn/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
})
