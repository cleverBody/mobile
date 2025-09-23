// API配置工具
export const getApiBaseURL = () => {
  // 更可靠的APK环境检测
  const isAPK = window.location.protocol === 'capacitor:' ||
                window.location.protocol === 'file:' ||
                !import.meta.env.DEV ||
                (typeof window !== 'undefined' && (window as any).Capacitor)

  // APK环境直接使用远程服务器
  if (isAPK) {
    console.log('🔍 检测到APK环境，使用远程服务器')
    console.log('🔍 protocol:', window.location.protocol, 'DEV:', import.meta.env.DEV, 'Capacitor:', !!(window as any).Capacitor)
    return 'https://netease-proxy-server.onrender.com/api'
  }

  // 浏览器开发环境使用代理
  console.log('🔍 检测到浏览器环境，使用代理')
  return '/api'
}

// 创建API请求函数
export const apiRequest = async (url: string, options?: RequestInit) => {
  const baseURL = getApiBaseURL()
  const fullUrl = url.startsWith('/') ? `${baseURL}${url}` : `${baseURL}/${url}`

  console.log('🌐 发起网络请求:', fullUrl)
  console.log('🔍 环境检测 - DEV:', import.meta.env.DEV)
  console.log('🔍 环境检测 - protocol:', window.location.protocol)

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    console.log('✅ 网络请求成功:', response.status, response.statusText)
    return response
  } catch (error) {
    console.error('❌ 网络请求失败:', error)
    throw error
  }
}
