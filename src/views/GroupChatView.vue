<template>
  <div class="chat-layout">
    <!-- 顶部栏 -->
    <div class="chat-header">
      <button class="btn-back" @click="goBack">&larr; 返回</button>
      <span class="chat-group-name">{{ groupName || '群聊' }}</span>
    </div>

    <!-- 消息区域 -->
    <div ref="messageListRef" class="message-list">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="{
          'is-self': msg.is_self,
          'is-system': msg.message_type === 'system',
        }"
      >
        <!-- 系统消息：居中灰色小字 -->
        <div v-if="msg.message_type === 'system'" class="system-message">
          {{ msg.content }}
        </div>

        <!-- 普通消息 -->
        <template v-else>
          <!-- 发送者名称（非自己时显示） -->
          <div v-if="!msg.is_self" class="message-sender">
            {{ msg.sender?.username || '未知用户' }}
          </div>
          <div class="message-bubble" :class="{ 'bubble-self': msg.is_self }">
            <!-- 文本消息 -->
            <div v-if="msg.message_type === 'text'" class="bubble-text">{{ msg.content }}</div>
            <!-- 图片消息 -->
            <div v-else-if="msg.message_type === 'image'" class="bubble-image">
              <img :src="msg.content" alt="图片消息" />
            </div>
            <!-- 表情包消息 -->
            <div v-else-if="msg.message_type === 'sticker'" class="bubble-sticker">
              <img :src="msg.content" alt="表情包" class="bubble-sticker-img" />
            </div>
            <!-- 位置消息 -->
            <div v-else-if="msg.message_type === 'location'" class="bubble-location">
              <div class="location-name">{{ msg.content?.name || '未知位置' }}</div>
              <div class="location-addr">{{ msg.content?.address || '' }}</div>
            </div>
            <!-- 其他类型兜底 -->
            <div v-else class="bubble-text">{{ msg.content }}</div>
          </div>
          <div class="message-meta">
            <span class="message-time">{{ formatMessageTime(msg.created_at) }}</span>
          </div>
        </template>
      </div>

      <!-- 加载中 -->
      <div v-if="loading && messages.length === 0" class="loading-tip">加载消息中...</div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 表情包选择器（R5） -->
      <div v-if="showStickerPanel" class="sticker-panel">
        <div class="sticker-panel-header">
          <span>表情包</span>
          <button class="sticker-panel-close" @click="showStickerPanel = false">&times;</button>
        </div>
        <div v-if="stickerLoading" class="sticker-loading">加载中...</div>
        <div v-else-if="stickerList.length" class="sticker-grid">
          <img
            v-for="st in stickerList"
            :key="st.id"
            :src="st.url"
            :alt="st.name"
            class="sticker-item"
            :title="st.name"
            @click="sendSticker(st)"
          />
        </div>
        <div v-else class="sticker-empty">暂无表情包</div>
      </div>

      <button
        class="btn-sticker"
        :class="{ active: showStickerPanel }"
        @click="toggleStickerPanel"
        title="表情包"
      >😊</button>
      <textarea
        v-model="inputText"
        class="message-input"
        placeholder="输入消息..."
        rows="1"
        @keydown="handleKeyDown"
      ></textarea>
      <button class="btn-send" :disabled="!inputText.trim() || sending" @click="handleSend">
        {{ sending ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGroup, getGroupMessages, sendGroupMessage } from '@/api/modules/chat'
import { listStickers } from '@/api/modules/stickers'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 群信息
const groupId = ref(route.params.id)
const groupName = ref('')

// 消息状态
const messages = ref([])
const loading = ref(false)
const inputText = ref('')
const sending = ref(false)
const messageListRef = ref(null)

// 表情包面板状态（R5）
const showStickerPanel = ref(false)
const stickerList = ref([])
const stickerLoading = ref(false)

// 格式化消息时间
function formatMessageTime(timeStr) {
  if (!timeStr) return ''
  const now = Date.now()
  const time = new Date(timeStr).getTime()
  const diff = Math.floor((now - time) / 1000)

  const date = new Date(timeStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const timePart = `${hours}:${minutes}`

  // 今天内只显示时分
  if (diff < 86400 && date.getDate() === new Date().getDate()) {
    return timePart
  }

  // 昨天
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${timePart}`
  }

  // 更早
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  if (date.getFullYear() === new Date().getFullYear()) {
    return `${month}-${day} ${timePart}`
  }
  return `${date.getFullYear()}-${month}-${day} ${timePart}`
}

// 获取群信息
async function fetchGroupInfo() {
  try {
    const res = await getGroup(groupId.value)
    const data = res.data || res
    groupName.value = data.name || '群聊'
  } catch (e) {
    console.error('获取群信息失败:', e)
  }
}

// 获取群消息
async function fetchMessages() {
  loading.value = true
  try {
    const res = await getGroupMessages(groupId.value, { page: 1, page_size: 50 })
    messages.value = res.results || res.data || res.list || res || []
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error('获取群消息失败:', e)
  } finally {
    loading.value = false
  }
}

// 滚动到底部
function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 发送消息
async function handleSend() {
  const content = inputText.value.trim()
  if (!content || sending.value || !groupId.value) return

  sending.value = true
  try {
    // 乐观更新
    const tempMsg = {
      id: Date.now(),
      content,
      message_type: 'text',
      is_self: true,
      sender: userStore.user ? { username: userStore.user.username } : { username: '我' },
      created_at: new Date().toISOString(),
    }
    messages.value.push(tempMsg)
    inputText.value = ''
    await nextTick()
    scrollToBottom()

    await sendGroupMessage(groupId.value, { content, message_type: 'text' })

    // 刷新消息列表
    await fetchMessages()
  } catch (e) {
    console.error('发送群消息失败:', e)
    messages.value = messages.value.filter(m => m.id !== tempMsg?.id)
  } finally {
    sending.value = false
  }
}

// 键盘事件：Enter 发送，Shift+Enter 换行
function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// ─── 表情包（R5） ───
async function fetchStickers() {
  stickerLoading.value = true
  try {
    const res = await listStickers({ page: 1, page_size: 50 })
    stickerList.value = res.stickers || res.results || res.data || res.list || (Array.isArray(res) ? res : [])
  } catch (e) {
    console.error('获取表情包失败:', e)
    stickerList.value = []
  } finally {
    stickerLoading.value = false
  }
}

function toggleStickerPanel() {
  showStickerPanel.value = !showStickerPanel.value
  if (showStickerPanel.value && stickerList.value.length === 0) {
    fetchStickers()
  }
}

async function sendSticker(sticker) {
  if (sending.value || !groupId.value) return
  sending.value = true
  try {
    const tempMsg = {
      id: Date.now(),
      content: sticker.url,
      message_type: 'sticker',
      is_self: true,
      sender: userStore.user ? { username: userStore.user.username } : { username: '我' },
      created_at: new Date().toISOString(),
    }
    messages.value.push(tempMsg)
    showStickerPanel.value = false
    await nextTick()
    scrollToBottom()

    await sendGroupMessage(groupId.value, { content: sticker.url, message_type: 'sticker' })
    await fetchMessages()
  } catch (e) {
    console.error('发送表情包失败:', e)
    messages.value = messages.value.filter(m => m.id !== tempMsg?.id)
  } finally {
    sending.value = false
  }
}

// 返回群列表
function goBack() {
  router.push('/groups')
}

// 监听消息变化自动滚动
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  fetchGroupInfo()
  fetchMessages()
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--topbar-height, 60px) - 24px);
  background: var(--card, #fff);
  border-radius: var(--radius, 8px);
  box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.08));
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
}

/* ====== 顶部栏 ====== */
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border, #eee);
  background: var(--card, #fff);
  flex-shrink: 0;
}

.btn-back {
  background: none;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  color: var(--text-secondary, #666);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

.btn-back:hover {
  background: var(--bg, #f5f5f5);
  color: var(--text, #333);
}

.chat-group-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text, #333);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ====== 消息列表 ====== */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-item.is-self {
  align-self: flex-end;
  align-items: flex-end;
}

.message-item:not(.is-self):not(.is-system) {
  align-self: flex-start;
  align-items: flex-start;
}

.message-item.is-system {
  align-self: center;
  max-width: 100%;
}

.system-message {
  font-size: 12px;
  color: var(--text-light, #999);
  background: var(--bg, #f5f5f5);
  padding: 4px 12px;
  border-radius: 12px;
}

.message-sender {
  font-size: 12px;
  color: var(--text-light, #999);
  margin-bottom: 4px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  color: var(--text-light, #999);
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
}

.message-bubble:not(.bubble-self) {
  background: #f0f0f0;
  color: var(--text, #333);
  border-top-left-radius: 4px;
}

.message-bubble.bubble-self {
  background: #4a90d9;
  color: #fff;
  border-top-right-radius: 4px;
}

.bubble-text {
  white-space: pre-wrap;
}

.bubble-image img {
  max-width: 240px;
  max-height: 240px;
  border-radius: 6px;
  display: block;
}

.bubble-sticker {
  font-size: 16px;
  color: var(--text-secondary, #666);
  padding: 4px 0;
}

.bubble-self .bubble-sticker {
  color: rgba(255, 255, 255, 0.8);
}

.bubble-location {
  min-width: 160px;
}

.location-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.location-addr {
  font-size: 12px;
  opacity: 0.7;
}

.loading-tip {
  text-align: center;
  padding: 20px;
  color: var(--text-light, #999);
  font-size: 13px;
}

/* ====== 输入区域 ====== */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--border, #eee);
  background: var(--card, #fff);
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  resize: none;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid var(--border, #ddd);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  max-height: 120px;
  min-height: 40px;
  box-sizing: border-box;
}

.message-input:focus {
  border-color: var(--primary, #4a90d9);
}

.btn-send {
  padding: 10px 20px;
  font-size: 14px;
  color: #fff;
  background: var(--primary, #4a90d9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
  height: 40px;
  flex-shrink: 0;
}

.btn-send:hover {
  opacity: 0.85;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ====== 表情包（R5） ====== */
.btn-sticker {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  font-size: 20px;
  line-height: 1;
  border: 1px solid var(--border, #ddd);
  border-radius: 8px;
  background: var(--bg, #f5f5f5);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.btn-sticker:hover,
.btn-sticker.active {
  border-color: var(--primary, #4a90d9);
  background: #e8f0fe;
}

.sticker-panel {
  position: absolute;
  bottom: 100%;
  left: 16px;
  right: 16px;
  margin-bottom: 8px;
  background: var(--card, #fff);
  border: 1px solid var(--border, #eee);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 20;
}

.input-area {
  position: relative;
}

.sticker-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #333);
  border-bottom: 1px solid var(--border, #eee);
}

.sticker-panel-close {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-secondary, #888);
  cursor: pointer;
  line-height: 1;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 8px;
  padding: 12px;
  max-height: 220px;
  overflow-y: auto;
}

.sticker-item {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 6px;
  cursor: pointer;
  background: var(--bg, #f5f5f5);
  transition: transform 0.15s;
}

.sticker-item:hover {
  transform: scale(1.08);
}

.sticker-loading,
.sticker-empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--text-light, #999);
}

.bubble-sticker-img {
  max-width: 120px;
  max-height: 120px;
  border-radius: 6px;
  display: block;
}
</style>