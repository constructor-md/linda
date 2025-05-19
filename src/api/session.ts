import { http } from '../utils/http'
import { API_ROUTES } from './index'

import type { ApiResponse } from '../types'

/**
 * 会话相关API
 */
export const session = {
  /**
   * 删除指定会话
   * @param sessionId 会话ID
   * @returns Promise<ApiResponse> 返回API响应
   */
  deleteSession: (sessionId: string): Promise<ApiResponse> => {
    return http.delete(`${API_ROUTES.SESSION.DELETE}?id=${sessionId}`)
  },

  /**
   * 获取会话列表
   * @param page 页码 从 0 开始
   * @param size 每页数量
   * @returns Promise<ApiResponse> 返回API响应
   */
  getSessionList: (page: number, size: number): Promise<ApiResponse> => {
    return http.get(`${API_ROUTES.SESSION.LIST}?page=${page}&size=${size}`)
  },
}
