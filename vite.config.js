import { defineConfig } from 'vite';

export default defineConfig({
  // 仓库根放源码，dist 给 Vercel 默认读取
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 把 marked 拆成独立 chunk（手动分包）
        manualChunks: {
          marked: ['marked'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
