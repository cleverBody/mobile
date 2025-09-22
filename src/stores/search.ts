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
      console.log('🔍 [搜索Store] 开始多源搜索:', query)
      
      // 使用多源搜索API
      const songs = await musicApi.searchSongsMultiSource(query, 30)
      
      console.log(`✅ [搜索Store] 多源搜索完成，返回 ${songs.length} 首歌曲`)
      
      // 处理歌曲结果 - 转换为搜索结果格式
      const formattedSongs = songs.map((song: any) => ({
        id: song.id,
        name: song.name,
        artists: song.artists || [],
        album: song.album,
        cover: song.cover || '',
        duration: Math.floor((song.duration || 0) / 1000),
        // 保留多源数据
        source: song.source,
        url_id: song.url_id,
        lyric_id: song.lyric_id,
        pic_id: song.pic_id
      }))

      // 同时尝试获取其他类型的搜索结果（使用原有API作为补充）
      let artists: any[] = []
      let albums: any[] = []
      let playlists: any[] = []
      
      try {
        console.log('🔍 [搜索Store] 补充搜索其他类型内容')
        const supplementData = await musicApi.getSearchSuggest(query)
        
        if (supplementData.result) {
          const result = supplementData.result
          
          // 处理歌手结果
          artists = (result.artists || []).map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            cover: artist.picUrl || artist.img1v1Url || '',
            followers: artist.fansCount || 0
          }))

          // 处理专辑结果
          albums = (result.albums || []).map((album: any) => ({
            id: album.id,
            name: album.name,
            cover: album.picUrl || '',
            artist: album.artist?.name || '',
            releaseDate: album.publishTime ? new Date(album.publishTime).toLocaleDateString() : ''
          }))

          // 处理歌单结果
          playlists = (result.playlists || []).map((playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            cover: playlist.coverImgUrl || '',
            description: playlist.description || '',
            trackCount: playlist.trackCount || 0,
            creator: playlist.creator?.nickname || ''
          }))
        }
      } catch (supplementError) {
        console.warn('⚠️ [搜索Store] 补充搜索失败:', supplementError)
      }

      results.value = {
        songs: formattedSongs,
        artists,
        albums,
        playlists
      }
      
      console.log(`✅ [搜索Store] 搜索结果汇总: 歌曲${formattedSongs.length}首, 歌手${artists.length}位, 专辑${albums.length}张, 歌单${playlists.length}个`)
      
    } catch (error) {
      console.error('❌ [搜索Store] 搜索失败:', error)
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
