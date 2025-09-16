import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface PlaylistItem {
  id: number
  name: string
  cover: string
  description?: string
  playCount?: number
  creator?: string
}

export interface ArtistItem {
  id: number
  name: string
  cover: string
  followers?: number
  description?: string
}

export interface RankingItem {
  id: number
  name: string
  cover: string
  topSongs: Array<{
    id: number
    name: string
    artist: string
  }>
}

export const useDiscoverStore = defineStore('discover', () => {
  // 状态
  const hotPlaylists = ref<PlaylistItem[]>([])
  const recommendedArtists = ref<ArtistItem[]>([])
  const topRankings = ref<RankingItem[]>([])
  const loading = ref(false)
  
  // 方法
  const loadDiscoverData = async () => {
    if (loading.value) return
    
    loading.value = true
    try {
      // TODO: 调用实际API
      await loadMockData()
    } catch (error) {
      console.error('加载发现页数据失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const loadMockData = async () => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 热门歌单
    hotPlaylists.value = [
      {
        id: 1,
        name: '华语流行精选',
        cover: '/images/playlist1.jpg',
        description: '最新最热的华语流行歌曲',
        playCount: 125000,
        creator: '音乐推荐官'
      },
      {
        id: 2,
        name: '欧美金曲榜',
        cover: '/images/playlist2.jpg',
        description: '经典欧美流行音乐合集',
        playCount: 89000,
        creator: '海外音乐'
      },
      {
        id: 3,
        name: '日韩热门',
        cover: '/images/playlist3.jpg',
        description: 'J-POP和K-POP热门单曲',
        playCount: 156000,
        creator: '亚洲音乐'
      },
      {
        id: 4,
        name: '民谣时光',
        cover: '/images/playlist4.jpg',
        description: '温暖治愈的民谣歌曲',
        playCount: 67000,
        creator: '民谣诗人'
      }
    ]
    
    // 推荐歌手
    recommendedArtists.value = [
      {
        id: 1,
        name: '周杰伦',
        cover: '/images/artist1.jpg',
        followers: 2580000,
        description: '华语流行天王'
      },
      {
        id: 2,
        name: '陈奕迅',
        cover: '/images/artist2.jpg',
        followers: 1890000,
        description: '香港歌手'
      },
      {
        id: 3,
        name: '邓紫棋',
        cover: '/images/artist3.jpg',
        followers: 1650000,
        description: '实力女歌手'
      },
      {
        id: 4,
        name: '林俊杰',
        cover: '/images/artist4.jpg',
        followers: 1420000,
        description: '创作才子'
      },
      {
        id: 5,
        name: '薛之谦',
        cover: '/images/artist5.jpg',
        followers: 1230000,
        description: '情歌王子'
      },
      {
        id: 6,
        name: '毛不易',
        cover: '/images/artist6.jpg',
        followers: 980000,
        description: '民谣歌手'
      }
    ]
    
    // 榜单推荐
    topRankings.value = [
      {
        id: 101,
        name: '热歌榜',
        cover: '/images/ranking1.jpg',
        topSongs: [
          { id: 1001, name: '稻香', artist: '周杰伦' },
          { id: 1002, name: '十年', artist: '陈奕迅' },
          { id: 1003, name: '光年之外', artist: '邓紫棋' }
        ]
      },
      {
        id: 102,
        name: '新歌榜',
        cover: '/images/ranking2.jpg',
        topSongs: [
          { id: 2001, name: '最伟大的作品', artist: '周杰伦' },
          { id: 2002, name: '还是会想你', artist: '林达浪' },
          { id: 2003, name: '如果声音不记得', artist: '吴青峰' }
        ]
      },
      {
        id: 103,
        name: '飙升榜',
        cover: '/images/ranking3.jpg',
        topSongs: [
          { id: 3001, name: '孤勇者', artist: '陈奕迅' },
          { id: 3002, name: '夜曲', artist: '周杰伦' },
          { id: 3003, name: '漠河舞厅', artist: '柳爽' }
        ]
      }
    ]
  }
  
  return {
    // 状态
    hotPlaylists,
    recommendedArtists,
    topRankings,
    loading,
    
    // 方法
    loadDiscoverData
  }
})