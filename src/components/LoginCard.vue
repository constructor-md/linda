<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'
import { auth } from '../api/auth'
import { ws } from '../utils/ws'

// 表单数据
const username = ref('')
const password = ref('')

// 获取路由实例
const router = useRouter()

// 处理登录
const handleLogin = async () => {
  if (!validateLoginInput()) return
  try {
    // 调用登录接口
    const response = await auth.login({
      username: username.value,
      password: password.value,
    })
    if (response.data.code === 200) {
      // 存储token
      localStorage.setItem('token', response.data.data)
      // 跳转到聊天页面
      router.push('/chat')
    } else if (response.data.code === 600506) {
      // 未注册提示（模拟AI朋友好奇感）
      ElNotification({
        title: "👀 Wait, you're new here!",
        message:
          'Hey stranger! I need to know your name before we chat. Wanna tell me who you are? 😊',
        type: 'warning', // 用warning替代error，语气更温和
        duration: 6000,
      })
    } else if (response.data.code === 600508) {
      // 密码错误提示（模拟AI朋友俏皮提醒）
      ElNotification({
        title: '🔒 Oops, secret mix-up!',
        message:
          "Hmm, that's not the secret I remember. Wanna try sharing it again? Let's keep our little secret safe! 😉",
        type: 'error',
        icon: '🤫', // 捂嘴表情强化“秘密”氛围
        duration: 6000,
      })
    }
  } catch (error: any) {
    // 显示错误提示
    ElNotification({
      title: '😱 Oh no, glitch attack!',
      message:
        "Whoopsie! My circuits are doing a little tango—don't panic! I'm already fixing it like a pro. 🛠️\n\nNeed faster help? Hit up the admin squad at: xxx",
      type: 'error',
      duration: 6000,
    })
  }
}

// 登录，校验输入用户名
const validateLoginInput = () => {
  if (!username.value || username.value.length < 3) {
    ElNotification({
      title: '🤔 Wait a sec...',
      message:
        "Hey! I remember your name being longer than this—at least 3 characters, right? Let's jog your memory! 😄",
      type: 'warning',
      duration: 6000,
    })
    return false
  }
  return true
}
// 处理注册，校验用户名和密码格式
const validateRegisterInput = () => {
  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]).+$/

  if (!username.value || username.value.length < 3) {
    ElNotification({
      title: 'Hey',
      message:
        "Whoa, your name's teeny-tiny! Y'know, it should be at least 3 characters, don'tcha think? 😄",
      type: 'warning',
      duration: 6000,
    })
    return false
  }

  if (!password.value || password.value.length < 6) {
    ElNotification({
      title: 'Hey',
      message: "Whoa, your secret's tiny! Gimme at least 6 characters next time, okay? 😊",
      type: 'warning',
      duration: 6000,
    })
    return false
  }

  if (!passwordPattern.test(password.value)) {
    ElNotification({
      title: 'Oh',
      message:
        "Hey, let's keep your secret safe! How about making sure it's got at least 1 letter, 1 number, and 1 symbol? 😉",
      type: 'warning',
      duration: 6000,
    })
    return false
  }

  return true
}

const handleRegister = async () => {
  if (!validateRegisterInput()) return

  try {
    // 调用注册接口
    const response = await auth.register({
      username: username.value,
      password: password.value,
    })

    if (response.data.code === 200) {
      // 注册成功提示（模拟朋友兴奋欢迎）
      ElNotification({
        title: '🎉 Welcome to the club!',
        message:
          "Yay! I finally know your name! Let's start chatting—ask me anything, I'm all ears! 😊",
        type: 'success',
        duration: 6000,
      })
    } else if (response.data.code === 600507) {
      // 用户名重复提示（模拟朋友挠头纠结）
      ElNotification({
        title: '🤔 Name déjà vu!',
        message:
          "Your name is so charming, someone's already claimed it! How about adding a fun suffix like '✨' or '_2025'? 😎",
        type: 'warning', // 用warning替代error，减少挫败感
        duration: 6000,
      })
    }
  } catch (error: any) {
    // 显示错误提示
    ElNotification({
      title: '😱 Oh no, glitch attack!',
      message:
        "Whoopsie! My circuits are doing a little tango—don't panic! I'm already fixing it like a pro. 🛠️\n\nNeed faster help? Hit up the admin squad at: xxx",
      type: 'error',
      duration: 6000,
    })
  }
}
</script>

<template>
  <div class="login-card-container">
    <div class="login-card">
      <h2>Make friends with Linda.</h2>
      <div class="form-group">
        <input v-model="username" type="text" placeholder="Your lovely name" class="input-field" />
      </div>
      <div class="form-group">
        <input
          v-model="password"
          type="password"
          placeholder="Your little secret"
          class="input-field"
        />
      </div>
      <div class="button-group">
        <button @click="handleRegister" class="btn register-btn">Tell Linda</button>
        <button @click="handleLogin" class="btn login-btn">Chat with Linda</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.5s ease-out;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.5s ease-out forwards;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #4a90e2;
  outline: none;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  width: 100%;
  user-select: none;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.register-btn {
  background-color: #f0f0f0;
  color: #333;
}

.login-btn {
  background-color: #4a90e2;
  color: white;
}

.register-btn:hover {
  background-color: #e0e0e0;
  position: relative;
}

.register-btn:hover {
  color: transparent;
}
.register-btn:hover::after {
  content: 'Register';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 1rem;
  white-space: nowrap;
}

.login-btn:hover {
  background-color: #357abd;
  position: relative;
}

.login-btn:hover {
  color: transparent;
}
.login-btn:hover::after {
  content: 'Login';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1rem;
  white-space: nowrap;
}

@keyframes slideUpText {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}
</style>
