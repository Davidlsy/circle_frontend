<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">找回密码</h2>
      <p class="auth-subtitle">通过邮箱验证码重置你的密码</p>

      <!-- 步骤一：获取验证码 -->
      <template v-if="step === 1">
        <form @submit.prevent="handleSendCode">
          <div class="form-group">
            <label class="form-label">用户名或注册邮箱</label>
            <input
              v-model="account"
              type="text"
              class="form-input"
              placeholder="请输入用户名或注册邮箱"
              :disabled="loading"
            />
          </div>

          <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '发送中...' : '获取验证码' }}
          </button>
        </form>
      </template>

      <!-- 步骤二：重置密码 -->
      <template v-else>
        <p class="send-tip">{{ sendMsg }}</p>
        <!-- 开发环境后端会直接返回验证码，便于联调；生产环境走邮件，不显示 -->
        <p v-if="devCode" class="dev-code-tip">开发环境验证码：<strong>{{ devCode }}</strong></p>

        <form @submit.prevent="handleReset">
          <div class="form-group">
            <label class="form-label">注册邮箱</label>
            <input
              v-model="resetForm.email"
              type="email"
              class="form-input"
              placeholder="请输入注册时绑定的邮箱"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">验证码</label>
            <input
              v-model="resetForm.code"
              type="text"
              class="form-input"
              placeholder="请输入 6 位验证码"
              maxlength="6"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">新密码</label>
            <input
              v-model="resetForm.newPassword"
              type="password"
              class="form-input"
              placeholder="请输入新密码（至少6位）"
              autocomplete="new-password"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">确认新密码</label>
            <input
              v-model="resetForm.confirmPassword"
              type="password"
              class="form-input"
              placeholder="请再次输入新密码"
              autocomplete="new-password"
              :disabled="loading"
            />
          </div>

          <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '提交中...' : '重置密码' }}
          </button>
        </form>

        <div class="auth-link">
          没收到验证码？<a href="javascript:void(0)" @click="backToStep1">重新获取</a>
        </div>
      </template>

      <div class="auth-link">
        想起密码了？<router-link to="/login">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword, resetPassword } from '@/api/modules/auth'

const router = useRouter()

const step = ref(1)
const loading = ref(false)
const errorMsg = ref('')
const account = ref('')
const sendMsg = ref('')
// 开发环境后端明文返回验证码（生产环境为空字符串）
const devCode = ref('')

const resetForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

async function handleSendCode() {
  errorMsg.value = ''
  if (!account.value.trim()) {
    errorMsg.value = '请输入用户名或注册邮箱'
    return
  }
  loading.value = true
  try {
    const data = await forgotPassword(account.value.trim())
    sendMsg.value = data.msg || '如果账号存在且已绑定邮箱，验证码已发送'
    devCode.value = data.code || ''
    step.value = 2
  } catch (err) {
    errorMsg.value = err.response?.data?.detail || err.message || '发送失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  errorMsg.value = ''
  if (!resetForm.email.trim()) {
    errorMsg.value = '请输入注册邮箱'
    return
  }
  if (!/^\S+@\S+\.\S+$/.test(resetForm.email.trim())) {
    errorMsg.value = '邮箱格式不正确'
    return
  }
  if (resetForm.code.trim().length !== 6) {
    errorMsg.value = '请输入 6 位验证码'
    return
  }
  if (resetForm.newPassword.length < 6) {
    errorMsg.value = '新密码长度不能少于6位'
    return
  }
  if (resetForm.newPassword !== resetForm.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    await resetPassword({
      email: resetForm.email.trim(),
      code: resetForm.code.trim(),
      new_password: resetForm.newPassword,
    })
    router.push({ path: '/login', query: { msg: '密码已重置，请使用新密码登录' } })
  } catch (err) {
    errorMsg.value = err.response?.data?.detail || err.message || '重置失败，请检查验证码'
  } finally {
    loading.value = false
  }
}

function backToStep1() {
  step.value = 1
  errorMsg.value = ''
  devCode.value = ''
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

.send-tip {
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.dev-code-tip {
  font-size: 13px;
  color: #b7791f;
  background: #fffbeb;
  border: 1px solid #fbd38d;
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  margin-bottom: 16px;
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

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
</style>
