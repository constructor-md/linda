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
  private messageHandlers: Array<(event: MessageEvent) => void> = []

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
          title: '🌟 Linda Online!',
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
      onMessage: (event) => {
        // 调用所有注册的消息处理器
        if (this.messageHandlers.length > 0) {
          this.messageHandlers.forEach((handler) => handler(event))
        }
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

  /**
   * 添加WebSocket消息处理器
   * @param handler 消息处理函数
   * @returns 处理器ID，用于后续移除处理器
   */
  public addMessageHandler(handler: (event: MessageEvent) => void): number {
    if (handler) {
      this.messageHandlers.push(handler)
      return this.messageHandlers.length - 1
    }
    return -1
  }

  /**
   * 移除WebSocket消息处理器
   * @param handler 要移除的消息处理函数
   */
  public removeMessageHandler(handler: (event: MessageEvent) => void): void {
    const index = this.messageHandlers.indexOf(handler)
    if (index !== -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  /**
   * 清空所有WebSocket消息处理器
   */
  public clearMessageHandlers(): void {
    this.messageHandlers = []
  }

  /**
   * 设置WebSocket消息处理器（兼容旧API）
   * @param handler 消息处理函数
   * @deprecated 请使用addMessageHandler和removeMessageHandler
   */
  public setMessageHandler(handler: (event: MessageEvent) => void | null): void {
    // 清空现有处理器
    this.messageHandlers = []
    // 如果提供了新处理器，则添加它
    if (handler) {
      this.messageHandlers.push(handler)
    }
  }
}

// 导出WebSocket管理器实例
export const ws = WebSocketManager.getInstance()
