import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { Howl } from "howler";
import { useMusicStore } from "./music";
import { musicApi } from "@/api/music";

export const usePlayerStore = defineStore('player', () => {
  // 状态
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const playMode = ref<'order' | 'random' | 'repeat'>('order') // 播放模式
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Howler 实例
  let howlInstance: Howl | null = null
  let progressTimer: number | null = null

  // 计算属性
  const progressPercent = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  })

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const currentTimeFormatted = computed(() => formatTime(currentTime.value))
  const durationFormatted = computed(() => formatTime(duration.value))

  // 获取音乐store
  const musicStore = useMusicStore()

  // 获取歌曲播放URL
  const getSongPlayUrl = async (songId: number): Promise<string | null> => {
    try {
      const response = await musicApi.getSongUrl(songId)
      if (response.data && response.data.length > 0) {
        const songData = response.data.find(item => item.id === songId)
        // alert(songData)
        if (songData?.url) {
          return songData.url
        } else {
          console.warn('歌曲播放链接为空，可能因为版权限制:', songData)

          // 尝试不同音质等级的降级策略
          const fallbackLevels = ['standard', 'higher', 'lossless']
          for (const level of fallbackLevels) {
            try {
              console.log(`尝试降级音质 ${level} 获取播放链接...`)
              const fallbackResponse = await musicApi.getSongUrl(songId, level)
              if (fallbackResponse.data && fallbackResponse.data.length > 0) {
                const fallbackSongData = fallbackResponse.data.find(item => item.id === songId)
                if (fallbackSongData?.url) {
                  console.log(`降级音质 ${level} 成功获取播放链接`)
                  return fallbackSongData.url
                }
              }
            } catch (fallbackErr) {
              console.warn(`降级音质 ${level} 失败:`, fallbackErr)
            }
          }

          return null
        }
      }
      return null
    } catch (err) {
      console.error('获取歌曲URL失败:', err)
      return null
    }
  }

  // 方法
  const initPlayer = async (url: string) => {
    try {
      // 销毁之前的实例
      if (howlInstance) {
        howlInstance.unload()
      }

      // 重置状态
      isLoading.value = true
      error.value = null
      currentTime.value = 0
      duration.value = 0

      howlInstance = new Howl({
        src: [url],
        html5: true,
        volume: volume.value,
        preload: true,
        onload: () => {
          isLoading.value = false
          duration.value = howlInstance?.duration() || 0
          console.log('音频加载完成，时长:', duration.value)
        },
        onloaderror: (_id, err) => {
          console.error('音频加载失败:', err)
          isLoading.value = false
          error.value = '音频加载失败'
        },
        onplay: () => {
          isPlaying.value = true
          startProgressTimer()
          console.log('开始播放')
        },
        onpause: () => {
          isPlaying.value = false
          stopProgressTimer()
          console.log('暂停播放')
        },
        onend: () => {
          isPlaying.value = false
          stopProgressTimer()
          handleSongEnd()
          console.log('播放结束')
        },
        onstop: () => {
          isPlaying.value = false
          stopProgressTimer()
          currentTime.value = 0
          console.log('停止播放')
        }
      })
    } catch (err) {
      console.error('初始化播放器失败:', err)
      isLoading.value = false
      error.value = '初始化失败'
    }
  }

  const play = () => {
    if (howlInstance && !isLoading.value) {
      try {
        howlInstance.play()
      } catch (err) {
        console.error('播放失败:', err)
        error.value = '播放失败'
      }
    }
  }

  const pause = () => {
    if (howlInstance) {
      try {
        howlInstance.pause()
      } catch (err) {
        console.error('暂停失败:', err)
      }
    }
  }

  // 切换播放/暂停状态
  const togglePlay = async () => {
    if (isPlaying.value) {
      // 当前正在播放，暂停
      pause()
    } else {
      // 当前暂停，开始播放
      if (howlInstance) {
        // 有音频实例，直接播放
        play()
      } else {
        // 没有音频实例，重新加载当前歌曲
        const currentSong = musicStore.currentSong
        if (currentSong && currentSong.id) {
          try {
            await musicStore.loadAndPlaySong(currentSong)
          } catch (error) {
            console.error('重新加载歌曲失败:', error)
          }
        }
      }
    }
  }

  const stop = () => {
    if (howlInstance) {
      try {
        howlInstance.stop()
      } catch (err) {
        console.error('停止失败:', err)
      }
    }
  }

  const seek = (time: number) => {
    if (howlInstance && duration.value > 0) {
      try {
        // 确保时间在有效范围内
        const seekTime = Math.max(0, Math.min(time, duration.value))
        howlInstance.seek(seekTime)
        currentTime.value = seekTime
      } catch (err) {
        console.error('跳转失败:', err)
      }
    }
  }

  const setVolume = (vol: number) => {
    // 确保音量在0-1范围内
    const newVolume = Math.max(0, Math.min(vol, 1))
    volume.value = newVolume
    if (howlInstance) {
      try {
        howlInstance.volume(newVolume)
      } catch (err) {
        console.error('设置音量失败:', err)
      }
    }
  }

  const startProgressTimer = () => {
    stopProgressTimer()
    progressTimer = window.setInterval(() => {
      if (howlInstance && isPlaying.value) {
        try {
          currentTime.value = howlInstance.seek()
        } catch (err) {
          console.error('获取播放进度失败:', err)
          stopProgressTimer()
        }
      }
    }, 100) // 每100ms更新一次进度
  }

  const stopProgressTimer = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  const handleSongEnd = () => {
    switch (playMode.value) {
      case 'order':
        // 顺序播放：播放下一首
        if (musicStore.hasNext) {
          nextSong()
        }
        break
      case 'random':
        // 随机播放：随机选择一首
        const playlist = musicStore.playlist
        if (playlist.length > 0) {
          const randomIndex = Math.floor(Math.random() * playlist.length)
          musicStore.currentIndex = randomIndex
          musicStore.setCurrentSong(playlist[randomIndex])
        }
        break
      case 'repeat':
        // 单曲循环：重新播放当前歌曲
        if (howlInstance) {
          currentTime.value = 0
          howlInstance.seek(0)
          howlInstance.play()
        }
        break
    }
  }

  const nextSong = () => {
    if (musicStore.hasNext) {
      musicStore.nextSong()
    }
  }

  const prevSong = () => {
    if (musicStore.hasPrev) {
      musicStore.prevSong()
    }
  }

  const togglePlayMode = () => {
    const modes: Array<'order' | 'random' | 'repeat'> = ['order', 'random', 'repeat']
    const currentIndex = modes.indexOf(playMode.value)
    playMode.value = modes[(currentIndex + 1) % modes.length]

    // 提示用户当前播放模式
    const modeNames = {
      'order': '顺序播放',
      'random': '随机播放',
      'repeat': '单曲循环'
    }
    console.log('切换播放模式:', modeNames[playMode.value])
  }

  const resetPlayer = () => {
    stop()
    currentTime.value = 0
    duration.value = 0
    error.value = null
    isLoading.value = false
  }

  // 监听当前歌曲变化，自动加载新歌曲
  watch(
    () => musicStore.currentSong,
    async (newSong, oldSong) => {
      if (newSong && newSong.id !== oldSong?.id) {
        console.log('歌曲变化，加载新歌曲:', newSong.name)

        try {
          // 获取真实的播放URL
          const realUrl = await getSongPlayUrl(newSong.id)
          if (realUrl) {
            await initPlayer(realUrl)

            // 如果之前在播放，新歌曲加载完成后自动播放
            if (oldSong && isPlaying.value) {
              play()
            }
          } else {
            error.value = '该歌曲暂无音源'
            console.error('歌曲播放链接为空:', newSong.id, newSong.name)

            // 自动跳到下一首（如果有的话）
            if (musicStore.hasNext) {
              console.log('自动跳到下一首歌曲')
              setTimeout(() => {
                nextSong()
              }, 1000) // 延迟1秒后跳转，让用户看到错误提示
            } else {
              console.log('已是最后一首歌曲')
            }
          }
        } catch (err) {
          console.error('获取歌曲播放链接失败:', err)
          error.value = '获取播放链接失败'

          // 自动跳到下一首（如果有的话）
          if (musicStore.hasNext) {
            console.log('播放失败，自动跳到下一首歌曲')
            setTimeout(() => {
              nextSong()
            }, 1000)
          }
        }
      }
    },
    { immediate: false }
  )

  // 监听音量变化
  watch(volume, (newVolume) => {
    if (howlInstance) {
      howlInstance.volume(newVolume)
    }
  })

  return {
    // 状态
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    isLoading,
    error,

    // 计算属性
    progressPercent,
    currentTimeFormatted,
    durationFormatted,

    // 方法
    initPlayer,
    play,
    pause,
    togglePlay,
    stop,
    seek,
    setVolume,
    togglePlayMode,
    nextSong,
    prevSong,
    resetPlayer
  }
}, {
  persist: {
    paths: ['volume', 'playMode']
  }
})
