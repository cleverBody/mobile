import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useSwipeBack() {
  const router = useRouter()
  
  let startX = 0
  let startY = 0
  let isTracking = false
  let startTime = 0
  
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
    
    // 只在屏幕左侧边缘开始滑动时启用
    if (startX <= 20) {
      isTracking = true
    }
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!isTracking) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    
    // 如果垂直滑动距离太大，取消侧滑返回
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      isTracking = false
      return
    }
    
    // 如果水平滑动距离足够且主要是水平方向，显示返回提示
    if (deltaX > 50 && Math.abs(deltaY) < 50) {
      // 可以在这里添加视觉反馈，比如显示返回箭头
      e.preventDefault()
    }
  }
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (!isTracking) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    const deltaTime = Date.now() - startTime
    
    // 检查是否满足返回条件
    const isValidSwipe = 
      deltaX > 80 && // 滑动距离足够
      Math.abs(deltaY) < 100 && // 垂直偏移不太大
      deltaTime < 500 && // 滑动时间不太长
      deltaX > Math.abs(deltaY) * 2 // 主要是水平滑动
    
    if (isValidSwipe) {
      router.back()
    }
    
    isTracking = false
  }
  
  const addListeners = () => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })
  }
  
  const removeListeners = () => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
  
  onMounted(() => {
    addListeners()
  })
  
  onUnmounted(() => {
    removeListeners()
  })
  
  return {
    goBack: () => router.back()
  }
}