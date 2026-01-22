import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',  // 监听所有网络接口
    port: 5173,
    strictPort: false,
    proxy: {
      // 代理所有 /api 请求到后端服务器
      '/api': {
        target: 'http://10.82.1.215:8083',  // 后端服务器地址，请根据实际情况修改
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
