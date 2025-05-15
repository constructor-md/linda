import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { RequestConfig, ApiResponse } from '../types'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'

// 获取路由实例
const router = useRouter()
/**
 * HTTP工具类
 * 封装axios，提供统一的请求方法和拦截器配置
 */
class HttpClient {
  private instance: AxiosInstance

  constructor(config?: RequestConfig) {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    })

    this.setupInterceptors()
  }

  /**
   * 配置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 从localStorage获取token
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const code = response.data.code
        // 根据业务状态码处理响应
        if (code === 600500) {
          // 处理业务错误
          const error = new Error(response.data.msg || '系统异常')
          return Promise.reject(error)
        } else if (code === 600502) {
          // 未登录或登录过期
          ElNotification({
            title: '👋 Hey Stranger!',
            message:
              "Wait... I can't remember your name! Did we forget to introduce ourselves? Let's fix that! 😊",
            type: 'info',
            duration: 6000,
          })
          // 清除token
          localStorage.removeItem('token')
          router.push('/')
          return response
        } else {
          return response
        }
      },
      (error) => {
        // 处理HTTP错误
        return Promise.reject(error)
      },
    )
  }

  /**
   * 发送GET请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise
   */
  public get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  /**
   * 发送POST请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise
   */
  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  /**
   * 发送PUT请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise
   */
  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  /**
   * 发送DELETE请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise
   */
  public delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }
}

// 导出HTTP客户端实例
export const http = new HttpClient()
