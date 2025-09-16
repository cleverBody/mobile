import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/shared': resolve(__dirname, '../src') // 引用桌面版共享代码
    }
  },
  server: {
    port: 8080
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
