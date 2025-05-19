import { http } from '../utils/http'
import { API_ROUTES } from './index'

import type { SendMessageParams, ApiResponse } from '../types'

/**
 * 聊天相关API
 */
export const chat = {
  /**
   * 发送消息
   * @param params 消息参数，包含会话ID和消息内容
   * @returns Promise<ApiResponse> 返回API响应
   */
  sendMessage: (params: SendMessageParams): Promise<ApiResponse> => {
    return http.post(API_ROUTES.CHAT.SEND_MESSAGE, params)
  },

  /**
   * 获取指定会话的历史消息
   * @param sessionId 会话ID
   * @returns Promise<ApiResponse> 返回API响应
   */
  getHistory: (sessionId: string): Promise<ApiResponse> => {
    return http.get(`${API_ROUTES.CHAT.GET_HISTORY}?id=${sessionId}`)
  },
}
