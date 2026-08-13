import api from '../index'
export const getPosts = (params) => api.get('/posts/', { params })
export const getPost = (id) => api.get(`/posts/${id}`)
export const createPost = (data) => api.post('/posts/', data)
// 更新帖子（CreatePostView 草稿发布路径依赖；后端 PUT /posts/{id}）
export const updatePost = (id, data) => api.put(`/posts/${id}`, data)
export const deletePost = (id) => api.delete(`/posts/${id}`)
export const likePost = (id) => api.post(`/posts/${id}/like`)
export const collectPost = (id) => api.post(`/posts/${id}/collect`)
export const getComments = (id, params) => api.get(`/posts/${id}/comments`, { params })
export const addComment = (id, data) => api.post(`/posts/${id}/comments`, data)
export const getRecommended = (params) => api.get('/posts/recommended', { params })
// 上传帖子图片（后端 files: List[UploadFile]，字段名 files，支持多文件）
export const uploadImage = (postId, files) => {
  const fd = new FormData()
  const list = Array.isArray(files) ? files : [files]
  list.forEach(f => fd.append('files', f))
  return api.post(`/posts/${postId}/images`, fd)
}
