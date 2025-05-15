import { http } from '../utils/http'
import { API_ROUTES } from './index'

import type { RegisterParams, LoginParams, ApiResponse } from '../types'
/**
 * 认证相关API
 */
export const auth = {
  /**
   * 用户登录
   * @param params 登录参数
   * @returns Promise<string> 返回token
   */
  login: (params: LoginParams): Promise<ApiResponse> => {
    return http.post(API_ROUTES.USER.LOGIN, params)
  },

  /**
   * 用户注册
   * @param params 注册参数
   * @returns Promise<string> 返回token
   */
  register: (params: RegisterParams): Promise<ApiResponse> => {
    return http.post(API_ROUTES.USER.REGISTER, params)
  },
}
