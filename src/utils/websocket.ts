/**
 * WebSocket连接状态枚举
 */
enum WebSocketState {
  CONNECTING = 0, // 连接中
  OPEN = 1, // 已连接
  CLOSING = 2, // 关闭中
  CLOSED = 3, // 已关闭
}

/**
 * WebSocket事件处理器接口
 */
interface WebSocketHandlers {
  onMessage?: (event: MessageEvent) => void
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
}

/**
 * WebSocket配置接口
 */
interface WebSocketConfig {
  url: string
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  heartbeatMessage?: string
}

/**
 * WebSocket客户端类
 * 提供WebSocket连接管理和消息处理功能
 */
class WebSocketClient {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private handlers: WebSocketHandlers = {}
  private reconnectCount = 0
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = null

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 3,
      reconnectInterval: 3000,
      heartbeatInterval: 30000,
      heartbeatMessage: 'ping',
      ...config,
    }
  }

  /**
   * 连接WebSocket服务器
   */
  public connect(): void {
    console.log('正在建立WebSocket连接...')
    if (this.ws?.readyState === WebSocketState.OPEN) {
      console.warn('WebSocket已连接')
      return
    }
    this.ws = new WebSocket(this.config.url)
    // 绑定事件处理器
    this.ws.onopen = this.handleOpen.bind(this)
    this.ws.onclose = this.handleClose.bind(this)
    this.ws.onmessage = this.handleMessage.bind(this)
    this.ws.onerror = this.handleError.bind(this)
  }

  /**
   * 断开WebSocket连接
   */
  public disconnect(): void {
    if (this.ws) {
      this.clearTimers()
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * 发送消息
   * @param data 要发送的数据
   */
  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.ws?.readyState === WebSocketState.OPEN) {
      this.ws.send(data)
    } else {
      console.error('WebSocket未连接')
    }
  }

  /**
   * 设置事件处理器
   * @param handlers 事件处理器对象
   */
  public setHandlers(handlers: WebSocketHandlers): void {
    this.handlers = handlers
  }

  /**
   * 处理连接打开事件
   * @param event 事件对象
   */
  private handleOpen(event: Event): void {
    console.log('WebSocket已连接')
    this.reconnectCount = 0
    this.startHeartbeat()
    this.handlers.onOpen?.(event)
  }

  /**
   * 处理连接关闭事件
   * @param event 事件对象
   */
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket已关闭')
    this.clearTimers()
    this.handlers.onClose?.(event)
    this.attemptReconnect()
  }

  /**
   * 处理消息接收事件
   * @param event 事件对象
   */
  private handleMessage(event: MessageEvent): void {
    // 处理心跳响应
    if (event.data === 'pong') {
      return
    }
    this.handlers.onMessage?.(event)
  }

  /**
   * 处理错误事件
   * @param event 事件对象
   */
  private handleError(event: Event): void {
    console.error('WebSocket错误:', event)
    this.handlers.onError?.(event)
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat(): void {
    if (this.config.heartbeatInterval && this.config.heartbeatMessage) {
      this.heartbeatTimer = window.setInterval(() => {
        this.send(this.config.heartbeatMessage!)
      }, this.config.heartbeatInterval)
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(): void {
    if (
      this.reconnectCount < (this.config.reconnectAttempts || 0) &&
      this.ws?.readyState === WebSocketState.CLOSED
    ) {
      this.reconnectTimer = window.setTimeout(() => {
        console.log(`尝试重新连接 (${this.reconnectCount + 1}/${this.config.reconnectAttempts})`)
        this.reconnectCount++
        this.connect()
      }, this.config.reconnectInterval)
    }
  }

  /**
   * 清除所有定时器
   */
  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

export default WebSocketClient
