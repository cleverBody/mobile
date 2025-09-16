import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface PlaylistItem {
  id: number
  name: string
  cover: string
  trackCount?: number
  creator?: string
  createTime?: string
}

export interface AlbumItem {
  id: number
  name: string
  cover: string
  artist: string
  releaseDate?: string
}

export interface ArtistItem {
  id: number
  name: string
  cover: string
  followers?: number
}

export const useLibraryStore = defineStore('library', () => {
  // 状态
  const likedSongsCount = ref(0)
  const recentPlayedCount = ref(0)
  const cloudSongsCount = ref(0)
  const createdPlaylists = ref<PlaylistItem[]>([])
  const collectedPlaylists = ref<PlaylistItem[]>([])
  const collectedAlbums = ref<AlbumItem[]>([])
  const collectedArtists = ref<ArtistItem[]>([])
  const loading = ref(false)
  
  // 方法
  const loadLibraryData = async () => {
    if (loading.value) return
    
    loading.value = true
    try {
      // TODO: 调用实际API
      await loadMockData()
    } catch (error) {
      console.error('加载音乐库数据失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const loadMockData = async () => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // 统计数据
    likedSongsCount.value = 156
    recentPlayedCount.value = 89
    cloudSongsCount.value = 23
    
    // 创建的歌单
    createdPlaylists.value = [
      {
        id: 1001,
        name: '我喜欢的音乐',
        cover: '/images/liked-songs.jpg',
        trackCount: 156,
        createTime: '2023-01-15'
      },
      {
        id: 1002,
        name: '开车听的歌',
        cover: '/images/driving-playlist.jpg',
        trackCount: 45,
        createTime: '2023-05-20'
      },
      {
        id: 1003,
        name: '运动音乐',
        cover: '/images/workout-playlist.jpg',
        trackCount: 32,
        createTime: '2023-08-10'
      },
      {
        id: 1004,
        name: '夜晚静听',
        cover: '/images/night-playlist.jpg',
        trackCount: 28,
        createTime: '2023-11-05'
      }
    ]
    
    // 收藏的歌单
    collectedPlaylists.value = [
      {
        id: 2001,
        name: '华语经典老歌',
        cover: '/images/classic-chinese.jpg',
        trackCount: 200,
        creator: '音乐达人'
      },
      {
        id: 2002,
        name: '欧美流行精选',
        cover: '/images/western-pop.jpg',
        trackCount: 180,
        creator: '海外音乐'
      },
      {
        id: 2003,
        name: '日系治愈音乐',
        cover: '/images/japanese-healing.jpg',
        trackCount: 120,
        creator: '治愈系'
      }
    ]
    
    // 收藏的专辑
    collectedAlbums.value = [
      {
        id: 3001,
        name: '最伟大的作品',
        cover: '/images/album-jay1.jpg',
        artist: '周杰伦',
        releaseDate: '2022-07-15'
      },
      {
        id: 3002,
        name: 'Planet',
        cover: '/images/album-jam1.jpg',
        artist: '萧敬腾',
        releaseDate: '2022-12-30'
      },
      {
        id: 3003,
        name: '还是会想你',
        cover: '/images/album-linda1.jpg',
        artist: '林达浪',
        releaseDate: '2023-02-14'
      },
      {
        id: 3004,
        name: '如果声音不记得',
        cover: '/images/album-wu1.jpg',
        artist: '吴青峰',
        releaseDate: '2023-03-21'
      }
    ]
    
    // 收藏的歌手
    collectedArtists.value = [
      {
        id: 4001,
        name: '周杰伦',
        cover: '/images/artist-jay.jpg',
        followers: 2580000
      },
      {
        id: 4002,
        name: '陈奕迅',
        cover: '/images/artist-eason.jpg',
        followers: 1890000
      },
      {
        id: 4003,
        name: '邓紫棋',
        cover: '/images/artist-gem.jpg',
        followers: 1650000
      },
      {
        id: 4004,
        name: '林俊杰',
        cover: '/images/artist-jj.jpg',
        followers: 1420000
      },
      {
        id: 4005,
        name: '薛之谦',
        cover: '/images/artist-joker.jpg',
        followers: 1230000
      },
      {
        id: 4006,
        name: '毛不易',
        cover: '/images/artist-mao.jpg',
        followers: 980000
      }
    ]
  }
  
  const addToLiked = (songId: number) => {
    // TODO: 添加到喜欢的音乐
    likedSongsCount.value++
  }
  
  const removeFromLiked = (songId: number) => {
    // TODO: 从喜欢的音乐移除
    if (likedSongsCount.value > 0) {
      likedSongsCount.value--
    }
  }
  
  const createNewPlaylist = async (name: string, description?: string) => {
    // TODO: 创建新歌单
    const newPlaylist: PlaylistItem = {
      id: Date.now(),
      name,
      cover: '/images/default-playlist.jpg',
      trackCount: 0,
      createTime: new Date().toISOString()
    }
    createdPlaylists.value.unshift(newPlaylist)
    return newPlaylist
  }
  
  return {
    // 状态
    likedSongsCount,
    recentPlayedCount,
    cloudSongsCount,
    createdPlaylists,
    collectedPlaylists,
    collectedAlbums,
    collectedArtists,
    loading,
    
    // 方法
    loadLibraryData,
    addToLiked,
    removeFromLiked,
    createNewPlaylist
  }
})