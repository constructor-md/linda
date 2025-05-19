import type { AxiosRequestConfig } from 'axios'

/**
 * 用户登录接口参数
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 用户注册接口参数
 */
export interface RegisterParams {
  username: string
  password: string
}

/**
 * 聊天消息接口参数
 */
export interface SendMessageParams {
  sessionId: string
  content: string
}

/**
 * HTTP请求配置接口
 */
export interface RequestConfig extends AxiosRequestConfig {
  loading?: boolean // 是否显示加载状态
  silent?: boolean // 是否静默处理错误
}

/**
 * HTTP响应接口
 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
}
