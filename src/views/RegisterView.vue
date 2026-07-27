<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">注册</h2>
      <p class="auth-subtitle">加入 CIRCLE 粉丝社群</p>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            autocomplete="username"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">昵称</label>
          <input
            v-model="form.nickname"
            type="text"
            class="form-input"
            placeholder="请输入昵称"
            autocomplete="nickname"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="请输入密码（至少6位）"
            autocomplete="new-password"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            placeholder="请再次输入密码"
            autocomplete="new-password"
            :disabled="loading"
          />
        </div>

        <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="btn-loading">
            <span class="spinner-sm"></span>
          </span>
          <span>{{ loading ? '注册中...' : '注册' }}</span>
        </button>
      </form>

      <!-- 第三方注册 -->
      <div class="oauth-section">
        <div class="oauth-divider">
          <span>使用第三方账号注册</span>
        </div>
        <div class="oauth-buttons">
          <button
            class="oauth-btn oauth-btn--wechat"
            :disabled="oauthLoading"
            title="微信注册"
            @click="handleOAuthRegister('wechat')"
          >
            <span class="oauth-icon wechat-icon">微信</span>
          </button>
          <button
            class="oauth-btn oauth-btn--douyin"
            :disabled="oauthLoading"
            title="抖音注册"
            @click="handleOAuthRegister('douyin')"
          >
            <span class="oauth-icon douyin-icon">抖音</span>
          </button>
          <button
            class="oauth-btn oauth-btn--alipay"
            :disabled="oauthLoading"
            title="支付宝注册"
            @click="handleOAuthRegister('alipay')"
          >
            <span class="oauth-icon alipay-icon">支付宝</span>
          </button>
        </div>
      </div>

      <div class="auth-link">
        已有账号？<router-link to="/login">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/modules/auth'
import { getAuthorizeUrl } from '@/api/modules/oauth'

const router = useRouter()

const loading = ref(false)
const oauthLoading = ref(false)
const errorMsg = ref('')

const form = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
})

function validate() {
  if (!form.username.trim()) {
    errorMsg.value = '请输入用户名'
    return false
  }
  if (!form.nickname.trim()) {
    errorMsg.value = '请输入昵称'
    return false
  }
  if (!form.password) {
    errorMsg.value = '请输入密码'
    return false
  }
  if (form.password.length < 6) {
    errorMsg.value = '密码长度不能少于6位'
    return false
  }
  if (form.password !== form.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return false
  }
  return true
}

async function handleRegister() {
  errorMsg.value = ''

  if (!validate()) return

  loading.value = true
  try {
    await register({
      username: form.username.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
    })
    errorMsg.value = ''
    router.push({ path: '/login', query: { msg: '注册成功请登录' } })
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.error || '注册失败，请稍后重试'
    errorMsg.value = message
  } finally {
    loading.value = false
  }
}

// 第三方注册：获取授权 URL 并跳转
async function handleOAuthRegister(provider) {
  if (oauthLoading.value) return
  oauthLoading.value = true
  errorMsg.value = ''
  try {
    const data = await getAuthorizeUrl(provider, 'login')
    // 保存 state 用于回调页 CSRF 校验
    localStorage.setItem('oauth_state', data.state)
    localStorage.setItem('oauth_action', 'register')
    // 跳转到第三方授权页
    window.location.href = data.authorize_url
  } catch (err) {
    oauthLoading.value = false
    errorMsg.value = err.response?.data?.detail || '获取授权链接失败，请稍后重试'
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  width: 400px;
  max-width: 90vw;
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 40px;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--text-light);
  text-align: center;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  height: 44px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 14px;
  font-size: 14px;
  color: var(--text);
  transition: all 0.25s ease;
}

.form-input:focus {
  border-color: var(--primary);
  background: var(--card);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.form-input::placeholder {
  color: var(--text-light);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-error {
  color: #e74c3c;
  font-size: 13px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #fdf0ef;
  border-radius: var(--radius-sm);
  border: 1px solid #fdd;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  padding: 0 24px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
  white-space: nowrap;
  cursor: pointer;
  border: none;
}

.btn-primary {
  width: 100%;
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-loading {
  display: inline-flex;
  align-items: center;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-link {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-light);
}

.auth-link a {
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
}

.auth-link a:hover {
  color: var(--primary-hover);
}

/* 第三方注册 */
.oauth-section {
  margin-top: 28px;
}

.oauth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-light);
  font-size: 12px;
}

.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.oauth-divider span {
  padding: 0 16px;
}

.oauth-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.oauth-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: var(--card);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.oauth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.oauth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.oauth-btn--wechat:hover {
  border-color: #07C160;
}

.oauth-btn--douyin:hover {
  border-color: #000000;
}

.oauth-btn--alipay:hover {
  border-color: #1677FF;
}

.oauth-icon {
  font-size: 11px;
  font-weight: 600;
  user-select: none;
}

.wechat-icon {
  color: #07C160;
}

.douyin-icon {
  color: #000000;
}

.alipay-icon {
  color: #1677FF;
}
</style>