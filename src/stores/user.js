import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProfile } from '@/api/modules/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  async function fetchProfile() {
    // 游客无 token，直接跳过，避免无谓的 401 请求
    if (!token.value) return
    try {
      const data = await getProfile()
      user.value = data
    } catch {
      logout()
    }
  }

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, fetchProfile, setToken, logout }
})
