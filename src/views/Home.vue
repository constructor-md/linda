<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoginCard from '../components/LoginCard.vue'

// 打字机效果的文本和状态
const greetingMessage = ref('')
const currentIndex = ref(0)
const timeBasedGreetings = ['🌞 Good morning! ', '☀️ Hello there! ', '🌙 Good evening! ']

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return timeBasedGreetings[0]
  if (hour >= 12 && hour < 18) return timeBasedGreetings[1]
  return timeBasedGreetings[2]
}

const fullMessage = getGreeting() + " Let's chat and improve your English together! 😊"

// 实现打字机效果
onMounted(() => {
  const interval = setInterval(() => {
    if (currentIndex.value < fullMessage.length) {
      greetingMessage.value += fullMessage[currentIndex.value]
      currentIndex.value++
    } else {
      clearInterval(interval)
    }
  }, 50) // 每个字符的打字间隔时间
})
</script>

<template>
  <div class="home-container">
    <div class="avatar-section">
      <img src="/public/linda.png" alt="Linda" class="avatar" />
      <div class="message-bubble">
        <span>{{ greetingMessage }}</span>
      </div>
    </div>
    <LoginCard />
  </div>
</template>

<style scoped>
.home-container {
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(255, 230, 230, 0.9), rgba(255, 220, 180, 0.9));
  backdrop-filter: blur(10px);
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-size: cover;
  box-sizing: border-box;
}

.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin: 50px 40px;
  user-select: none;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.message-bubble {
  position: relative;
  background: #f0f0f0;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 300px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.message-bubble::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 20px;
  border-style: solid;
  border-width: 10px 10px 10px 0;
  border-color: transparent #f0f0f0 transparent transparent;
}
</style>
