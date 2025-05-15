/**
 * API接口配置
 */

// API基础URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8334/api/linda'

// WebSocket服务器URL
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8335/api/linda/ws'

/**
 * HTTP接口路径配置
 */
export const API_ROUTES = {
  // 用户相关
  USER: {
    LOGIN: '/user/login',
    REGISTER: '/user/register',
  },

  // 聊天相关
  CHAT: {
    SEND_MESSAGE: '/chat/message',
    GET_HISTORY: '/chat/history',
    GET_SESSIONS: '/chat/sessions',
  },
}

/**
 * WebSocket事件类型
 */
export enum WS_EVENT_TYPE {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  ERROR = 'error',
}

/**
 * WebSocket消息类型
 */
export interface WSMessage {
  type: WS_EVENT_TYPE
  data: any
  timestamp: number
}
