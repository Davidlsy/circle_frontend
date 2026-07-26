<template>
  <div class="oauth-callback-page">
    <div class="oauth-callback-card">
      <!-- 加载中 -->
      <template v-if="status === 'loading'">
        <div class="spinner-lg"></div>
        <p class="callback-text">正在完成登录...</p>
      </template>

      <!-- 成功 -->
      <template v-else-if="status === 'success'">
        <div class="callback-icon success">✓</div>
        <p class="callback-text">{{ successText }}</p>
      </template>

      <!-- 失败 -->
      <template v-else>
        <div class="callback-icon error">✕</div>
        <p class="callback-text error-text">{{ errorMsg }}</p>
        <button class="btn-back" @click="goLogin">返回登录</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { oauthCallback, bindOAuth, PROVIDER_NAMES } from '@/api/modules/oauth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const status = ref('loading') // loading | success | error
const errorMsg = ref('')
const successText = ref('登录成功，正在跳转...')

onMounted(() => handleCallback())

async function handleCallback() {
  const provider = route.params.provider
  // 兼容支付宝回调参数名 auth_code
  const code = route.query.code || route.query.auth_code
  const state = route.query.state

  // 参数校验
  if (!code || !state) {
    status.value = 'error'
    errorMsg.value = '授权参数缺失'
    return
  }

  // 通过 sessionStorage 判断是登录还是绑定
  const bindRedirect = sessionStorage.getItem('oauth_bind_redirect')

  try {
    if (bindRedirect) {
      // 绑定流程
      await bindOAuth(provider, code, state)
      sessionStorage.removeItem('oauth_bind_redirect')
      successText.value = '绑定成功，正在跳转...'
      status.value = 'success'
      setTimeout(() => router.push(bindRedirect), 1000)
    } else {
      // 登录流程
      const data = await oauthCallback(provider, code, state)
      userStore.setToken(data.access_token)
      await userStore.fetchProfile()
      successText.value = '登录成功，正在跳转...'
      status.value = 'success'
      setTimeout(() => router.push('/'), 1000)
    }
  } catch (err) {
    status.value = 'error'
    errorMsg.value = err.response?.data?.detail || '登录失败，请重试'
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.oauth-callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.oauth-callback-card {
  width: 360px;
  max-width: 90vw;
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 48px 40px;
  text-align: center;
}

.spinner-lg {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

.callback-text {
  font-size: 15px;
  color: var(--text);
  margin: 0;
}

.error-text {
  color: #e74c3c;
}

.callback-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.callback-icon.success {
  background: #07C160;
}

.callback-icon.error {
  background: #e74c3c;
}

.btn-back {
  margin-top: 20px;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-back:hover {
  background: var(--primary-hover);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
