import { defineStore } from 'pinia'
import { ref } from 'vue'
import { musicApi } from '@/api/music'

export interface SearchResults {
  songs: Array<{
    id: number
    name: string
    artists: Array<{ id: number; name: string }>
    album?: { id: number; name: string }
    cover?: string
    duration?: number
  }>
  artists: Array<{
    id: number
    name: string
    cover: string
    followers?: number
  }>
  albums: Array<{
    id: number
    name: string
    cover: string
    artist: string
    releaseDate?: string
  }>
  playlists: Array<{
    id: number
    name: string
    cover: string
    description?: string
    trackCount?: number
    creator?: string
  }>
}

export const useSearchStore = defineStore('search', () => {
  // 状态
  const suggestions = ref<string[]>([])
  const history = ref<string[]>([])
  const results = ref<SearchResults>({
    songs: [],
    artists: [],
    albums: [],
    playlists: []
  })
  const loading = ref(false)

  // 方法
  const loadSuggestions = async () => {
    try {
      const data = await musicApi.getHotSearch()
      
      // 处理热搜API响应
      if (data.data && Array.isArray(data.data)) {
        suggestions.value = data.data.map((item: any) => item.searchWord).slice(0, 12)
      } else {
        // 备用热搜词
        suggestions.value = [
          '周杰伦', '陈奕迅', '邓紫棋', '林俊杰',
          '稻香', '十年', '孤勇者', '夜曲',
          '华语流行', '欧美金曲', '日韩音乐'
        ]
      }
    } catch (error) {
      console.error('加载热搜失败:', error)
      // 备用热搜词
      suggestions.value = [
        '周杰伦', '陈奕迅', '邓紫棋', '林俊杰',
        '稻香', '十年', '孤勇者', '夜曲',
        '华语流行', '欧美金曲', '日韩音乐'
      ]
    }
  }

  const search = async (query: string) => {
    if (loading.value) return

    loading.value = true
    try {
      // 调用搜索建议接口
      const data = await musicApi.getSearchSuggest(query)

      // 按照实际API响应结构处理数据
      if (data.result) {
        const result = data.result

        // 处理歌曲结果
        const songs = (result.songs || []).map((song: any) => ({
          id: song.id,
          name: song.name,
          artists: song.artists || [],
          album: song.album,
          cover: song.album?.picUrl || '',
          duration: Math.floor((song.duration || 0) / 1000)
        }))

        // 处理歌手结果
        const artists = (result.artists || []).map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          cover: artist.picUrl || artist.img1v1Url || '',
          followers: artist.fansCount || 0
        }))

        // 处理专辑结果
        const albums = (result.albums || []).map((album: any) => ({
          id: album.id,
          name: album.name,
          cover: album.picUrl || '',
          artist: album.artist?.name || '',
          releaseDate: album.publishTime ? new Date(album.publishTime).toLocaleDateString() : ''
        }))

        // 处理歌单结果
        const playlists = (result.playlists || []).map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          cover: playlist.coverImgUrl || '',
          description: playlist.description || '',
          trackCount: playlist.trackCount || 0,
          creator: playlist.creator?.nickname || ''
        }))

        results.value = {
          songs,
          artists,
          albums,
          playlists
        }
      } else {
        clearResults()
      }
    } catch (error) {
      console.error('搜索失败:', error)
      clearResults()
    } finally {
      loading.value = false
    }
  }


  const clearResults = () => {
    results.value = {
      songs: [],
      artists: [],
      albums: [],
      playlists: []
    }
  }

  const addToHistory = (query: string) => {
    // 移除已存在的相同搜索词
    const index = history.value.indexOf(query)
    if (index > -1) {
      history.value.splice(index, 1)
    }

    // 添加到历史记录开头
    history.value.unshift(query)

    // 限制历史记录数量
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20)
    }
  }

  const removeHistoryItem = (index: number) => {
    history.value.splice(index, 1)
  }

  const clearHistory = () => {
    history.value = []
  }

  return {
    // 状态
    suggestions,
    history,
    results,
    loading,

    // 方法
    loadSuggestions,
    search,
    clearResults,
    addToHistory,
    removeHistoryItem,
    clearHistory
  }
}, {
  persist: {
    paths: ['history']
  }
})
