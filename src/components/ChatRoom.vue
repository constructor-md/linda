<script setup lang="ts">
// 聊天室组件
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { chat } from '../api/chat'
import { ws } from '../utils/ws'
// 角色枚举类型
enum Role {
  Linda = 'Linda',
  User = 'User',
}

// 用于缓存每个会话正在传输的WebSocket消息
const wsMessageCache = new Map<string, Message>()

// 消息类型定义
interface Message {
  id: number
  content: string
  role: Role // 消息发送者的角色
  createTime?: string // 消息创建时间
}

// 接收父组件传递的会话ID
const props = defineProps({
  sessionId: {
    type: String,
    default: '',
  },
})

// 新消息内容
const newMessage = ref('')

// 发送按钮状态
const sendButtonDisabled = ref(false)
const sendButtonDisabledMsg = ref('')

/**
 * 获取历史消息
 * @param sessionId 会话ID
 */
const fetchHistoryMessages = async (sessionId: string) => {
  try {
    const res = await chat.getHistory(sessionId)
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      // 更新聊天消息
      msgList.value = res.data.data.map((msg: any) => ({
        id: msg.id || Math.random(),
        content: msg.content,
        role: msg.role,
        createTime: msg.createTime || new Date().toLocaleString(),
        isStreaming: false,
      }))

      // 检查是否有缓存的WebSocket消息，如果有则追加到历史消息后面
      if (wsMessageCache.has(sessionId)) {
        const cachedMessage = wsMessageCache.get(sessionId)!
        // 检查是否已存在相同ID的消息
        const existingIndex = msgList.value.findIndex((msg) => msg.id === cachedMessage.id)
        if (existingIndex === -1) {
          // 不存在则添加到消息列表
          msgList.value.push(cachedMessage)
        }
      }
    } else {
      console.error('获取历史消息失败:', res.data.msg)
      msgList.value = []
    }
    scrollToBottom()
  } catch (error) {
    console.error('获取历史消息异常:', error)
    msgList.value = []
  }
}

/**
 * 处理WebSocket消息
 */
const handleWebSocketMessage = (event: MessageEvent) => {
  try {
    const message = JSON.parse(event.data)

    // 处理CHAT类型消息
    if (message.messageType === 'CHAT') {
      const { sessionId, messageId, content, createTime } = message.content
      // 如果当前没有会话ID，则设置为新的会话ID
      if (!currentSessionId.value) {
        currentSessionId.value = sessionId
      }

      // 获取或创建该会话的缓存消息
      if (!wsMessageCache.has(sessionId)) {
        // 如果没有缓存，创建一个新的消息对象作为缓存
        wsMessageCache.set(sessionId, {
          id: messageId,
          content: content,
          role: Role.Linda,
          createTime: createTime,
        })
      } else {
        // 如果有缓存，更新缓存的消息内容
        const cachedMessage = wsMessageCache.get(sessionId)!
        cachedMessage.content += content
        // 确保缓存中的消息ID与当前消息ID一致，如果不一致（理论上不应该发生），则替换缓存
        if (cachedMessage.id !== messageId) {
          wsMessageCache.set(sessionId, {
            id: messageId,
            content: content,
            role: Role.Linda,
            createTime: createTime,
          })
        }
      }

      // 检查是否为当前会话，如果是则更新UI  --- 避免更新到不同的会话
      if (sessionId === currentSessionId.value) {
        // 查找是否存在相同messageId的消息
        const existingMessageIndex = msgList.value.findIndex((msg) => msg.id === messageId)

        if (existingMessageIndex !== -1) {
          // 更新已存在的消息内容 选项卡切换回来后能够继续更新消息
          msgList.value[existingMessageIndex].content += content
        } else {
          // 创建新消息
          msgList.value.push({
            id: messageId,
            content: content,
            role: Role.Linda,
            createTime: createTime || new Date().toLocaleString(),
          })
        }
        scrollToBottom()
      }
    } else if (message.messageType === 'DONE') {
      // 处理DONE类型消息
      // 解除发送按钮禁用状态
      sendButtonDisabled.value = false
      sendButtonDisabledMsg.value = ''

      // 清空当前会话的消息缓存
      if (currentSessionId.value) {
        wsMessageCache.delete(currentSessionId.value)
      }
    }
  } catch (error) {
    console.error('处理WebSocket消息异常:', error)
  }
}

// 存储当前活动的流式输出定时器ID
let activeStreamIntervalId: number | null = null

/**
 * 流式输出消息
 * @param fullContent 完整的消息内容
 */
const streamMessage = (fullContent: string) => {
  // 如果存在之前的定时器，先清除它
  if (activeStreamIntervalId !== null) {
    clearInterval(activeStreamIntervalId)
    activeStreamIntervalId = null
  }

  // 创建一个新的消息对象用于流式输出
  const messageId = Math.random()
  const streamingMessage = {
    id: messageId,
    content: '',
    role: Role.Linda,
    createTime: new Date().toLocaleString(),
  }

  // 添加初始空消息
  msgList.value.push(streamingMessage)
  scrollToBottom()

  let currentIndex = 0
  const charInterval = 30 // 每个字符的输出间隔(毫秒)

  // 使用setInterval模拟流式输出
  activeStreamIntervalId = setInterval(() => {
    if (currentIndex < fullContent.length) {
      // 更新当前显示的内容
      const updatedMessage = msgList.value.find((msg) => msg.id === messageId)
      if (updatedMessage) {
        updatedMessage.content += fullContent[currentIndex]
        currentIndex++
        scrollToBottom()
      }
    } else {
      // 所有字符都已输出，清除定时器
      if (activeStreamIntervalId !== null) {
        clearInterval(activeStreamIntervalId)
        activeStreamIntervalId = null
      }
    }
  }, charInterval)
}

/**
 * 发送消息
 */
const sendMessage = async () => {
  if (!newMessage.value.trim() || sendButtonDisabled.value) return

  // 禁用发送按钮
  sendButtonDisabled.value = true
  sendButtonDisabledMsg.value = 'Sending...'

  try {
    const messageContent = newMessage.value.trim()

    // 发送消息到服务器
    const res = await chat.sendMessage({
      sessionId: currentSessionId.value,
      content: messageContent,
    })
    if (res.data.code === 200 && res.data.data) {
      // 清空输入框
      newMessage.value = ''
      // 消息发送成功，更新本地消息列表
      msgList.value.push({
        id: res.data.data.messageId,
        content: messageContent,
        role: Role.User,
        createTime: new Date().toLocaleString(),
      })
      scrollToBottom()
      // 发送后更新按钮状态
      sendButtonDisabledMsg.value = 'Linda is typing...'
    } else {
      // 发送失败，恢复按钮状态
      sendButtonDisabled.value = false
      sendButtonDisabledMsg.value = ''
    }
  } catch (error) {
    console.error('发送消息异常:', error)
    // 发送失败，恢复按钮状态
    sendButtonDisabled.value = false
    sendButtonDisabledMsg.value = ''
  }
}

/**
 * 处理按键事件，按Enter发送消息
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

/**
 * 滚动到消息列表底部
 */
const messageContainer = ref<HTMLElement | null>(null)
const scrollToBottom = () => {
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }, 0)
}

// 当前会话ID
const currentSessionId = ref('')

// 消息列表数据
const msgList = ref<Message[]>([])

// 监听会话ID变化
watch(
  () => props.sessionId,
  async (newSessionId) => {
    if (newSessionId) {
      currentSessionId.value = newSessionId
      // 获取历史消息（会自动检查并追加缓存的WebSocket消息）
      await fetchHistoryMessages(newSessionId)
    } else {
      // 清空会话ID
      currentSessionId.value = ''
      // 清空消息列表
      msgList.value = []
      // 显示欢迎消息
      const welcomeMessage =
        "👋 Hey! Linda here—let's chat! 😊 What's on your radar today? Something fun, something new, or just random thoughts? 🎤"
      streamMessage(welcomeMessage)
    }
  },
  { immediate: true },
)

// 组件挂载时设置WebSocket消息处理器
onMounted(() => {
  // 添加WebSocket消息处理器
  ws.addMessageHandler(handleWebSocketMessage)
})

// 组件卸载时移除WebSocket消息处理器
onUnmounted(() => {
  // 移除WebSocket消息处理器
  ws.removeMessageHandler(handleWebSocketMessage)
})
</script>

<template>
  <div class="chat-room">
    <!-- 消息展示区域 -->
    <div class="message-container" ref="messageContainer">
      <div
        v-for="message in msgList"
        :key="message.id"
        class="message-item"
        :class="{
          'linda-message': message.role === Role.Linda,
          'user-message': message.role === Role.User,
        }"
      >
        <!-- Linda消息 -->
        <div v-if="message.role === Role.Linda" class="message-content linda-content">
          <div class="avatar-container linda-avatar">
            <img src="/linda.png" alt="Linda" class="avatar" />
          </div>
          <div class="message-wrapper">
            <div v-if="message.createTime" class="message-time linda-time">
              {{ message.createTime }}
            </div>
            <div class="message-bubble linda-bubble">
              {{ message.content }}
            </div>
          </div>
        </div>

        <!-- 用户消息 -->
        <div v-if="message.role === Role.User" class="message-content user-content">
          <div class="avatar-container user-avatar">
            <img src="/user.png" alt="User" class="avatar" />
          </div>
          <div class="message-wrapper">
            <div v-if="message.createTime" class="message-time user-time">
              {{ message.createTime }}
            </div>
            <div class="message-bubble user-bubble">
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <textarea
        v-model="newMessage"
        class="message-input"
        placeholder="Say Something... 🤔"
        @keydown="handleKeyDown"
      ></textarea>
      <div class="button-group">
        <button class="send-button" @click="sendMessage()" :disabled="sendButtonDisabled">
          {{ sendButtonDisabled ? sendButtonDisabledMsg : 'Send' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  width: 80%;
  height: 80%;
  margin: 60px auto 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.message-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  width: 100%;
}

.linda-message {
  justify-content: flex-start;
}

.user-message {
  justify-content: flex-end;
}

.message-content {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  width: 100%;
}

.linda-content {
  flex-direction: row;
}

.user-content {
  flex-direction: row-reverse;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 45%;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.linda-time {
  align-self: flex-start;
}

.user-time {
  align-self: flex-end;
}

.avatar-container {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  user-select: none;
}

.linda-avatar {
  margin-right: 12px;
}

.user-avatar {
  margin-left: 12px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-bubble {
  padding: 10px 16px;
  border-radius: 18px;
  word-break: break-word;
  line-height: 1.4;
}

.linda-bubble {
  background-color: #e6f7ff;
  border-top-left-radius: 4px;
}

.user-bubble {
  background-color: #dcf8c6;
  border-top-right-radius: 4px;
}

.input-container {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #eaeaea;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  width: 100%;
  user-select: none;
}

.message-input {
  flex: 1;
  height: 40px;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  user-select: text;
}

.message-input::placeholder {
  user-select: none;
}

.message-input:focus {
  border-color: #4a90e2;
}

.mode-button {
  height: 36px;
  padding: 0 12px;
  margin-right: 8px;
  border: none;
  border-radius: 18px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: white;
}

.mode-button.stream {
  background-color: #28a745;
}

.mode-button.stream:hover {
  background-color: #218838;
}

.mode-button.non-stream {
  background-color: #ffc107;
}

.mode-button.non-stream:hover {
  background-color: #e0a800;
}

.send-button {
  width: 80px;
  height: 36px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #357abd;
}

.send-button:disabled {
  background-color: #a0c4e4;
  cursor: not-allowed;
}

.streaming {
  position: relative;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background-color: #000;
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 0.7s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
