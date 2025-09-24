import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Howl } from 'howler'
import { musicApi } from '@/api/music'
import { multiSourceMusicService } from '@/api/multiSourceMusic'
import { toastController } from '@ionic/vue'
import { useSettingsStore } from './settings'

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
  // 获取设置store
  const settingsStore = useSettingsStore()

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

  // 多源播放状态（新增）
  const currentAudioSource = ref<string>('') // 当前音源名称
  const isLoadingAlternativeSource = ref(false) // 是否正在加载备用音源

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

  // 加载并播放歌曲 - 增强多源支持
  const loadAndPlaySong = async (song: Song) => {
    try {
      console.log('🎵 开始加载歌曲:', song.name)

      // 重置多源状态
      currentAudioSource.value = ''
      isLoadingAlternativeSource.value = false

      // 停止当前播放
      if (howl) {
        howl.stop()
        howl.unload()
      }

      // 检测移动端环境
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                      window.location.protocol === 'capacitor:' ||
                      (typeof window !== 'undefined' && (window as any).Capacitor)

      console.log('🎵 移动端检测:', isMobile, 'protocol:', window.location.protocol)

      // 使用多源API获取播放链接
      console.log('🎵 使用多源API获取播放链接...')
      let songUrlResult = null

      try {
        songUrlResult = await musicApi.getMultiSourceSongUrl(song)
      } catch (error) {
        console.error('❌ 多源API获取失败:', error)
      }

      if (!songUrlResult) {
        console.error('❌ 无法获取歌曲播放链接')

        // 自动跳到下一首
        if (hasNext.value) {
          console.log('自动跳到下一首歌曲')
          showToast('该歌曲暂无音源，跳至下一首', 'warning')
          setTimeout(() => {
            nextSong()
          }, 1000)
        } else {
          showToast('该歌曲暂无音源', 'warning')
        }
        return
      }

      const { url: songUrl, source } = songUrlResult
      currentAudioSource.value = source

      console.log('✅ 获取到播放URL:', songUrl, '音源:', source)

      // 如果使用的是备用音源，显示提示
      if (source !== '网易云音乐') {
        isLoadingAlternativeSource.value = true
        showToast(`正在使用 ${source} 播放`, 'success')
        setTimeout(() => {
          isLoadingAlternativeSource.value = false
        }, 3000)
      }

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
          console.log('⏹️ 播放结束')

          // 根据播放模式处理播放结束
          if (playMode.value === 'repeat') {
            // 单曲循环：重新播放当前歌曲
            console.log('🔄 单曲循环，重新播放')
            setTimeout(() => {
              play()
            }, 100)
          } else {
            // 其他模式：播放下一首
            nextSong()
          }
        },
        onloaderror: (id, error) => {
          console.error('❌ 音频加载错误:', error)
          showToast('音频加载失败，尝试备用音源', 'warning')

          // 如果是网易云音源失败，尝试其他音源
          if (source === '网易云音乐') {
            loadAlternativeSource(song)
          }
        },
        onplayerror: (id, error) => {
          console.error('❌ 音频播放错误:', error)
          showToast('播放失败，尝试备用音源', 'warning')

          // 尝试备用音源
          loadAlternativeSource(song)
        }
      })

      // 开始播放
      console.log('🎵 尝试开始播放...')
      try {
        howl.play()
        console.log('✅ 播放命令已发送')
      } catch (playError) {
        console.error('❌ 播放失败:', playError)
        loadAlternativeSource(song)
      }

    } catch (error) {
      console.error('加载歌曲失败:', error)
      showToast('加载歌曲失败', 'danger')
    }
  }

  // 加载备用音源（新增）
  const loadAlternativeSource = async (song: Song) => {
    if (isLoadingAlternativeSource.value) {
      console.log('⚠️ 已在加载备用音源，跳过')
      return
    }

    isLoadingAlternativeSource.value = true
    console.log('🔄 尝试加载备用音源:', song.name)

    try {
      // 停止当前实例
      if (howl) {
        howl.stop()
        howl.unload()
      }

      // 强制使用多源服务（跳过网易云）
      const fallbackResult = await multiSourceMusicService.getPlayableUrl(song)

      if (!fallbackResult) {
        console.error('❌ 备用音源也无法获取')
        showToast('所有音源都无法播放', 'danger')

        // 自动跳到下一首
        if (hasNext.value) {
          setTimeout(() => {
            nextSong()
          }, 1000)
        }
        return
      }

      const { url: fallbackUrl, source: fallbackSource } = fallbackResult
      currentAudioSource.value = fallbackSource

      console.log('✅ 获取到备用播放URL:', fallbackUrl, '音源:', fallbackSource)
      showToast(`切换到 ${fallbackSource}`, 'success')

      // 创建新的Howl实例
      howl = new Howl({
        src: [fallbackUrl],
        html5: false,
        volume: volume.value,
        preload: true,
        onload: () => {
          duration.value = howl?.duration() || 0
          console.log('✅ 备用音源加载完成')
        },
        onplay: () => {
          isPlaying.value = true
          startUpdateTimer()
          console.log('✅ 备用音源开始播放')
        },
        onpause: () => {
          isPlaying.value = false
          stopUpdateTimer()
        },
        onend: () => {
          isPlaying.value = false
          console.log('⏹️ 备用音源播放结束')

          // 根据播放模式处理播放结束
          if (playMode.value === 'repeat') {
            // 单曲循环：重新播放当前歌曲
            console.log('🔄 单曲循环，重新播放')
            setTimeout(() => {
              play()
            }, 100)
          } else {
            // 其他模式：播放下一首
            nextSong()
          }
        },
        onloaderror: () => {
          console.error('❌ 备用音源也加载失败')
          showToast('备用音源加载失败', 'danger')
        }
      })

      // 开始播放备用音源
      howl.play()

    } catch (error) {
      console.error('❌ 备用音源加载异常:', error)
      showToast('备用音源加载异常', 'danger')
    } finally {
      setTimeout(() => {
        isLoadingAlternativeSource.value = false
      }, 3000)
    }
  }

  // 播放/暂停切换
  const togglePlay = async () => {
    if (!howl) {
    // 没有音频实例，重新加载当前歌曲
    if (currentSong.value && currentSong.value.id) {
      await loadAndPlaySong(currentSong.value)
    }
    return
  }

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
  const togglePlayMode = async () => {
    const modes: Array<'order' | 'random' | 'repeat'> = ['order', 'random', 'repeat']
    const currentIndex = modes.indexOf(playMode.value)
    playMode.value = modes[(currentIndex + 1) % modes.length]

    // 显示toast提示
    const modeNames = {
      'order': '顺序播放',
      'random': '随机播放',
      'repeat': '单曲循环'
    }

    // 使用自定义提示显示播放模式
    showPlayModeToast(modeNames[playMode.value])

    console.log('切换播放模式:', modeNames[playMode.value])
  }

  // 开始更新计时器
  const startUpdateTimer = () => {
    if (updateTimer) return

    updateTimer = setInterval(() => {
      if (howl && isPlaying.value) {
        currentTime.value = howl.seek() as number
      }
    }, 1000) as unknown as number
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

    // 多源播放状态
    currentAudioSource,
    isLoadingAlternativeSource,

    // 计算属性
    hasNext,
    hasPrev,
    progress,
    isHasPlayer,

    // 方法
    setCurrentSong,
    loadAndPlaySong,
    loadAlternativeSource,
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

// 自定义播放模式提示
const showPlayModeToast = (modeText: string) => {
  // 移除已存在的提示
  const existingToast = document.querySelector('.custom-play-mode-toast')
  if (existingToast) {
    existingToast.remove()
  }

  // 创建提示元素
  const toast = document.createElement('div')
  toast.className = 'custom-play-mode-toast'
  toast.textContent = `播放模式: ${modeText}`

  // 设置样式
  Object.assign(toast.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    marginTop: '120px', // 向下偏移更多，到进度条下方
    color: '#99CCFF', // 更淡的蓝色
    fontSize: '12px',
    fontWeight: '600',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    zIndex: '10000',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  })

  // 添加到页面
  document.body.appendChild(toast)

  // 显示动画
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
  })

  // 1.5秒后移除
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 1500)
}
