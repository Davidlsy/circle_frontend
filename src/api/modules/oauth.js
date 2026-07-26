import api from '../index'

// 平台标识与中文名映射
export const PROVIDER_NAMES = {
  wechat: '微信',
  douyin: '抖音',
  alipay: '支付宝',
}

// 获取授权 URL（purpose=login 用于登录，purpose=bind 用于绑定）
export const getAuthorizeUrl = (provider, purpose = 'login') =>
  api.get(`/auth/oauth/${provider}/authorize`, { params: { purpose } })

// 第三方登录回调
export const oauthCallback = (provider, code, state) =>
  api.post(`/auth/oauth/${provider}/callback`, { code, state })

// 绑定第三方账号
export const bindOAuth = (provider, code, state) =>
  api.post(`/auth/oauth/${provider}/bind`, { code, state })

// 解绑第三方账号
export const unbindOAuth = (provider) =>
  api.delete(`/auth/oauth/${provider}/unbind`)

// 查询已绑定的第三方账号列表
export const getOAuthBindings = () => api.get('/auth/oauth/bindings')
