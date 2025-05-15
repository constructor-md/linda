import { createRouter, createWebHistory } from 'vue-router'
import { ElNotification } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/Chat.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 已登录用户不能访问登录页
  if (token && to.name === 'home') {
    next({ name: 'chat' })
    return
  }
  // 未登录用户只能访问登录页
  if (!token && to.name !== 'home') {
    ElNotification({
      title: '👋 Hey Stranger!',
      message:
        "Wait... I can't remember your name! Did we forget to introduce ourselves? Let's fix that! 😊",
      type: 'info',
      duration: 6000,
    })
    next({ name: 'home' })
    return
  }
  next()
})

export default router
