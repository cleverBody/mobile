// 移动端API模块
import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 创建API实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 本地API服务器，可以用正常超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加用户认证信息
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 本地API服务器返回 {success: true, data: {...}} 格式
    // 我们需要提取其中的 data 部分
    if (response.data && response.data.success && response.data.data) {
      return response.data.data
    }
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    // 移动端错误处理
    if (error.response?.status === 401) {
      // 未授权，跳转登录
      const userStore = useUserStore()
      userStore.logout()
    }
    return Promise.reject(error)
  }
)

export { api }