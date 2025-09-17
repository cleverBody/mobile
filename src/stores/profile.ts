import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CreatedPlaylist {
  id: number
  name: string
  cover: string
  trackCount: number
  playCount: number
  createTime: string
  privacy: boolean
}

export interface RecentPlayed {
  id: number
  name: string
  artist: string
  cover: string
  playTime: string
}

export interface DownloadedSong {
  id: number
  name: string
  artist: string
  cover: string
  size: string
  quality: string
  downloadTime: string
}

export const useProfileStore = defineStore('profile', () => {
  // 状态
  const createdPlaylists = ref<CreatedPlaylist[]>([])
  const recentPlayed = ref<RecentPlayed[]>([])
  const downloadedSongs = ref<DownloadedSong[]>([])
  const likedSongs = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const likedSongsCount = computed(() => likedSongs.value.length)
  const recentPlayedCount = computed(() => recentPlayed.value.length)
  const downloadedCount = computed(() => downloadedSongs.value.length)
  const createdPlaylistsCount = computed(() => createdPlaylists.value.length)

  // 方法
  const loadProfileData = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 模拟数据，实际应该调用API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟创建的歌单数据
      createdPlaylists.value = [
        {
          id: 1,
          name: '我的最爱',
          cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
          trackCount: 128,
          playCount: 5678,
          createTime: '2023-01-15',
          privacy: false
        },
        {
          id: 2,
          name: '深夜电台',
          cover: 'https://p1.music.126.net/bYHico6cjjYJGSHFEQUAcA==/109951164203212784.jpg',
          trackCount: 45,
          playCount: 2341,
          createTime: '2023-03-22',
          privacy: false
        },
        {
          id: 3,
          name: '运动时光',
          cover: 'https://p1.music.126.net/jWE3OEZUlwdz0ARvyQ9wWw==/109951165474121408.jpg',
          trackCount: 32,
          playCount: 1876,
          createTime: '2023-05-10',
          privacy: true
        },
        {
          id: 4,
          name: '回忆杀',
          cover: 'https://p1.music.126.net/M19SOoRMkcHmJvmGflXjXQ==/109951164627180052.jpg',
          trackCount: 67,
          playCount: 3456,
          createTime: '2023-07-08',
          privacy: false
        }
      ]

      // 模拟最近播放数据
      recentPlayed.value = [
        {
          id: 1,
          name: '青花瓷',
          artist: '周杰伦',
          cover: 'https://p1.music.126.net/13ZHHiRhtBhrXBfUf_Wu_w==/109951165142435842.jpg',
          playTime: '2024-01-15 14:30'
        },
        {
          id: 2,
          name: 'Shape of You',
          artist: 'Ed Sheeran',
          cover: 'https://p1.music.126.net/6cc6lgOfQTo6ovNnTHPyJg==/2946691248081599.jpg',
          playTime: '2024-01-15 13:45'
        },
        {
          id: 3,
          name: '模特',
          artist: '李荣浩',
          cover: 'https://p1.music.126.net/gJzSR8WjOJbGJVjDzUhqcw==/109951163076136658.jpg',
          playTime: '2024-01-15 12:20'
        }
      ]

      // 模拟下载的歌曲数据
      downloadedSongs.value = [
        {
          id: 1,
          name: '青花瓷',
          artist: '周杰伦',
          cover: 'https://p1.music.126.net/13ZHHiRhtBhrXBfUf_Wu_w==/109951165142435842.jpg',
          size: '8.5MB',
          quality: '320kbps',
          downloadTime: '2024-01-10 16:20'
        },
        {
          id: 2,
          name: '告白气球',
          artist: '周杰伦',
          cover: 'https://p1.music.126.net/13ZHHiRhtBhrXBfUf_Wu_w==/109951165142435842.jpg',
          size: '7.8MB',
          quality: '320kbps',
          downloadTime: '2024-01-10 16:18'
        }
      ]

      // 模拟我喜欢的音乐数据
      likedSongs.value = Array.from({ length: 156 }, (_, i) => ({
        id: i + 1,
        name: `歌曲 ${i + 1}`,
        artist: '歌手名'
      }))

    } catch (err) {
      error.value = '加载个人数据失败'
      console.error('Failed to load profile data:', err)
    } finally {
      loading.value = false
    }
  }

  const createPlaylist = async (name: string, privacy: boolean = false) => {
    try {
      // 模拟创建歌单API调用
      const newPlaylist: CreatedPlaylist = {
        id: Date.now(),
        name,
        cover: '/images/playlist-default.jpg',
        trackCount: 0,
        playCount: 0,
        createTime: new Date().toISOString().split('T')[0],
        privacy
      }
      
      createdPlaylists.value.unshift(newPlaylist)
      return newPlaylist
    } catch (err) {
      error.value = '创建歌单失败'
      throw err
    }
  }

  const deletePlaylist = async (id: number) => {
    try {
      // 模拟删除歌单API调用
      createdPlaylists.value = createdPlaylists.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = '删除歌单失败'
      throw err
    }
  }

  const updatePlaylist = async (id: number, updates: Partial<CreatedPlaylist>) => {
    try {
      // 模拟更新歌单API调用
      const index = createdPlaylists.value.findIndex(p => p.id === id)
      if (index !== -1) {
        createdPlaylists.value[index] = { ...createdPlaylists.value[index], ...updates }
      }
    } catch (err) {
      error.value = '更新歌单失败'
      throw err
    }
  }

  const addToRecentPlayed = (song: Omit<RecentPlayed, 'playTime'>) => {
    const existingIndex = recentPlayed.value.findIndex(item => item.id === song.id)
    
    if (existingIndex !== -1) {
      // 如果已存在，移除旧记录
      recentPlayed.value.splice(existingIndex, 1)
    }
    
    // 添加到最前面
    recentPlayed.value.unshift({
      ...song,
      playTime: new Date().toLocaleString()
    })
    
    // 保持最多100条记录
    if (recentPlayed.value.length > 100) {
      recentPlayed.value = recentPlayed.value.slice(0, 100)
    }
  }

  const clearRecentPlayed = () => {
    recentPlayed.value = []
  }

  const addToDownloads = (song: Omit<DownloadedSong, 'downloadTime'>) => {
    const exists = downloadedSongs.value.some(item => item.id === song.id)
    
    if (!exists) {
      downloadedSongs.value.unshift({
        ...song,
        downloadTime: new Date().toLocaleString()
      })
    }
  }

  const removeFromDownloads = (id: number) => {
    downloadedSongs.value = downloadedSongs.value.filter(song => song.id !== id)
  }

  const clearDownloads = () => {
    downloadedSongs.value = []
  }

  const addToLikedSongs = (song: any) => {
    const exists = likedSongs.value.some(item => item.id === song.id)
    
    if (!exists) {
      likedSongs.value.unshift(song)
    }
  }

  const removeFromLikedSongs = (id: number) => {
    likedSongs.value = likedSongs.value.filter(song => song.id !== id)
  }

  const isLiked = (id: number): boolean => {
    return likedSongs.value.some(song => song.id === id)
  }

  const clearProfile = () => {
    createdPlaylists.value = []
    recentPlayed.value = []
    downloadedSongs.value = []
    likedSongs.value = []
  }

  return {
    // 状态
    createdPlaylists,
    recentPlayed,
    downloadedSongs,
    likedSongs,
    loading,
    error,
    
    // 计算属性
    likedSongsCount,
    recentPlayedCount,
    downloadedCount,
    createdPlaylistsCount,
    
    // 方法
    loadProfileData,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    addToRecentPlayed,
    clearRecentPlayed,
    addToDownloads,
    removeFromDownloads,
    clearDownloads,
    addToLikedSongs,
    removeFromLikedSongs,
    isLiked,
    clearProfile
  }
}, {
  persist: true
})
