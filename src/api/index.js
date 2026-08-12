import axios from 'axios'
import router from '@/router'
import { showAuthModal } from '@/composables/useAuthGuard'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      // token 过期/被踢下线：清除本地 token
      const hadToken = !!localStorage.getItem('token')
      localStorage.removeItem('token')
      // 当前路由（保留 redirect 回跳）
      const currentPath = router.currentRoute.value.fullPath
      // 弹出过期提示，不主动跳转以避免打断游客正在浏览的公开内容
      if (hadToken) {
        showAuthModal('登录已过期，请重新登录', currentPath)
      }
    } else if (!err.response) {
      // 无响应：网络层错误（断网 / 后端未启动 / 跨域 CORS 被浏览器拦截）
      const isTimeout = err.code === 'ECONNABORTED'
      err.message = isTimeout
        ? '请求超时，请稍后重试'
        : '网络连接失败：请确认后端服务已启动，且前端域名已在后端 CORS_ORIGINS 白名单中（否则会被浏览器跨域拦截）'
    } else {
      // 有响应但非 2xx：优先提取后端 detail / message 文案
      const detail = err.response?.data?.detail || err.response?.data?.message
      if (detail) {
        err.message = typeof detail === 'string' ? detail : JSON.stringify(detail)
      }
    }
    return Promise.reject(err)
  }
)

export default api
