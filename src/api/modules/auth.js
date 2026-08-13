import api from '../index'

// 登录接口：后端使用 OAuth2PasswordRequestForm，需发送 application/x-www-form-urlencoded
export const login = (data) => {
  const params = new URLSearchParams()
  params.append('username', data.username)
  params.append('password', data.password)
  return api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

export const register = (data) => api.post('/auth/register', data)
export const getProfile = () => api.get('/users/me')

// 第三方账号绑定相关
export const getOAuthBindings = () => api.get('/auth/oauth/bindings')
export const unbindOAuth = (provider) => api.delete(`/auth/oauth/${provider}/unbind`)
// 注意：后端 authorize 只识别 purpose 参数（login/bind）。
// 此前误用 intent，导致绑定流程 state 按 login 生成、按 bind 校验必 400。
export const getAuthorizeUrl = (provider, purpose = 'login') =>
  api.get(`/auth/oauth/${provider}/authorize`, { params: { purpose } })

// 找回密码（后端开发环境会直接返回验证码便于调试；生产环境走邮件）
export const forgotPassword = (username) =>
  api.post('/auth/forgot-password', { username })
export const resetPassword = (data) => api.post('/auth/reset-password', data)
