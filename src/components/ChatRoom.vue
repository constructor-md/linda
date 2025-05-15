<script setup lang="ts">
// 聊天室组件
import { ref } from 'vue'

// 角色枚举类型
enum Role {
  Linda = 'linda',
  User = 'user',
}

// 消息类型定义
interface Message {
  id: number
  content: string
  role: Role // 消息发送者的角色
  isStreaming?: boolean // 是否使用流式输出
  fullContent?: string // 流式输出时存储完整内容
}

// 消息列表数据
const messages = ref<Message[]>([
  { id: 1, content: '你好，我是Linda，有什么可以帮助你的吗？', role: Role.Linda },
  { id: 2, content: '我想了解一下你能做什么', role: Role.User },
  {
    id: 3,
    content: '我可以回答你的问题，提供信息，或者陪你聊天。你有什么具体想知道的吗？',
    role: Role.Linda,
  },
  { id: 4, content: '谢谢，我想了解一下最新的AI技术发展', role: Role.User },
])

// 新消息内容
const newMessage = ref('')

/**
 * 流式输出消息
 * @param fullContent 完整的消息内容
 */
const streamMessage = (fullContent: string) => {
  // 创建一个新的消息对象用于流式输出
  const messageId = messages.value.length + 1
  const streamingMessage = {
    id: messageId,
    content: '',
    role: Role.Linda,
    isStreaming: true,
    fullContent: fullContent,
  }

  // 添加初始空消息
  messages.value.push(streamingMessage)
  scrollToBottom()

  let currentIndex = 0
  const charInterval = 50 // 每个字符的输出间隔(毫秒)

  // 使用setInterval模拟流式输出
  const intervalId = setInterval(() => {
    if (currentIndex < fullContent.length) {
      // 更新当前显示的内容
      const updatedMessage = messages.value.find((msg) => msg.id === messageId)
      if (updatedMessage) {
        updatedMessage.content += fullContent[currentIndex]
        currentIndex++
        scrollToBottom()
      }
    } else {
      // 所有字符都已输出，清除定时器
      clearInterval(intervalId)
      // 标记为非流式状态
      const completedMessage = messages.value.find((msg) => msg.id === messageId)
      if (completedMessage) {
        completedMessage.isStreaming = false
      }
    }
  }, charInterval)
}

/**
 * 非流式输出消息
 * @param content 消息内容
 */
const nonStreamMessage = (content: string) => {
  messages.value.push({
    id: messages.value.length + 1,
    content: content,
    role: Role.Linda,
    isStreaming: false,
  })
  scrollToBottom()
}

/**
 * 发送消息
 * @param useStreaming 是否使用流式输出，默认随机决定
 */
const sendMessage = (useStreaming?: boolean) => {
  if (!newMessage.value.trim()) return

  // 添加用户消息
  messages.value.push({
    id: messages.value.length + 1,
    content: newMessage.value,
    role: Role.User,
  })
  scrollToBottom()
  // 清空输入框
  newMessage.value = ''

  // 模拟Linda回复
  setTimeout(() => {
    // 如果未指定是否使用流式输出，则随机决定
    const shouldUseStreaming = useStreaming !== undefined ? useStreaming : Math.random() > 0.5

    // 模拟回复内容
    const replyOptions = [
      '我已收到你的消息，这是一个模拟回复。',
      '我理解你的问题，让我思考一下如何回答。',
      '这是一个很有趣的话题，我可以从多个角度为你解析。',
      '感谢你的提问，我正在处理你的请求。',
      '感谢你的提问，我正在处理你的请求。wadfiofiooiaoisiofasidoasiioasnasdfjpeoifeinoasnoipesdnvisdncesiobnesoavnidovnsodivlnasipoenoidsvbnisovlSNOVISANOJSNVDOIALNESINKAVPIOSANVPAIVNIVNIOIPnvioanvviaovni',
    ]
    const replyContent = replyOptions[Math.floor(Math.random() * replyOptions.length)]

    // 根据输出方式选择不同的处理函数
    if (shouldUseStreaming) {
      streamMessage(replyContent)
    } else {
      nonStreamMessage(replyContent)
    }
  }, 1000)
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
</script>

<template>
  <div class="chat-room">
    <!-- 消息展示区域 -->
    <div class="message-container" ref="messageContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{
          'linda-message': message.role === Role.Linda,
          'user-message': message.role === Role.User,
        }"
      >
        <!-- Linda头像 -->
        <div v-if="message.role === Role.Linda" class="avatar-container linda-avatar">
          <img src="/linda.png" alt="Linda" class="avatar" />
        </div>

        <!-- 消息气泡 -->
        <div
          class="message-bubble"
          :class="{
            'linda-bubble': message.role === Role.Linda,
            'user-bubble': message.role === Role.User,
            streaming: message.role === Role.Linda && message.isStreaming,
          }"
        >
          {{ message.content }}
          <span v-if="message.role === Role.Linda && message.isStreaming" class="cursor"></span>
        </div>

        <!-- 用户头像 -->
        <div v-if="message.role === Role.User" class="avatar-container user-avatar">
          <img src="/user.png" alt="User" class="avatar" />
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <textarea
        v-model="newMessage"
        class="message-input"
        placeholder="输入消息..."
        @keydown="handleKeyDown"
      ></textarea>
      <div class="button-group">
        <button class="mode-button stream" @click="sendMessage(true)" title="流式输出">流式</button>
        <button class="mode-button non-stream" @click="sendMessage(false)" title="非流式输出">
          非流式
        </button>
        <button class="send-button" @click="sendMessage()">发送</button>
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

.avatar-container {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  user-select: none;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-bubble {
  max-width: 45%;
  padding: 10px 16px;
  border-radius: 18px;
  word-break: break-word;
  line-height: 1.4;
}

.linda-bubble {
  background-color: #e6f7ff;
  margin-left: 12px;
  border-top-left-radius: 4px;
}

.user-bubble {
  background-color: #dcf8c6;
  margin-right: 12px;
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
