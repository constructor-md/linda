<script setup lang="ts">
import { onMounted, onUnmounted, ref, defineEmits, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import { session } from '../api/session'
import { ws } from '../utils/ws'
// 侧边栏组件

// 定义Action类型
type Action = 'confirm' | 'cancel' | 'close'

// 定义事件
const emit = defineEmits(['select-session', 'new-chat'])

// 本地会话列表
const chats = ref<any[]>([])

// 会话列表分页数据
const currentPage = ref(0)
const pageSize = ref(20)
const isLoading = ref(false)
const hasMore = ref(true)

/**
 * 获取会话列表
 * @param page 页码 从 0 开始
 * @param size 每页数量
 */
const fetchSessionList = async (page: number, size: number) => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    const res = await session.getSessionList(page, size)
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      // 如果是第一页，直接替换数据，否则追加数据
      if (page === 0) {
        chats.value = res.data.data.map((session: any) => ({
          id: session.sessionId,
          title: session.title,
        }))
      } else {
        const newSessions = res.data.data.map((session: any) => ({
          id: session.sessionId,
          title: session.title,
        }))
        chats.value = [...chats.value, ...newSessions]
      }

      // 判断是否还有更多数据
      hasMore.value = res.data.data.length === size
    } else {
      console.error('获取会话列表失败:', res.data.msg)
    }
  } catch (error) {
    console.error('获取会话列表异常:', error)
  } finally {
    isLoading.value = false
  }
}

// 处理新增对话
const handleNewChat = () => {
  // 移除所有元素的active状态
  document.querySelectorAll('.chat-item').forEach((item) => item.classList.remove('active'))
  // 触发父组件创建新会话
  emit('new-chat')
}

// 处理会话点击
const handleChatClick = (index: number) => {
  // 移除其他元素的active状态
  document.querySelectorAll('.chat-item').forEach((item) => item.classList.remove('active'))
  // 为当前点击元素添加active状态
  document.querySelectorAll('.chat-item')[index].classList.add('active')
  // 触发父组件获取历史消息
  if (chats.value[index] && chats.value[index].id) {
    emit('select-session', chats.value[index].id)
  }
}

// 处理删除会话
const handleDeleteSession = async (id: string, event: Event) => {
  // 阻止事件冒泡，避免触发chat-item的点击事件
  event.stopPropagation()

  // 显示确认对话框
  await ElMessageBox.confirm('Will you delete this conversation?', 'Tip ', {
    confirmButtonText: 'confirm',
    cancelButtonText: 'cancel',
    type: 'warning',
    callback: async (action: Action) => {
      if (action !== 'confirm') return
      try {
        // 用户点击确定，调用删除API
        const response = await session.deleteSession(id)
        if (response.data.code === 200) {
          // 删除成功，从本地列表中移除
          const index = chats.value.findIndex((chat) => chat.id === id)
          if (index !== -1) {
            chats.value.splice(index, 1)
          }
        }
      } catch (error) {
        console.error('删除会话异常:', error)
      }
    },
  })
}

// 处理滚动加载更多
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  // 当滚动到距离底部50px以内时，触发加载更多
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
    if (hasMore.value && !isLoading.value) {
      loadMoreSessions()
    }
  }
}

/**
 * 加载更多会话
 */
const loadMoreSessions = () => {
  if (!hasMore.value || isLoading.value) return

  currentPage.value++
  fetchSessionList(currentPage.value, pageSize.value)
}

/**
 * 处理WebSocket消息
 */
const handleWebSocketMessage = (event: MessageEvent) => {
  try {
    const message = JSON.parse(event.data)

    // 处理TITLE类型消息
    if (message.messageType === 'TITLE') {
      const { sessionId, title } = message.content
      // 在会话列表前端添加新会话
      const newSession = {
        id: sessionId,
        title: title.replace(/\"/g, ''), // 移除引号
      }

      // 添加新会话到列表前端
      chats.value = [newSession, ...chats.value]

      // 使用nextTick确保DOM已更新后再操作
      nextTick(() => {
        // 移除所有元素的active状态
        document.querySelectorAll('.chat-item').forEach((item) => item.classList.remove('active'))
        // 为新添加的会话添加active状态（它在索引0的位置）
        const firstChatItem = document.querySelector('.chat-item')
        if (firstChatItem) {
          firstChatItem.classList.add('active')
        }
      })
    }
  } catch (error) {
    console.error('处理WebSocket消息异常:', error)
  }
}

onMounted(() => {
  // 添加滚动事件监听
  const chatList = document.querySelector('.chat-list')
  if (chatList) {
    chatList.addEventListener('scroll', handleScroll)
  }

  // 设置WebSocket消息处理器
  ws.addMessageHandler(handleWebSocketMessage)

  // 获取初始会话列表
  fetchSessionList(0, pageSize.value)
})

onUnmounted(() => {
  // 移除滚动事件监听
  const chatList = document.querySelector('.chat-list')
  if (chatList) {
    chatList.removeEventListener('scroll', handleScroll)
  }

  // 移除WebSocket消息处理器
  ws.removeMessageHandler(handleWebSocketMessage)
})
</script>

<template>
  <div class="sidebar">
    <div class="profile">
      <img src="/linda.png" alt="Linda" class="avatar" />
      <h2 class="name">Linda</h2>
      <button class="new-chat-btn" @click="handleNewChat">
        <!-- <span class="plus-icon">+</span> -->
        new chat
      </button>
      <div class="chat-list">
        <div
          v-for="(chat, index) in chats"
          :key="index"
          class="chat-item"
          @click="handleChatClick(index)"
        >
          <img src="/message.png" class="message-icon" />
          <span class="chat-title">{{ chat.title }}</span>
          <div class="chat-actions">
            <div class="more-icon">⋮</div>
            <div class="delete-icon" @click="handleDeleteSession(chat.id, $event)">
              <i class="trash-icon">🗑️</i>
            </div>
          </div>
        </div>
        <!-- 加载状态指示器 -->
        <div v-if="isLoading" class="loading-indicator">Loading...</div>
        <!-- 没有更多数据提示 -->
        <div v-if="!hasMore && chats.length > 0" class="no-more-data">
          There are no more conversations.
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

/* .plus-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
} */

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
  position: relative;
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
  flex-shrink: 0;
}

.chat-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.chat-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}

.more-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
  color: #666;
  cursor: pointer;
  display: block;
}

.delete-icon {
  display: none;
  cursor: pointer;
  color: #ff4d4f;
  font-size: 1rem;
}

.trash-icon {
  font-style: normal;
}

.chat-item:hover .more-icon {
  display: none;
}

.chat-item:hover .delete-icon {
  display: block;
}

.loading-indicator {
  text-align: center;
  padding: 10px;
  color: #666;
  font-size: 0.9rem;
}

.no-more-data {
  text-align: center;
  padding: 10px;
  color: #999;
  font-size: 0.8rem;
}
</style>
