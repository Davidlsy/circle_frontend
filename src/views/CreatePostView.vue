<template>
  <div class="create-post-page">
    <div class="create-post-card">
      <div class="card-header">
        <h2>发布新帖子</h2>
        <p class="header-tip">帖子发布后需要审核，请耐心等待</p>
      </div>

      <div class="form-item">
        <label class="form-label">
          选择明星 <span class="required">*</span>
        </label>
        <select v-model="form.star_id" class="form-select" :disabled="submitting">
          <option value="" disabled>请选择要发帖的明星</option>
          <option v-for="star in starList" :key="star.id" :value="star.id">
            {{ star.name }}
          </option>
        </select>
        <p v-if="starError" class="form-error">{{ starError }}</p>
      </div>

      <div class="form-item">
        <label class="form-label">
          标题 <span class="required">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          class="form-input"
          placeholder="请输入帖子标题（最多200字）"
          maxlength="200"
          :disabled="submitting"
        />
        <div class="char-count">{{ form.title.length }} / 200</div>
      </div>

      <div class="form-item">
        <label class="form-label">
          内容格式
        </label>
        <div class="format-tabs">
          <button
            class="format-tab"
            :class="{ active: form.content_format === 'markdown' }"
            @click="form.content_format = 'markdown'"
            :disabled="submitting"
          >
            Markdown
          </button>
          <button
            class="format-tab"
            :class="{ active: form.content_format === 'plain' }"
            @click="form.content_format = 'plain'"
            :disabled="submitting"
          >
            纯文本
          </button>
        </div>
      </div>

      <div class="form-item">
        <label class="form-label">
          正文 <span class="required">*</span>
        </label>
        <textarea
          v-model="form.content"
          class="form-textarea"
          :placeholder="form.content_format === 'markdown' ? '支持 Markdown 语法...' : '请输入帖子内容...'"
          rows="12"
          :disabled="submitting"
        ></textarea>
        <p v-if="contentError" class="form-error">{{ contentError }}</p>
      </div>

      <div class="form-item">
        <label class="form-label">
          图片 <span class="tip">（最多9张，支持 jpg/png/gif/webp）</span>
        </label>
        <div class="image-uploader">
          <div class="image-grid">
            <div
              v-for="(img, index) in uploadedImages"
              :key="img.id || img.url"
              class="image-item"
            >
              <img :src="img.url || img.preview" :alt="`图片${index + 1}`" />
              <div class="image-mask">
                <button class="image-delete" @click="removeImage(index)" :disabled="submitting">
                  &times;
                </button>
              </div>
            </div>
            <div
              v-if="uploadedImages.length < 9"
              class="image-upload-btn"
              @click="triggerImageUpload"
            >
              <span class="upload-plus">+</span>
              <span class="upload-text">上传图片</span>
            </div>
          </div>
          <input
            ref="imageInputRef"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            class="hidden-input"
            @change="handleImageSelect"
          />
          <p v-if="imageUploading" class="uploading-tip">图片上传中...</p>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-cancel" @click="handleCancel" :disabled="submitting">
          取消
        </button>
        <button class="btn btn-submit" @click="handleSubmit" :disabled="submitting">
          {{ submitting ? '发布中...' : '发布帖子' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createPost, uploadImage } from '@/api/modules/posts'
import { getStars } from '@/api/modules/stars'

const router = useRouter()

const form = reactive({
  star_id: '',
  title: '',
  content: '',
  content_format: 'markdown',
  is_published: true,
})

const starList = ref([])
const starError = ref('')
const contentError = ref('')
const submitting = ref(false)

const uploadedImages = ref([])
const imageUploading = ref(false)
const imageInputRef = ref(null)

const tempPostId = ref(null)

// 加载明星列表
async function loadStars() {
  try {
    const res = await getStars({ page: 1, page_size: 50 })
    starList.value = res.stars || res.data || res.list || res || []
  } catch (e) {
    console.error('加载明星列表失败:', e)
    starList.value = []
  }
}

// 触发图片选择
function triggerImageUpload() {
  imageInputRef.value?.click()
}

// 处理图片选择
async function handleImageSelect(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  // 校验数量
  const remaining = 9 - uploadedImages.value.length
  if (files.length > remaining) {
    alert(`最多还能上传 ${remaining} 张图片`)
    return
  }

  // 校验单张大小 5MB
  const maxSize = 5 * 1024 * 1024
  for (const file of files) {
    if (file.size > maxSize) {
      alert(`图片 ${file.name} 超过 5MB 限制`)
      return
    }
  }

  // 先添加本地预览
  const localImages = files.map(file => ({
    file,
    preview: URL.createObjectURL(file),
    uploading: true,
  }))
  const startIndex = uploadedImages.value.length
  uploadedImages.value.push(...localImages)

  // 如果还没有创建帖子，先创建一个草稿帖子（用于上传图片）
  if (!tempPostId.value) {
    try {
      const post = await createPost({
        star_id: form.star_id || 1,
        title: form.title || '草稿',
        content: form.content || ' ',
        content_format: form.content_format,
        is_published: false,
      })
      tempPostId.value = post.id
    } catch (err) {
      // 回滚预览图
      uploadedImages.value.splice(startIndex, files.length)
      alert('创建草稿失败，无法上传图片')
      return
    }
  }

  // 上传图片
  imageUploading.value = true
  try {
    const res = await uploadImage(tempPostId.value, files)
    const newImages = res.images || []
    // 替换本地预览为服务端返回的图片
    uploadedImages.value.splice(startIndex, files.length, ...newImages)
  } catch (err) {
    console.error('图片上传失败:', err)
    uploadedImages.value.splice(startIndex, files.length)
    alert('图片上传失败，请重试')
  } finally {
    imageUploading.value = false
    if (imageInputRef.value) imageInputRef.value.value = ''
  }
}

// 移除图片
function removeImage(index) {
  uploadedImages.value.splice(index, 1)
}

// 校验表单
function validateForm() {
  let valid = true
  starError.value = ''
  contentError.value = ''

  if (!form.star_id) {
    starError.value = '请选择明星'
    valid = false
  }
  if (!form.title.trim()) {
    valid = false
  }
  if (!form.content.trim()) {
    contentError.value = '请输入帖子内容'
    valid = false
  }

  return valid
}

// 提交发布
async function handleSubmit() {
  if (!validateForm()) return

  submitting.value = true
  try {
    let postId = tempPostId.value

    if (postId) {
      // 已有草稿，更新为正式发布
      const { updatePost } = await import('@/api/modules/posts')
      await updatePost(postId, {
        title: form.title.trim(),
        content: form.content.trim(),
        content_format: form.content_format,
        is_published: true,
      })
    } else {
      // 直接创建新帖子
      const post = await createPost({
        star_id: parseInt(form.star_id),
        title: form.title.trim(),
        content: form.content.trim(),
        content_format: form.content_format,
        is_published: true,
      })
      postId = post.id

      // 如果有选中的图片，上传（此时没有预上传，需要再传）
      if (uploadedImages.value.length > 0) {
        const files = uploadedImages.value.map(img => img.file).filter(Boolean)
        if (files.length > 0) {
          await uploadImage(postId, files)
        }
      }
    }

    alert('帖子发布成功，等待审核')
    router.push(`/posts/${postId}`)
  } catch (err) {
    console.error('发布失败:', err)
    const detail = err.response?.data?.detail || '发布失败，请重试'
    if (detail.includes('粉丝') || detail.includes('star')) {
      starError.value = detail
    } else {
      alert(detail)
    }
  } finally {
    submitting.value = false
  }
}

// 取消
function handleCancel() {
  if (submitting.value) return
  if (form.title || form.content || uploadedImages.value.length > 0) {
    if (!confirm('确定取消？已编辑的内容将丢失')) return
  }
  router.back()
}

onMounted(() => {
  loadStars()
})
</script>

<style scoped>
.create-post-page {
  max-width: 720px;
  margin: 0 auto;
}

.create-post-card {
  background: var(--card, #fff);
  border-radius: var(--radius, 8px);
  box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.08));
  padding: 28px 32px;
}

.card-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border, #eee);
}

.card-header h2 {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text, #333);
}

.header-tip {
  margin: 0;
  font-size: 13px;
  color: var(--text-light, #999);
}

.form-item {
  margin-bottom: 22px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text, #333);
}

.form-label .required {
  color: #e74c3c;
  margin-left: 2px;
}

.form-label .tip {
  font-size: 12px;
  font-weight: normal;
  color: var(--text-light, #999);
  margin-left: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
  background: var(--card, #fff);
  color: var(--text, #333);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary, #4a90d9);
}

.form-textarea {
  resize: vertical;
  line-height: 1.6;
}

.form-select {
  cursor: pointer;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-light, #999);
  margin-top: 4px;
}

.form-error {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #e74c3c;
}

/* 格式切换 */
.format-tabs {
  display: flex;
  gap: 8px;
}

.format-tab {
  padding: 6px 16px;
  font-size: 13px;
  background: var(--bg, #f5f5f5);
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text, #333);
}

.format-tab.active {
  background: var(--primary, #4a90d9);
  color: #fff;
  border-color: var(--primary, #4a90d9);
}

.format-tab:hover:not(.active) {
  border-color: var(--primary, #4a90d9);
  color: var(--primary, #4a90d9);
}

/* 图片上传 */
.image-uploader {
  width: 100%;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg, #f5f5f5);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-mask {
  opacity: 1;
}

.image-delete {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(231, 76, 60, 0.9);
  color: #fff;
  border: none;
  font-size: 20px;
  line-height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-btn {
  width: 100px;
  height: 100px;
  border: 2px dashed var(--border, #ccc);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-light, #999);
  background: var(--bg, #fafafa);
}

.image-upload-btn:hover {
  border-color: var(--primary, #4a90d9);
  color: var(--primary, #4a90d9);
}

.upload-plus {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
}

.uploading-tip {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: var(--primary, #4a90d9);
}

.hidden-input {
  display: none;
}

/* 按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--border, #eee);
}

.btn {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: var(--bg, #f5f5f5);
  color: var(--text, #333);
  border: 1px solid var(--border, #ddd);
}

.btn-cancel:hover:not(:disabled) {
  background: #eaeaea;
}

.btn-submit {
  background: var(--primary, #4a90d9);
  color: #fff;
  font-weight: 500;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}
</style>