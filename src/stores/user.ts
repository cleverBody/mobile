import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserProfile {
  id: number
  nickname: string
  avatar: string
  signature?: string
  birthday?: string
  city?: string
  province?: string
  gender?: number // 0: 保密, 1: 男, 2: 女
  followCount?: number
  fansCount?: number
  playlistCount?: number
  level?: number
  vipType?: number
}

export interface LoginParams {
  phone?: string
  email?: string
  password: string
  captcha?: string
}

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userProfile = ref<UserProfile | null>(null)
  const token = ref<string>('')
  const loading = ref(false)
  const loginLoading = ref(false)
  
  const login = async (params: LoginParams) => {
    loginLoading.value = true
    try {
      await mockLogin(params)
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loginLoading.value = false
    }
  }
  
  const mockLogin = async (params: LoginParams) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟登录验证
    if (params.password !== '123456') {
      throw new Error('用户名或密码错误')
    }
    
    // 模拟登录成功
    token.value = 'mock_token_' + Date.now()
    isLoggedIn.value = true
    
    userProfile.value = {
      id: 12345678,
      nickname: '音乐爱好者',
      avatar: '/images/default-avatar.jpg',
      signature: '音乐是我的生命',
      birthday: '1995-06-15',
      city: '深圳市',
      province: '广东省',
      gender: 1,
      followCount: 128,
      fansCount: 256,
      playlistCount: 15,
      level: 8,
      vipType: 0
    }
  }
  
  const loginWithPhone = async (phone: string, password: string, captcha?: string) => {
    return login({ phone, password, captcha })
  }
  
  const loginWithEmail = async (email: string, password: string) => {
    return login({ email, password })
  }
  
  const sendCaptcha = async (phone: string) => {
    console.log('发送验证码到:', phone)
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 模拟发送成功
    return { success: true }
  }
  
  const logout = async () => {
    try {
      // TODO: 调用登出API
      token.value = ''
      isLoggedIn.value = false
      userProfile.value = null
      console.log('用户已登出')
    } catch (error) {
      console.error('登出失败:', error)
      throw error
    }
  }
  
  const updateProfile = async (profile: Partial<UserProfile>) => {
    loading.value = true
    try {
      // TODO: 调用更新个人信息API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (userProfile.value) {
        Object.assign(userProfile.value, profile)
      }
      console.log('个人信息更新成功')
    } catch (error) {
      console.error('更新个人信息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const refreshUserInfo = async () => {
    if (!isLoggedIn.value) return
    
    loading.value = true
    try {
      // TODO: 调用获取用户信息API
      await new Promise(resolve => setTimeout(resolve, 800))
      // 模拟刷新用户信息
      console.log('用户信息已刷新')
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const checkLoginStatus = () => {
    // 检查本地存储的登录状态
    const savedToken = localStorage.getItem('user_token')
    const savedProfile = localStorage.getItem('user_profile')
    
    if (savedToken && savedProfile) {
      try {
        token.value = savedToken
        userProfile.value = JSON.parse(savedProfile)
        isLoggedIn.value = true
      } catch (error) {
        console.error('恢复登录状态失败:', error)
        clearLocalData()
      }
    }
  }
  
  const clearLocalData = () => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_profile')
  }
  
  // 自动保存到本地存储
  const saveToLocal = () => {
    if (isLoggedIn.value && token.value && userProfile.value) {
      localStorage.setItem('user_token', token.value)
      localStorage.setItem('user_profile', JSON.stringify(userProfile.value))
    } else {
      clearLocalData()
    }
  }
  
  return {
    // 状态
    isLoggedIn,
    userProfile,
    token,
    loading,
    loginLoading,
    
    // 方法
    login,
    loginWithPhone,
    loginWithEmail,
    sendCaptcha,
    logout,
    updateProfile,
    refreshUserInfo,
    checkLoginStatus,
    saveToLocal
  }
}, {
  persist: {
    paths: ['isLoggedIn', 'userProfile', 'token']
  }
})