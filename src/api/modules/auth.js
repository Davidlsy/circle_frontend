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
export const getAuthorizeUrl = (provider, intent = 'login') =>
  api.get(`/auth/oauth/${provider}/authorize`, { params: { intent } })
