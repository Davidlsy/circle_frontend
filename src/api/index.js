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
    }
    return Promise.reject(err)
  }
)

export default api
