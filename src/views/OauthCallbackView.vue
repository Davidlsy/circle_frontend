<template>
  <div class="oauth-callback-page">
    <div class="oauth-callback-card">
      <!-- 加载中 -->
      <template v-if="status === 'loading'">
        <div class="spinner-lg"></div>
        <p class="callback-text">{{ loadingText }}</p>
      </template>

      <!-- 成功 -->
      <template v-else-if="status === 'success'">
        <div class="callback-icon success">✓</div>
        <p class="callback-text">{{ successText }}</p>
      </template>

      <!-- 需要输入用户名（注册流程） -->
      <template v-else-if="status === 'prompt-username'">
        <h3 class="prompt-title">设置用户名</h3>
        <p class="prompt-desc">为你的新账号设置一个用户名（可选，留空则自动生成）</p>
        <input
          v-model="customUsername"
          type="text"
          class="prompt-input"
          placeholder="请输入用户名（可选）"
          maxlength="50"
          @keyup.enter="submitRegister"
        />
        <p v-if="promptError" class="prompt-error">{{ promptError }}</p>
        <div class="prompt-actions">
          <button class="btn btn-ghost" @click="submitRegister(true)">跳过</button>
          <button class="btn btn-primary" :disabled="registerLoading" @click="submitRegister(false)">
            {{ registerLoading ? '注册中...' : '确认注册' }}
          </button>
        </div>
      </template>

      <!-- 登录未注册：选择去注册或去登录 -->
      <template v-else-if="status === 'unregistered'">
        <div class="callback-icon warning">?</div>
        <p class="callback-text">{{ errorMsg }}</p>
        <div class="choice-actions">
          <button class="btn btn-primary" @click="goRegister">去注册</button>
          <button class="btn btn-outline" @click="goLogin">用本站账号登录</button>
        </div>
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

// 状态：loading | success | prompt-username | unregistered | error
const status = ref('loading')
const errorMsg = ref('')
const loadingText = ref('正在处理授权回调...')
const successText = ref('登录成功，正在跳转...')

// 注册流程的临时数据
const pendingCode = ref('')
const pendingState = ref('')
const pendingProvider = ref('')
const customUsername = ref('')
const promptError = ref('')
const registerLoading = ref(false)

onMounted(() => handleCallback())

async function handleCallback() {
  const provider = route.params.provider
  // 兼容支付宝回调参数名 auth_code
  const code = route.query.code || route.query.auth_code
  const state = route.query.state

  // 参数校验
  if (!code || !state) {
    status.value = 'error'
    errorMsg.value = '授权参数缺失（code 或 state）'
    return
  }

  // state 校验（CSRF 防护）
  const savedState = localStorage.getItem('oauth_state')
  if (!savedState || state !== savedState) {
    status.value = 'error'
    errorMsg.value = 'State 校验失败，可能存在安全风险，请重新发起授权'
    return
  }

  // 读取 action（login / register / bind）
  const action = localStorage.getItem('oauth_action') || 'login'

  // 清理临时存储（state 已校验通过）
  localStorage.removeItem('oauth_state')

  if (action === 'register') {
    // 注册流程：先弹出用户名输入框
    pendingCode.value = code
    pendingState.value = state
    pendingProvider.value = provider
    status.value = 'prompt-username'
    return
  }

  if (action === 'bind') {
    return handleBind(provider, code, state)
  }

  // 默认：登录流程
  return handleLogin(provider, code, state)
}

// ---------- 登录 ----------
async function handleLogin(provider, code, state) {
  loadingText.value = '正在登录...'
  status.value = 'loading'
  try {
    const data = await oauthCallback(provider, code, state)
    userStore.setToken(data.access_token)
    localStorage.removeItem('oauth_action')
    await userStore.fetchProfile()
    successText.value = '登录成功，正在跳转...'
    status.value = 'success'
    setTimeout(() => router.push('/'), 800)
  } catch (err) {
    handleLoginError(err, provider)
  }
}

function handleLoginError(err, provider) {
  const detail = err.response?.data?.detail || ''
  const status_code = err.response?.status

  if (status_code === 400 && detail.includes('未注册或未绑定')) {
    // 登录时发现未注册 → 提供选择
    status.value = 'unregistered'
    errorMsg.value = detail || `该${PROVIDER_NAMES[provider] || provider}账号尚未注册，是否前往注册？`
    return
  }

  // 其他错误
  status.value = 'error'
  errorMsg.value = detail || '登录失败，请重试'
}

// ---------- 注册 ----------
async function submitRegister(skip) {
  if (registerLoading.value) return
  promptError.value = ''

  const username = skip ? undefined : customUsername.value.trim()
  // 不跳过时校验长度
  if (!skip && username && username.length > 50) {
    promptError.value = '用户名不能超过50个字符'
    return
  }

  registerLoading.value = true
  try {
    // R1 修复：注册与登录统一走 oauthCallback（后端首次登录自动建号）。
    // 携带用户名（后端支持时生效）；is_new_user 由后端返回时用于区分文案。
    const data = await oauthCallback(
      pendingProvider.value,
      pendingCode.value,
      pendingState.value,
      username ? { username } : {}
    )
    userStore.setToken(data.access_token)
    localStorage.removeItem('oauth_action')
    await userStore.fetchProfile()

    // 后端未返回 is_new_user 时（当前后端版本未携带），一律按注册成功展示
    successText.value =
      data.is_new_user === false ? '该账号已存在，已为您直接登录' : '注册成功，欢迎加入！'
    status.value = 'success'
    setTimeout(() => router.push('/'), 1000)
  } catch (err) {
    const detail = err.response?.data?.detail || ''
    if (detail.includes('用户名已被使用')) {
      // 用户名冲突，留在输入框让用户重试
      promptError.value = '用户名已被使用，请更换'
    } else {
      // 其他错误直接展示错误页
      status.value = 'error'
      errorMsg.value = detail || '注册失败，请重试'
    }
  } finally {
    registerLoading.value = false
  }
}

// ---------- 绑定 ----------
async function handleBind(provider, code, state) {
  loadingText.value = '正在绑定账号...'
  status.value = 'loading'
  try {
    await bindOAuth(provider, code, state)
    localStorage.removeItem('oauth_action')
    // 绑定完成后跳回个人主页
    const bindRedirect = localStorage.getItem('oauth_bind_redirect') || '/profile'
    localStorage.removeItem('oauth_bind_redirect')
    successText.value = '绑定成功，正在跳转...'
    status.value = 'success'
    setTimeout(() => router.push(bindRedirect), 800)
  } catch (err) {
    const detail = err.response?.data?.detail || ''
    status.value = 'error'
    errorMsg.value = detail || '绑定失败，请重试'
  }
}

// ---------- 跳转 ----------
function goRegister() {
  localStorage.removeItem('oauth_action')
  router.push('/register')
}

function goLogin() {
  localStorage.removeItem('oauth_action')
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
  width: 380px;
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
  line-height: 1.5;
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

.callback-icon.warning {
  background: #f39c12;
}

/* 用户名输入 */
.prompt-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px;
}

.prompt-desc {
  font-size: 13px;
  color: var(--text-light);
  margin: 0 0 20px;
  line-height: 1.5;
}

.prompt-input {
  width: 100%;
  height: 44px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 14px;
  font-size: 14px;
  color: var(--text);
  box-sizing: border-box;
  transition: all 0.25s ease;
}

.prompt-input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-light);
}

.prompt-error {
  color: #e74c3c;
  font-size: 13px;
  margin: 8px 0 0;
  text-align: left;
}

.prompt-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

/* 选择按钮 */
.choice-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

/* 通用按钮 */
.btn {
  height: 40px;
  padding: 0 20px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
}

.btn-primary {
  flex: 1;
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost {
  flex: 1;
  background: var(--bg);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-outline {
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
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
