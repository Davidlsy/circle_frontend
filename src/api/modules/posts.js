import api from '../index'
export const getPosts = (params) => api.get('/posts/', { params })
export const getPost = (id) => api.get(`/posts/${id}`)
export const createPost = (data) => api.post('/posts/', data)
export const updatePost = (id, data) => api.put(`/posts/${id}`, data)
export const deletePost = (id) => api.delete(`/posts/${id}`)
export const likePost = (id) => api.post(`/posts/${id}/like`)
export const collectPost = (id) => api.post(`/posts/${id}/collect`)
export const getComments = (id, params) => api.get(`/posts/${id}/comments`, { params })
export const addComment = (id, data) => api.post(`/posts/${id}/comments`, data)
export const getRecommended = (params) => api.get('/posts/recommended', { params })
export const uploadImage = (postId, files) => {
  const fd = new FormData()
  for (const file of files) {
    fd.append('files', file)
  }
  return api.post(`/posts/${postId}/images`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const getPostImages = (postId) => api.get(`/posts/${postId}/images`)
export const deletePostImage = (imageId) => api.delete(`/posts/images/${imageId}`)

