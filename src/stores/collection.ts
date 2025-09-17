import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CollectedPlaylist {
  id: number
  name: string
  cover: string
  creator: string
  trackCount: number
  playCount: number
}

export interface CollectedAlbum {
  id: number
  name: string
  cover: string
  artist: string
  publishTime: string
  trackCount: number
}

export interface CollectedArtist {
  id: number
  name: string
  cover: string
  followers: number
  albumCount: number
}

export interface CollectedVideo {
  id: number
  name: string
  cover: string
  artist: string
  duration: string
  playCount: number
}

export const useCollectionStore = defineStore('collection', () => {
  // 状态
  const collectedPlaylists = ref<CollectedPlaylist[]>([])
  const collectedAlbums = ref<CollectedAlbum[]>([])
  const collectedArtists = ref<CollectedArtist[]>([])
  const collectedVideos = ref<CollectedVideo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const playlistsCount = computed(() => collectedPlaylists.value.length)
  const albumsCount = computed(() => collectedAlbums.value.length)
  const artistsCount = computed(() => collectedArtists.value.length)
  const videosCount = computed(() => collectedVideos.value.length)

  // 方法
  const loadCollectionData = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 模拟数据，实际应该调用API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟收藏的歌单数据
      collectedPlaylists.value = [
        {
          id: 1,
          name: '华语流行精选',
          cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
          creator: '网易云音乐',
          trackCount: 50,
          playCount: 1234567
        },
        {
          id: 2,
          name: '欧美经典金曲',
          cover: 'https://p1.music.126.net/bYHico6cjjYJGSHFEQUAcA==/109951164203212784.jpg',
          creator: '音乐推荐官',
          trackCount: 30,
          playCount: 987654
        },
        {
          id: 3,
          name: '日系治愈音乐',
          cover: 'https://p1.music.126.net/jWE3OEZUlwdz0ARvyQ9wWw==/109951165474121408.jpg',
          creator: '日音小站',
          trackCount: 25,
          playCount: 456789
        },
        {
          id: 4,
          name: '民谣在路上',
          cover: 'https://p1.music.126.net/M19SOoRMkcHmJvmGflXjXQ==/109951164627180052.jpg',
          creator: '民谣收藏家',
          trackCount: 40,
          playCount: 234567
        }
      ]

      // 模拟收藏的专辑数据
      collectedAlbums.value = [
        {
          id: 1,
          name: '十一月的萧邦',
          cover: 'https://p1.music.126.net/13ZHHiRhtBhrXBfUf_Wu_w==/109951165142435842.jpg',
          artist: '周杰伦',
          publishTime: '2005-11-01',
          trackCount: 12
        },
        {
          id: 2,
          name: 'Purpose',
          cover: 'https://p1.music.126.net/6cc6lgOfQTo6ovNnTHPyJg==/2946691248081599.jpg',
          artist: 'Justin Bieber',
          publishTime: '2015-11-13',
          trackCount: 13
        },
        {
          id: 3,
          name: '模特',
          cover: 'https://p1.music.126.net/gJzSR8WjOJbGJVjDzUhqcw==/109951163076136658.jpg',
          artist: '李荣浩',
          publishTime: '2014-11-17',
          trackCount: 10
        }
      ]

      // 模拟收藏的歌手数据
      collectedArtists.value = [
        {
          id: 1,
          name: '周杰伦',
          cover: 'https://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951165798773745.jpg',
          followers: 12345678,
          albumCount: 15
        },
        {
          id: 2,
          name: '邓紫棋',
          cover: 'https://p1.music.126.net/p9U80ex1B1ciPFa125xV5A==/5931865232210340.jpg',
          followers: 8765432,
          albumCount: 8
        },
        {
          id: 3,
          name: 'Taylor Swift',
          cover: 'https://p1.music.126.net/MhJKb3R5aNLJNKhPbgKgVA==/109951164477930604.jpg',
          followers: 15678901,
          albumCount: 12
        },
        {
          id: 4,
          name: '陈奕迅',
          cover: 'https://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951165798773745.jpg',
          followers: 9876543,
          albumCount: 20
        },
        {
          id: 5,
          name: '薛之谦',
          cover: 'https://p1.music.126.net/3631c4203d96a4d86f5b5b0b6d0e7d6e==/109951163071311830.jpg',
          followers: 6543210,
          albumCount: 6
        },
        {
          id: 6,
          name: '毛不易',
          cover: 'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg',
          followers: 4321098,
          albumCount: 4
        }
      ]

      // 模拟收藏的视频数据
      collectedVideos.value = [
        {
          id: 1,
          name: '青花瓷',
          cover: 'https://p1.music.126.net/Wl7T1LBRhKFlmQLv2-sSdA==/109951163076136658.jpg',
          artist: '周杰伦',
          duration: '3:58',
          playCount: 12345678
        },
        {
          id: 2,
          name: 'Shape of You',
          cover: 'https://p1.music.126.net/6cc6lgOfQTo6ovNnTHPyJg==/2946691248081599.jpg',
          artist: 'Ed Sheeran',
          duration: '3:53',
          playCount: 9876543
        }
      ]

    } catch (err) {
      error.value = '加载收藏数据失败'
      console.error('Failed to load collection data:', err)
    } finally {
      loading.value = false
    }
  }

  const addToCollection = (type: 'playlist' | 'album' | 'artist' | 'video', item: any) => {
    switch (type) {
      case 'playlist':
        if (!collectedPlaylists.value.find(p => p.id === item.id)) {
          collectedPlaylists.value.unshift(item)
        }
        break
      case 'album':
        if (!collectedAlbums.value.find(a => a.id === item.id)) {
          collectedAlbums.value.unshift(item)
        }
        break
      case 'artist':
        if (!collectedArtists.value.find(a => a.id === item.id)) {
          collectedArtists.value.unshift(item)
        }
        break
      case 'video':
        if (!collectedVideos.value.find(v => v.id === item.id)) {
          collectedVideos.value.unshift(item)
        }
        break
    }
  }

  const removeFromCollection = (type: 'playlist' | 'album' | 'artist' | 'video', id: number) => {
    switch (type) {
      case 'playlist':
        collectedPlaylists.value = collectedPlaylists.value.filter(p => p.id !== id)
        break
      case 'album':
        collectedAlbums.value = collectedAlbums.value.filter(a => a.id !== id)
        break
      case 'artist':
        collectedArtists.value = collectedArtists.value.filter(a => a.id !== id)
        break
      case 'video':
        collectedVideos.value = collectedVideos.value.filter(v => v.id !== id)
        break
    }
  }

  const isCollected = (type: 'playlist' | 'album' | 'artist' | 'video', id: number): boolean => {
    switch (type) {
      case 'playlist':
        return collectedPlaylists.value.some(p => p.id === id)
      case 'album':
        return collectedAlbums.value.some(a => a.id === id)
      case 'artist':
        return collectedArtists.value.some(a => a.id === id)
      case 'video':
        return collectedVideos.value.some(v => v.id === id)
      default:
        return false
    }
  }

  const clearCollection = () => {
    collectedPlaylists.value = []
    collectedAlbums.value = []
    collectedArtists.value = []
    collectedVideos.value = []
  }

  return {
    // 状态
    collectedPlaylists,
    collectedAlbums,
    collectedArtists,
    collectedVideos,
    loading,
    error,
    
    // 计算属性
    playlistsCount,
    albumsCount,
    artistsCount,
    videosCount,
    
    // 方法
    loadCollectionData,
    addToCollection,
    removeFromCollection,
    isCollected,
    clearCollection
  }
}, {
  persist: true
})
