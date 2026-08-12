import api from '../index'

// 粉丝圈列表
// 响应：{ circles: [FanCirclePublic], total, page, page_size }
export const getFanCircles = (params) => api.get('/fan-circles/', { params })

// 粉丝圈详情（按圈子 ID）
// 响应：FanCircleDetail（含 star）
export const getFanCircle = (id) => api.get(`/fan-circles/${id}`)

// 粉丝圈详情（按明星 ID，自动创建）
export const getFanCircleByStar = (starId) => api.get(`/fan-circles/by-star/${starId}`)

// 粉丝圈成员列表
// 响应：{ members: [...], total, page, page_size }
export const getFanCircleMembers = (id, params) =>
  api.get(`/fan-circles/${id}/members`, { params })

// 粉丝圈照片墙
// 响应：{ results | data | list, ... }
export const getFanCirclePhotos = (id, params) =>
  api.get(`/fan-circles/${id}/photos`, { params })

// 我加入的粉丝圈
// 响应：{ circles: [...], total, page, page_size }
export const getMyFanCircles = (params) =>
  api.get('/fan-circles/users/me/joined', { params })
