<template>
  <transition name="modal-fade">
    <div v-if="visible" class="auth-modal-mask" @click.self="close">
      <div class="auth-modal">
        <div class="auth-modal-icon">🔒</div>
        <div class="auth-modal-message">{{ message }}</div>
        <div class="auth-modal-actions">
          <button class="auth-modal-btn auth-modal-btn-ghost" @click="close">取消</button>
          <button class="auth-modal-btn auth-modal-btn-primary" @click="goLogin">去登录</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { authModalVisible, authModalMessage, authModalRedirect } from '@/composables/useAuthGuard'

const router = useRouter()
const visible = authModalVisible
const message = authModalMessage

function close() {
  authModalVisible.value = false
}

function goLogin() {
  const redirect = authModalRedirect.value || '/'
  authModalVisible.value = false
  router.push({ path: '/login', query: { redirect } })
}
</script>

<style scoped>
.auth-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.auth-modal {
  width: 320px;
  max-width: 90vw;
  background: var(--card, #fff);
  border-radius: 12px;
  padding: 28px 24px 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.auth-modal-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.auth-modal-message {
  font-size: 15px;
  color: var(--text, #333);
  margin-bottom: 22px;
  line-height: 1.5;
}

.auth-modal-actions {
  display: flex;
  gap: 12px;
}

.auth-modal-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
}

.auth-modal-btn-ghost {
  background: var(--bg, #f5f5f5);
  color: var(--text-secondary, #666);
}

.auth-modal-btn-ghost:hover {
  background: var(--border-light, #eee);
}

.auth-modal-btn-primary {
  background: var(--primary, #667eea);
  color: #fff;
}

.auth-modal-btn-primary:hover {
  opacity: 0.9;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
