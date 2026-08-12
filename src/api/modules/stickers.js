import api from '../index'

// 获取公开表情包列表
// 响应：{ stickers: [StickerPublic], total }
export const listStickers = (params) => api.get('/stickers/', { params })

// 获取表情包分类
// 响应：{ categories: [{ name, count }] }
export const getStickerCategories = () => api.get('/stickers/categories')

// 搜索表情包
// 响应：{ stickers: [StickerPublic], total }
export const searchStickers = (keyword) =>
  api.get('/stickers/search', { params: { keyword } })
