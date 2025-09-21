import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const theme = ref<'light' | 'dark' | 'auto'>('auto')
  const language = ref('zh-CN')
  const audioQuality = ref<'128' | '192' | '320' | 'lossless'>('320')
  const useSongUnlock = ref(true) // 音乐解锁功能
  
  // 方法
  const setTheme = (newTheme: typeof theme.value) => {
    theme.value = newTheme
    applyTheme()
  }
  
  const applyTheme = () => {
    const body = document.body
    
    if (theme.value === 'auto') {
      // 跟随系统
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      body.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      body.setAttribute('data-theme', theme.value)
    }
  }
  
  const initTheme = () => {
    applyTheme()
    
    // 监听系统主题变化
    if (theme.value === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', applyTheme)
    }
  }
  
  return {
    // 状态
    theme,
    language,
    audioQuality,
    useSongUnlock,
    
    // 方法
    setTheme,
    initTheme
  }
}, {
  persist: true
})