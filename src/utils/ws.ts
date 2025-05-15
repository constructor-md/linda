import { ElNotification } from 'element-plus'
import WebSocketClient from './websocket'
import { WS_URL } from '@/api'

/**
 * WebSocket管理类
 * 提供带token认证的WebSocket连接管理和状态通知功能
 */
class WebSocketManager {
  private static instance: WebSocketManager
  private wsClient: WebSocketClient | null = null

  private constructor() {}

  /**
   * 获取WebSocket管理器实例
   */
  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  /**
   * 连接WebSocket服务器
   */
  public connect(): void {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('未找到token，无法建立WebSocket连接')
      return
    }

    // 创建WebSocket客户端
    this.wsClient = new WebSocketClient({
      url: `${WS_URL}?token=${token}`,
      reconnectAttempts: 3,
      reconnectInterval: 3000,
      heartbeatInterval: 30000,
      heartbeatMessage: 'ping',
    })

    // 设置事件处理器
    this.wsClient.setHandlers({
      onOpen: () => {
        ElNotification({
          title: "🌟 Let's Go!",
          message:
            "Hey! You're back—time to level up your English! Ready for a fun chat? I'm all ears! 😊",
          type: 'success',
        })
      },
      onClose: () => {
        ElNotification({
          title: '😴 Linda Offline',
          message: "I'm taking a short break. I'll be back soon! 🌙",
          type: 'warning',
          duration: 6000,
        })
      },
      onError: () => {
        ElNotification({
          title: '😢 Connection Lost',
          message: "Oops! I'm having trouble connecting. Please try again later! 🔌",
          type: 'error',
          duration: 6000,
        })
      },
    })

    // 建立连接
    this.wsClient.connect()
  }

  /**
   * 断开WebSocket连接
   */
  public disconnect(): void {
    if (this.wsClient) {
      this.wsClient.disconnect()
      this.wsClient = null
    }
  }

  /**
   * 发送消息
   * @param data 要发送的数据
   */
  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    this.wsClient?.send(data)
  }
}

// 导出WebSocket管理器实例
export const ws = WebSocketManager.getInstance()
