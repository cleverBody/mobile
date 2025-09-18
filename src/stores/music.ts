import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Howl } from 'howler'
import { musicApi } from '@/api/music'
import { toastController } from '@ionic/vue'

export interface Song {
  id: number
  name: string
  artists: Array<{ id: number; name: string }>
  album?: { id: number; name: string }
  cover?: string
  duration?: number
  url?: string
}

export interface Playlist {
  id: number
  name: string
  cover?: string
  description?: string
  creator: User
  tracks: Song[]
  playCount?: number
}

export interface Artist {
  id: number
  name: string
  avatar?: string
}

export interface Album {
  id: number
  name: string
  cover?: string
  artist: Artist
}

export interface User {
  id: number
  nickname: string
  avatar?: string
}

// 显示Toast提示的辅助函数
const showToast = async (message: string, color: 'success' | 'warning' | 'danger' = 'danger') => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: 'top',
    color
  })
  await toast.present()
}

export const useMusicStore = defineStore('music', () => {
  // 状态
  const currentSong = ref<Song | null>(null)
  const playlist = ref<Song[]>([])
  const currentIndex = ref(0)
  const likedSongs = ref<Set<number>>(new Set())

  // 播放器状态
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const isMuted = ref(false)
  const playMode = ref<'order' | 'random' | 'repeat'>('order')

  // Howler实例
  let howl: Howl | null = null
  let updateTimer: number | null = null

  // 计算属性
  const hasNext = computed(() => currentIndex.value < playlist.value.length - 1)
  const hasPrev = computed(() => currentIndex.value > 0)
  const progress = computed(() => duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0)
  const isHasPlayer = computed(() => currentSong.value?.id !== undefined && currentSong.value?.id !== 0)

  // 方法
  const setCurrentSong = async (song: Song) => {
    currentSong.value = song
    await loadAndPlaySong(song)
  }

  const setPlaylist = (songs: Song[], index = 0) => {
    playlist.value = songs
    currentIndex.value = index
    if (songs[index]) {
      setCurrentSong(songs[index])
    }
  }

  // 加载并播放歌曲
  const loadAndPlaySong = async (song: Song) => {
    try {
      console.log('🎵 开始加载歌曲:', song.name)
      alert(`开始加载歌曲: ${song.name}`)

      alert('步骤1: 准备停止当前播放')
      // 停止当前播放
      if (howl) {
        alert('步骤2: 发现现有howl实例，正在停止')
        howl.stop()
        howl.unload()
        alert('步骤3: howl实例已停止和卸载')
      } else {
        alert('步骤2: 没有现有howl实例')
      }

      alert('步骤4: 开始检测移动端环境')
      // 检测移动端环境
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                      window.location.protocol === 'capacitor:' ||
                      (typeof window !== 'undefined' && (window as any).Capacitor)

      alert(`步骤5: 移动端检测完成，结果: ${isMobile}`)
      console.log('🎵 移动端检测:', isMobile, 'protocol:', window.location.protocol)

      alert("步骤6: 跳过移动端音频权限处理，直接获取歌曲URL")
      // 获取歌曲播放URL
      console.log('🎵 获取歌曲播放URL...')
      alert(`开始获取歌曲URL，歌曲ID: ${song.id}`)

      const urlResponse = await musicApi.getSongUrl(song.id)
      alert(`API响应: ${JSON.stringify(urlResponse)}`)

      const songUrl = urlResponse.data?.[0]?.url
      alert(`解析出的URL: ${songUrl}`)

      if (!songUrl) {
        console.error('❌ 无法获取歌曲播放链接')
        alert(`❌ 无法获取歌曲播放链接: ${song.name}`)
        return
      }

      console.log('✅ 获取到播放URL:', songUrl)

      // 创建新的Howl实例
      console.log('🎵 创建Howl实例...')
      howl = new Howl({
        src: [songUrl],
        html5: false,
        volume: volume.value,
        preload: isMobile ? 'metadata' : true,
        onload: () => {
          duration.value = howl?.duration() || 0
          console.log('✅ 音频加载完成，时长:', duration.value)
          showToast(`音频加载完成: ${song.name}`, 'success')
        },
        onplay: () => {
          isPlaying.value = true
          startUpdateTimer()
          console.log('✅ 开始播放')
        },
        onpause: () => {
          isPlaying.value = false
          stopUpdateTimer()
          console.log('⏸️ 暂停播放')
        },
        onend: () => {
          isPlaying.value = false
          nextSong()
          console.log('⏹️ 播放结束')
        }
      })

      // 开始播放
      console.log('🎵 尝试开始播放...')
      try {
        howl.play()
        console.log('✅ 播放命令已发送')
        alert(`✅ 播放命令已发送: ${song.name}`)
      } catch (playError) {
        console.error('❌ 播放失败:', playError)
        alert(`❌ 播放失败: ${playError}`)
      }


    } catch (error) {
      console.error('加载歌曲失败:', error)
      alert(`❌ 加载歌曲失败: ${error}`)
    }
  }

  // 播放/暂停切换
  const togglePlay = () => {
    if (!howl) return

    if (isPlaying.value) {
      howl.pause()
    } else {
      howl.play()
    }
  }

  // 播放
  const play = () => {
    if (howl && !isPlaying.value) {
      howl.play()
    }
  }

  // 暂停
  const pause = () => {
    if (howl && isPlaying.value) {
      howl.pause()
    }
  }

  // 下一首
  const nextSong = () => {
    if (playlist.value.length === 0) return

    let nextIndex = currentIndex.value

    if (playMode.value === 'random') {
      // 随机播放
      nextIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (playMode.value === 'repeat') {
      // 单曲循环
      nextIndex = currentIndex.value
    } else {
      // 顺序播放
      nextIndex = (currentIndex.value + 1) % playlist.value.length
    }

    currentIndex.value = nextIndex
    setCurrentSong(playlist.value[nextIndex])
  }

  // 上一首
  const prevSong = () => {
    if (playlist.value.length === 0) return

    let prevIndex = currentIndex.value

    if (playMode.value === 'random') {
      // 随机播放
      prevIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (playMode.value === 'repeat') {
      // 单曲循环
      prevIndex = currentIndex.value
    } else {
      // 顺序播放
      prevIndex = currentIndex.value - 1
      if (prevIndex < 0) {
        prevIndex = playlist.value.length - 1
      }
    }

    currentIndex.value = prevIndex
    setCurrentSong(playlist.value[prevIndex])
  }

  // 跳转到指定时间
  const seekTo = (time: number) => {
    if (howl) {
      howl.seek(time)
      currentTime.value = time
    }
  }

  // 设置音量
  const setVolume = (vol: number) => {
    volume.value = vol
    if (howl) {
      howl.volume(vol)
    }
  }

  // 静音切换
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (howl) {
      howl.mute(isMuted.value)
    }
  }

  // 播放模式切换
  const togglePlayMode = () => {
    const modes: Array<'order' | 'random' | 'repeat'> = ['order', 'random', 'repeat']
    const currentIndex = modes.indexOf(playMode.value)
    playMode.value = modes[(currentIndex + 1) % modes.length]
  }

  // 开始更新计时器
  const startUpdateTimer = () => {
    if (updateTimer) return

    updateTimer = setInterval(() => {
      if (howl && isPlaying.value) {
        currentTime.value = howl.seek() as number
      }
    }, 1000)
  }

  // 停止更新计时器
  const stopUpdateTimer = () => {
    if (updateTimer) {
      clearInterval(updateTimer)
      updateTimer = null
    }
  }

  const toggleLike = (songId: number) => {
    // Ensure likedSongs is always a Set
    if (!(likedSongs.value instanceof Set)) {
      likedSongs.value = new Set(Array.isArray(likedSongs.value) ? likedSongs.value : [])
    }

    if (likedSongs.value.has(songId)) {
      likedSongs.value.delete(songId)
    } else {
      likedSongs.value.add(songId)
    }
  }

  const isLiked = (songId?: number) => {
    if (!songId) return false
    // Ensure likedSongs is always a Set
    if (!(likedSongs.value instanceof Set)) {
      likedSongs.value = new Set(Array.isArray(likedSongs.value) ? likedSongs.value : [])
    }
    return likedSongs.value.has(songId)
  }

  // 添加测试歌曲 (用于开发测试)
  const setTestSong = () => {
    const testSong: Song = {
      id: 1982632526, // 使用有效播放链接的歌曲
      name: '测试歌曲',
      artists: [{ id: 1, name: '测试歌手' }],
      album: { id: 1, name: '测试专辑' },
      cover: 'https://p1.music.126.net/9OctFTGTVGrQ2VfnUW5IpA==/109951168539669052.jpg',
      duration: 237000
    }
    setCurrentSong(testSong)
    setPlaylist([testSong], 0)
  }

  return {
    // 状态
    currentSong,
    playlist,
    currentIndex,
    likedSongs,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playMode,

    // 计算属性
    hasNext,
    hasPrev,
    progress,
    isHasPlayer,

    // 方法
    setCurrentSong,
    setPlaylist,
    togglePlay,
    play,
    pause,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    togglePlayMode,
    toggleLike,
    isLiked,
    setTestSong
  }
}, {
  persist: {
    paths: ['likedSongs', 'currentSong', 'volume', 'playMode']
  }
})
