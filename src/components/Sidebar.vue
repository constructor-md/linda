<script setup lang="ts">
import { ref } from 'vue'
// 侧边栏组件

// 处理新增对话
const chats = ref([
  { title: '对话1' },
  { title: '对话2' },
  { title: '对话3' },
  { title: '对话1' },
  { title: '对话2' },
  { title: '对话3' },
  { title: '对话1' },
  { title: '对话2' },
  { title: '对话3' },
  { title: '对话3' },
  { title: '对话1' },
  { title: '对话2' },
  { title: '对话3' },
  { title: '对话1' },
  { title: '对话2' },
  { title: '对话3' },
  { title: '对话3' },
  { title: '对话1' },
  { title: '对话2' },
  { title: '对话3' },
])

// 处理新增对话
const handleNewChat = () => {
  chats.value.push({ title: `对话${chats.value.length + 1}` })
}

// 处理会话点击
const handleChatClick = (index: number) => {
  // 移除其他元素的active状态
  document.querySelectorAll('.chat-item').forEach((item) => item.classList.remove('active'))
  // 为当前点击元素添加active状态
  document.querySelectorAll('.chat-item')[index].classList.add('active')
  console.log('点击了对话:', chats.value[index])
}
</script>

<template>
  <div class="sidebar">
    <div class="profile">
      <img src="/linda.png" alt="Linda" class="avatar" />
      <h2 class="name">Linda</h2>
      <button class="new-chat-btn" @click="handleNewChat">
        <span class="plus-icon">+</span>
        新的对话
      </button>
      <div class="chat-list">
        <div
          v-for="(chat, index) in chats"
          :key="index"
          class="chat-item"
          @click="handleChatClick(index)"
        >
          <img src="/message.png" class="message-icon" />
          {{ chat.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  border-right: 0.5px solid #88c5a7;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  user-select: none;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
}

.name {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.new-chat-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem;
  margin: 1rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: background-color 0.2s;
  box-sizing: border-box;
  width: calc(100% - 2rem);
}

.new-chat-btn:hover {
  background-color: #357abd;
}

.plus-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 1rem;
  width: 100%;
  max-height: calc(100vh - 250px);
}

.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 0.6rem;
  margin: 0.5rem auto;
  width: 90%;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  height: 1.2rem;
}

.chat-item:hover {
  background-color: rgba(156, 153, 153, 0.5);
}

.chat-item.active {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-icon {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.8rem;
  object-fit: contain;
}
</style>
