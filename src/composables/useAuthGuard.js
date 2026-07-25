import { ref } from 'vue'

// 模块级响应式状态：可在组件与 axios 拦截器中共享
export const authModalVisible = ref(false)
export const authModalMessage = ref('请先登录后再操作')
export const authModalRedirect = ref('/')

// 弹出登录引导弹窗
export function showAuthModal(message = '请先登录后再操作', redirect = '/') {
  authModalMessage.value = message
  authModalRedirect.value = redirect
  authModalVisible.value = true
}

// 游客操作拦截：已登录返回 true，未登录弹出引导并返回 false
export function requireAuth(redirect = '/') {
  const token = localStorage.getItem('token')
  if (token) return true
  showAuthModal('请先登录后再操作', redirect)
  return false
}
