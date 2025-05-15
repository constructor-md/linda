<script setup lang="ts">
// 聊天页面组件
import Sidebar from '../components/Sidebar.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import ChatRoom from '../components/ChatRoom.vue'
import { useRouter } from 'vue-router'
import { ws } from '../utils/ws'

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const avatarRef = ref<HTMLElement | null>(null)

// 切换下拉框显示状态
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 处理全局点击事件
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // 如果点击的不是头像和下拉框内部，则关闭下拉框
  if (!avatarRef.value?.contains(target) && !dropdownRef.value?.contains(target)) {
    showDropdown.value = false
  }
}

// 组件挂载时添加点击事件监听和初始化WebSocket连接
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 初始化WebSocket连接
  ws.connect()
})

// 组件卸载时移除点击事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const router = useRouter()
const logout = () => {
  // 断开WebSocket连接
  ws.disconnect()
  // 清除token
  localStorage.removeItem('token')
  // 跳转到登录页
  router.push('/')
}
</script>

<template>
  <div class="chat-container">
    <div class="sidebar-wrapper">
      <Sidebar />
    </div>
    <div class="main-content">
      <div class="avatar-dropdown">
        <img ref="avatarRef" src="/user.png" class="avatar" @click="toggleDropdown" />
        <div v-if="showDropdown" ref="dropdownRef" class="dropdown-menu">
          <div class="dropdown-item" @click="logout">退出登录</div>
        </div>
      </div>
      <ChatRoom />
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  background-color: #f5f5f5;
}

.sidebar-wrapper {
  width: 20%;
  height: 100%;
}

.main-content {
  flex: 1;
  height: 100%;
  background-color: #fff;
}

.avatar-dropdown {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 50px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  user-select: none;
}

.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  min-width: 80px;
  text-align: center;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}
</style>
