import api from '../index'
export const getFeed = (params) => api.get('/feed/', { params })
export const followUser = (id) => api.post(`/users/${id}/follow`)
export const unfollowUser = (id) => api.post(`/users/${id}/follow`)  // toggle
export const getFollowers = (id, params) => api.get(`/users/${id}/followers`, { params })
export const getFollowing = (id, params) => api.get(`/users/${id}/following`, { params })

// 用户公开资料。后端 user_router 与 follow_router 均声明 /users/{id}，
// 且返回结构不一致（user_router 版缺 followers/following 计数字段，仅给 stats.post_count）。
// 此处做归一化，避免个人主页统计出现 undefined / NaN（R2）。
function normalizeUserProfile(u) {
  if (!u || typeof u !== 'object') return u
  const stats = u.stats || {}
  return {
    ...u,
    followers_count: u.followers_count ?? stats.follower_count ?? 0,
    following_count: u.following_count ?? stats.following_count ?? 0,
    posts_count: u.posts_count ?? stats.post_count ?? 0,
    display_badge: u.display_badge ?? null,
  }
}

export const getUserProfile = async (id) => {
  const data = await api.get(`/users/${id}`)
  return normalizeUserProfile(data)
}

// 个人主页帖子列表专用端点（R7）。后端默认仅返回近 30 天已审核帖子，
// 这里传 days=365 以尽量覆盖历史发帖。
// 响应：{ posts: [...], total, page, page_size }
export const getUserPosts = (id, params) =>
  api.get(`/users/${id}/posts`, { params: { days: 365, ...params } })

