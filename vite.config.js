import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Mock OAuth 授权页由后端提供（HTML），开发环境经此代理访问，
      // 否则 {OAUTH_FRONTEND_URL}/mock/oauth/{provider} 会落到前端 SPA 兜底而空白
      '/mock': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
