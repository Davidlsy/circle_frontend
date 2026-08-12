import api from '../index'
export const getFeed = (params) => api.get('/feed/', { params })
export const followUser = (id) => api.post(`/users/${id}/follow`)
export const unfollowUser = (id) => api.post(`/users/${id}/follow`)  // toggle
export const getFollowers = (id, params) => api.get(`/users/${id}/followers`, { params })
export const getFollowing = (id, params) => api.get(`/users/${id}/following`, { params })

// 用户公开资料。后端 user_router 与 follow_router 均声明 GET /users/{id}，
// 且 follow_router 注册在前 → 实际生效的是 follow_router 版：
//   { id, username, nickname, avatar_url, bio, created_at, follower_count, following_count }
// 而 user_router 版为：
//   { id, username, avatar, bio, created_at, display_badge, stats: { post_count } }
// 两种结构字段名不一致（follower_count vs followers_count、avatar_url vs avatar），
// 此处做归一化，避免个人主页统计/头像出现 undefined / NaN（R2）。
// 注意：当前生效版本不含 display_badge / posts_count，需后端合并路由后才能真正显示（见后端修改需求 B2）。
function normalizeUserProfile(u) {
  if (!u || typeof u !== 'object') return u
  const stats = u.stats || {}
  return {
    ...u,
    avatar: u.avatar ?? u.avatar_url ?? null,
    followers_count: u.followers_count ?? u.follower_count ?? stats.follower_count ?? 0,
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

