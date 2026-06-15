// ASCII art for the blog title

export const logoArt = String.raw`
 _   __      _ _        _ _       _   _             
| | / /     (_) |      | (_)     | | (_)            
| |/ / _ __  _| |_ ___ | |_  ___ | |_ _  ___  _ __  
|    \| '_ \| | __/ _ \| | |/ _ \| __| |/ _ \| '_ \ 
| |\  \ | | | | || (_) | | | (_) | |_| | (_) | | | |
\_| \_/_| |_|_|\__\___/|_|_|\___/ \__|_|\___/|_| |_|
`;

export function fillDots(text, max = 50) {
  if (text.length >= max) return '';
  return '.'.repeat(max - text.length);
}

export function bootLine({ spinner = '>', label, value, pending = false }) {
  return { spinner, label, value, pending };
}

// 模拟 git-merge 那个 boot 序列
export const bootSequence = () => [
  bootLine({ label: 'initializing kaiyuanqingnian // blog', value: 'OK' }),
  bootLine({ label: 'loading preferences', value: 'OK' }),
  bootLine({ label: 'fetching posts from git', value: 'OK' }),
  bootLine({ label: 'parsing markdown', value: 'OK' }),
  bootLine({ label: 'mounting styles', value: 'OK' }),
  bootLine({ label: 'theme', value: 'auto' }),
];
