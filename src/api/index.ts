// 移动端API模块
import axios from 'axios'

// 获取API基础URL
const getBaseURL = () => {
  // 修复环境检测逻辑
  const isAPK = window.location.protocol === 'capacitor:' ||
                window.location.protocol === 'file:' ||
                (typeof window !== 'undefined' && (window as any).Capacitor && !import.meta.env.DEV)

  // APK环境直接使用远程服务器
  if (isAPK) {
    console.log('🔍 index.ts: 检测到APK环境，使用远程服务器')
    console.log('🔍 protocol:', window.location.protocol, 'DEV:', import.meta.env.DEV, 'Capacitor:', !!(window as any).Capacitor)
    return 'https://netease-proxy-server.onrender.com/api'
  }

  // 浏览器开发环境使用代理
  console.log('🔍 index.ts: 检测到浏览器环境，使用代理')
  return '/api'
}

// 创建API实例
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 远程服务器，增加超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加时间戳防止缓存
    if (config.params) {
      config.params.timestamp = Date.now()
    } else {
      config.params = { timestamp: Date.now() }
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
      // 未授权，可以在这里处理登录跳转
      console.warn('用户未授权，需要登录')
    }
    return Promise.reject(error)
  }
)

export { api }
export default api
