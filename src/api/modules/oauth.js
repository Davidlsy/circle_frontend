import api from '../index'

// 平台标识与中文名映射
export const PROVIDER_NAMES = {
  wechat: '微信',
  douyin: '抖音',
  alipay: '支付宝',
}

// 获取授权 URL（purpose=login 用于登录/注册，purpose=bind 用于绑定）
// 响应：{ authorize_url, state, provider }
export const getAuthorizeUrl = (provider, purpose = 'login') =>
  api.get(`/auth/oauth/${provider}/authorize`, { params: { purpose } })

// 第三方账号注册
// 响应：{ access_token, token_type, is_new_user }
export const oauthRegister = (provider, code, state, username) =>
  api.post(`/auth/oauth/${provider}/register`, { code, state, username })

// 第三方账号登录（回调）
// 响应：{ access_token, token_type }
export const oauthCallback = (provider, code, state) =>
  api.post(`/auth/oauth/${provider}/callback`, { code, state })

// 绑定第三方账号（需登录）
// 响应：{ msg: "绑定成功" }
export const bindOAuth = (provider, code, state) =>
  api.post(`/auth/oauth/${provider}/bind`, { code, state })

// 解绑第三方账号（需登录）
// 响应：{ msg: "解绑成功" }
export const unbindOAuth = (provider) =>
  api.delete(`/auth/oauth/${provider}/unbind`)

// 查询已绑定的第三方账号列表（需登录）
// 响应：[{ provider, oauth_uid, created_at }]
export const getOAuthBindings = () => api.get('/auth/oauth/bindings')

// 获取 Mock 测试账号（开发调试用）
export const getMockAccounts = (provider) =>
  api.get(`/mock/oauth/${provider}/accounts`)
