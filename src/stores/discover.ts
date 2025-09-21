import { defineStore } from 'pinia'
import { ref } from 'vue'
import { playlistApi, toplistApi, artistApi, recommendApi } from '@/api/discover'

export interface PlaylistItem {
  id: number
  name: string
  cover: string
  description?: string
  playCount?: number
  creator?: string
  updateTime?: number
}

export interface ArtistItem {
  id: number
  name: string
  cover: string
  followers?: number
  description?: string
  albumSize?: number
  musicSize?: number
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
  updateFrequency?: string
}

export interface CategoryItem {
  name: string
  hot: boolean
  category?: number
}

export const useDiscoverStore = defineStore('discover', () => {
  // 状态
  const hotPlaylists = ref<PlaylistItem[]>([])
  const recommendedArtists = ref<ArtistItem[]>([])
  const topRankings = ref<RankingItem[]>([])
  const playlistCategories = ref<CategoryItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 分页状态
  const playlistOffset = ref(0)
  const playlistHasMore = ref(true)
  const currentCategory = ref('全部')
  const isHighQuality = ref(false)

  // 方法
  const loadDiscoverData = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      // 并行加载所有数据
      await Promise.all([
        loadRecommendPlaylists(),
        loadRecommendArtists(),
        loadTopRankings(),
        loadPlaylistCategories()
      ])
    } catch (err) {
      console.error('加载发现页数据失败:', err)
      error.value = err instanceof Error ? err.message : '数据加载失败'
    } finally {
      loading.value = false
    }
  }

  // 加载推荐歌单
  const loadRecommendPlaylists = async () => {
    try {
      const response = await recommendApi.getRecommendPlaylists(8)
      if (response?.result && Array.isArray(response.result)) {
        hotPlaylists.value = response.result.map(formatPlaylist)
      } else {
        console.warn('推荐歌单API响应格式异常:', response)
        hotPlaylists.value = []
      }
    } catch (err) {
      console.error('加载推荐歌单失败:', err)
      hotPlaylists.value = []
      throw err
    }
  }

  // 加载推荐歌手
  const loadRecommendArtists = async () => {
    try {
      const response = await recommendApi.getHotArtists(50)
      if (response?.artists && Array.isArray(response.artists)) {
        recommendedArtists.value = response.artists.slice(0, 6).map(formatArtist)
      } else {
        console.warn('热门歌手API响应格式异常:', response)
        recommendedArtists.value = []
      }
    } catch (err) {
      console.error('加载推荐歌手失败:', err)
      recommendedArtists.value = []
      throw err
    }
  }

  // 加载排行榜
  const loadTopRankings = async () => {
    try {
      const response = await toplistApi.getTopPlaylists()
      if (response?.list && Array.isArray(response.list)) {
        // 获取官方榜单（有ToplistType字段的）
        const officialLists = response.list.filter((item: any) => item.ToplistType !== undefined)
        topRankings.value = officialLists.slice(0, 3).map(formatRanking)
      } else {
        console.warn('排行榜API响应格式异常:', response)
        topRankings.value = []
      }
    } catch (err) {
      console.error('加载排行榜失败:', err)
      topRankings.value = []
      throw err
    }
  }

  // 加载歌单分类 - 由于API不可用，暂时跳过
  const loadPlaylistCategories = async () => {
    try {
      // 歌单分类API暂时不可用，使用基础分类
      playlistCategories.value = [
        { name: '华语', hot: true, category: 1 },
        { name: '流行', hot: true, category: 2 },
        { name: '摇滚', hot: false, category: 3 },
        { name: '民谣', hot: true, category: 4 },
        { name: '电子', hot: false, category: 5 },
        { name: '说唱', hot: true, category: 6 }
      ]
    } catch (err) {
      console.error('加载歌单分类失败:', err)
      playlistCategories.value = []
    }
  }

  // 格式化函数
  const formatPlaylist = (item: any): PlaylistItem => ({
    id: item.id,
    name: item.name,
    cover: item.picUrl || item.coverImgUrl || '/images/album.jpg',
    description: item.copywriter || item.description || '',
    playCount: item.playCount || item.playcount || 0,
    creator: item.creator?.nickname || '',
    updateTime: item.updateTime
  })

  const formatArtist = (item: any): ArtistItem => ({
    id: item.id,
    name: item.name,
    cover: item.picUrl || item.img1v1Url || '/images/artist.jpg',
    followers: item.fansCount || item.followeds || 0,
    description: item.briefDesc || '',
    albumSize: item.albumSize || 0,
    musicSize: item.musicSize || 0
  })

  const formatRanking = (item: any): RankingItem => ({
    id: item.id,
    name: item.name,
    cover: item.coverImgUrl || '/images/ranking.jpg',
    updateFrequency: item.updateFrequency,
    topSongs: item.tracks?.slice(0, 3).map((track: any, index: number) => ({
      id: index + 1, // 使用索引作为ID
      name: track.first || '', // 歌曲名在first字段
      artist: track.second || '' // 歌手名在second字段
    })) || []
  })

  const formatCategory = (item: any): CategoryItem => ({
    name: item.name,
    hot: item.hot || false,
    category: item.category
  })

  // 备用数据
  const getMockPlaylists = (): PlaylistItem[] => [
    {
      id: 1,
      name: '华语流行精选',
      cover: 'https://p1.music.126.net/jWE3OEZUlwdz0ARvyQ9wWw==/109951165474121408.jpg',
      description: '最新最热的华语流行歌曲',
      playCount: 125000,
      creator: '音乐推荐官'
    },
    {
      id: 2,
      name: '欧美金曲榜',
      cover: 'https://p1.music.126.net/Wz1rOVbOGEE-kQNOkKvGhQ==/109951165474121409.jpg',
      description: '经典欧美流行音乐合集',
      playCount: 89000,
      creator: '海外音乐'
    },
    {
      id: 3,
      name: '日韩热门',
      cover: 'https://p1.music.126.net/tGTHU4ynYOB2ZPQfbkTZKA==/109951165474121410.jpg',
      description: 'J-POP和K-POP热门单曲',
      playCount: 156000,
      creator: '亚洲音乐'
    },
    {
      id: 4,
      name: '民谣时光',
      cover: 'https://p1.music.126.net/M19SOoRMkcHmJvmGflXjXQ==/109951165474121411.jpg',
      description: '温暖治愈的民谣歌曲',
      playCount: 67000,
      creator: '民谣诗人'
    }
  ]

  const getMockArtists = (): ArtistItem[] => [
    {
      id: 1,
      name: '周杰伦',
      cover: 'https://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951165359439341.jpg',
      followers: 2580000,
      description: '华语流行天王',
      albumSize: 15,
      musicSize: 200
    },
    {
      id: 2,
      name: '陈奕迅',
      cover: 'https://p1.music.126.net/WhTKllBwJLTpATrN2cyOCA==/109951165359439342.jpg',
      followers: 1890000,
      description: '香港歌手',
      albumSize: 20,
      musicSize: 300
    },
    {
      id: 3,
      name: '邓紫棋',
      cover: 'https://p1.music.126.net/y19E5SadGUmSR8SfiZ1hWw==/109951165359439343.jpg',
      followers: 1650000,
      description: '实力女歌手',
      albumSize: 8,
      musicSize: 120
    },
    {
      id: 4,
      name: '林俊杰',
      cover: 'https://p1.music.126.net/Ysn1RkVkDbGn_ft9C8p_EA==/109951165359439344.jpg',
      followers: 1420000,
      description: '创作才子',
      albumSize: 12,
      musicSize: 180
    },
    {
      id: 5,
      name: '薛之谦',
      cover: 'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/109951165359439345.jpg',
      followers: 1230000,
      description: '情歌王子',
      albumSize: 10,
      musicSize: 150
    },
    {
      id: 6,
      name: '毛不易',
      cover: 'https://p1.music.126.net/H2fFVqvlxKZpNwjciecMlA==/109951165359439346.jpg',
      followers: 980000,
      description: '民谣歌手',
      albumSize: 5,
      musicSize: 80
    }
  ]

  const getMockRankings = (): RankingItem[] => [
    {
      id: 19723756,
      name: '飙升榜',
      cover: 'https://p1.music.126.net/N2HO5xfYEqyQ8q6oxCw8IQ==/109951165474121412.jpg',
      updateFrequency: '每日更新',
      topSongs: [
        { id: 1001, name: '孤勇者', artist: '陈奕迅' },
        { id: 1002, name: '夜曲', artist: '周杰伦' },
        { id: 1003, name: '漠河舞厅', artist: '柳爽' }
      ]
    },
    {
      id: 3778678,
      name: '热歌榜',
      cover: 'https://p1.music.126.net/GhhuF6Ep5Tpd9nG6EM1Rnw==/109951165474121413.jpg',
      updateFrequency: '每日更新',
      topSongs: [
        { id: 1004, name: '稻香', artist: '周杰伦' },
        { id: 1005, name: '十年', artist: '陈奕迅' },
        { id: 1006, name: '光年之外', artist: '邓紫棋' }
      ]
    },
    {
      id: 2884035,
      name: '新歌榜',
      cover: 'https://p1.music.126.net/sFzb3TxfbpaouP0jJiOJSw==/109951165474121414.jpg',
      updateFrequency: '每日更新',
      topSongs: [
        { id: 1007, name: '最伟大的作品', artist: '周杰伦' },
        { id: 1008, name: '还是会想你', artist: '林达浪' },
        { id: 1009, name: '如果声音不记得', artist: '吴青峰' }
      ]
    }
  ]

  const getMockCategories = (): CategoryItem[] => [
    { name: '华语', hot: true, category: 1 },
    { name: '流行', hot: true, category: 2 },
    { name: '摇滚', hot: false, category: 3 },
    { name: '民谣', hot: true, category: 4 },
    { name: '电子', hot: false, category: 5 },
    { name: '说唱', hot: true, category: 6 },
    { name: '轻音乐', hot: false, category: 7 },
    { name: '爵士', hot: false, category: 8 },
    { name: '乡村', hot: false, category: 9 },
    { name: '蓝调', hot: false, category: 10 }
  ]

  // 加载分类歌单
  const loadCategoryPlaylists = async (cat: string = '全部', reset: boolean = true) => {
    if (reset) {
      playlistOffset.value = 0
      hotPlaylists.value = []
    }

    loading.value = true
    try {
      const response = await playlistApi.getCategoryPlaylists(cat, 20, playlistOffset.value)

      if (response?.playlists && Array.isArray(response.playlists)) {
        const newPlaylists = response.playlists.map(formatPlaylist)

        if (reset) {
          hotPlaylists.value = newPlaylists
        } else {
          hotPlaylists.value = [...hotPlaylists.value, ...newPlaylists]
        }

        playlistHasMore.value = response.more || false
        currentCategory.value = cat
      } else {
        console.warn('分类歌单API响应格式异常:', response)
        hotPlaylists.value = []
        playlistHasMore.value = false
      }
    } catch (err) {
      console.error('加载分类歌单失败:', err)
      hotPlaylists.value = []
      playlistHasMore.value = false
    } finally {
      loading.value = false
    }
  }

  // 加载更多歌单
  const loadMorePlaylists = async () => {
    if (!playlistHasMore.value || loading.value) return

    playlistOffset.value += 20
    await loadCategoryPlaylists(currentCategory.value, false)
  }

  // 切换精品歌单
  const toggleHighQuality = async (hq: boolean) => {
    isHighQuality.value = hq
    await loadCategoryPlaylists(currentCategory.value, true)
  }

  return {
    // 状态
    hotPlaylists,
    recommendedArtists,
    topRankings,
    playlistCategories,
    loading,
    error,
    playlistHasMore,
    currentCategory,
    isHighQuality,

    // 方法
    loadDiscoverData,
    loadCategoryPlaylists,
    loadMorePlaylists,
    toggleHighQuality
  }
})
