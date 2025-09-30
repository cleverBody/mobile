import axios from 'axios'
import type { Song, Playlist, Album, Artist } from '@/stores/music'
import { multiSourceMusicService } from './multiSourceMusic'

// 获取API基础URL
const getBaseURL = () => {
  // 修复环境检测逻辑
  const isAPK = window.location.protocol === 'capacitor:' ||
                window.location.protocol === 'file:' ||
                (typeof window !== 'undefined' && (window as any).Capacitor && !import.meta.env.DEV)

  // APK环境直接使用远程服务器
  if (isAPK) {
    console.log('🔍 music.ts: 检测到APK环境，使用远程服务器')
    console.log('🔍 protocol:', window.location.protocol, 'DEV:', import.meta.env.DEV, 'Capacitor:', !!(window as any).Capacitor)
    return 'https://netease-proxy-server.onrender.com/api'
  }

  // 浏览器开发环境使用代理
  console.log('🔍 music.ts: 检测到浏览器环境，使用代理')
  return 'https://netease-proxy-server.onrender.com/api'
}

// API基础配置
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // 增加超时时间到15秒，因为解锁可能需要更长时间
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加时间戳防止缓存
    if (config.params) {
      config.params.timestamp = Date.now()
    } else {
      config.params = { timestamp: Date.now() }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 网易云音乐API返回格式: {success: true, data: {...}}
    if (response.data.success && response.data.data) {
      // 直接返回整个data对象，保持原有的数据结构
      return response.data.data
    }
    // 如果没有success字段，直接返回data（某些接口可能不同）
    return response.data
  },
  (error) => {
    console.error('API请求失败:', error)
    throw error
  }
)

// 音乐相关API
export const musicApi = {
  // 获取歌曲详情
  getSongDetail(ids: number[]): Promise<{ songs: Song[] }> {
    return api.get('/song_detail', {
      params: { ids: ids.join(',') }
    })
  },

  // 获取歌曲播放链接
  getSongUrl(id: number, level = 'exhigh'): Promise<{ data: { id: number, url: string, level: string } }> {
    // 直接使用新的API地址
    return axios.get('https://wyy.331106.xyz/song', {
      params: { id, level, type: 'url' }
    })
  },

  // 多源获取歌曲播放链接（新增）
  async getMultiSourceSongUrl(song: Song | any): Promise<{ url: string; source: string } | null> {
    const startTime = Date.now()
    console.log('🔄 [多源API] 尝试获取播放链接:', song.name)

    // 首先尝试原有的网易云API
    if (song.id && typeof song.id === 'number') {
      try {
        const apiStartTime = Date.now()
        console.log('🔍 [网易云API] 开始获取播放链接，歌曲ID:', song.id)
        const response = await this.getSongUrl(song.id)
        const apiEndTime = Date.now()
        console.log(`🔍 [网易云API] 响应数据 (耗时: ${apiEndTime - apiStartTime}ms):`, response.data)
        // 新API返回格式：{ data: { data: { url: "...", id: ... } } }
        const url = response.data?.data?.url || response.data?.url

        if (url) {
          const totalTime = Date.now() - startTime
          console.log(`✅ [网易云API] 获取播放链接成功 (总耗时: ${totalTime}ms):`, url)
          return { url, source: '网易云音乐' }
        } else {
          console.warn('⚠️ [网易云API] 响应中没有URL字段')
        }
      } catch (error) {
        console.warn('⚠️ [网易云API] 获取播放链接失败:', error)
      }
    }

    // 如果网易云API失败，使用多源服务
    console.log('🔄 [多源API] 网易云API失败，尝试多源获取')
    return await multiSourceMusicService.getPlayableUrl(song)
  },

  // 获取歌词
  getLyric(id: number): Promise<{ lrc?: { lyric: string }, tlyric?: { lyric: string } }> {
    return api.get('/lyric', {
      params: { id }
    })
  },

  // 多源获取歌词（新增）
  async getMultiSourceLyric(song: Song | any): Promise<string | null> {
    // 首先尝试原有的网易云API
    if (song.id && typeof song.id === 'number') {
      try {
        const response = await this.getLyric(song.id)
        const lyric = response.lrc?.lyric || response.tlyric?.lyric

        if (lyric) {
          console.log('✅ [网易云API] 获取歌词成功')
          return lyric
        }
      } catch (error) {
        console.warn('⚠️ [网易云API] 获取歌词失败:', error)
      }
    }

    // 如果网易云API失败，尝试多源服务
    console.log('🔄 [多源API] 网易云API失败，尝试多源获取歌词')

    // 使用GD Studio服务获取歌词
    const gdStudioSources = multiSourceMusicService['sources'] // 访问私有属性
    for (const source of gdStudioSources) {
      if (source.getLyric) {
        try {
          const lyric = await source.getLyric(song)
          if (lyric) {
            console.log(`✅ [${source.name}] 获取歌词成功`)
            return lyric
          }
        } catch (error) {
          console.warn(`⚠️ [${source.name}] 获取歌词失败:`, error)
        }
      }
    }

    return null
  },

  // 搜索歌曲
  searchSongs(keywords: string, limit = 30, offset = 0): Promise<{ result: { songs: Song[] } }> {
    return api.get('/search', {
      params: { keywords, type: 1, limit, offset }
    })
  },

  // 多源搜索歌曲（新增）
  async searchSongsMultiSource(keywords: string, limit = 30): Promise<Song[]> {
    console.log('🔍 [多源搜索] 开始搜索:', keywords)

    const results: Song[] = []

    // 首先尝试网易云搜索
    try {
      console.log('🔍 [网易云API] 开始搜索')
      const response = await this.searchSongs(keywords, Math.ceil(limit / 2))
      if (response.result?.songs) {
        const neteaseSongs = response.result.songs.map(formatSong)
        results.push(...neteaseSongs)
        console.log(`✅ [网易云API] 搜索成功，返回 ${neteaseSongs.length} 首歌曲`)
      }
    } catch (error) {
      console.warn('⚠️ [网易云API] 搜索失败:', error)
    }

    // 然后使用多源搜索补充结果
    try {
      console.log('🔍 [多源搜索] 开始补充搜索')
      const multiSourceResults = await multiSourceMusicService.searchWithFallback(keywords, Math.ceil(limit / 2))
      results.push(...multiSourceResults)
      console.log(`✅ [多源搜索] 补充搜索成功，返回 ${multiSourceResults.length} 首歌曲`)
    } catch (error) {
      console.warn('⚠️ [多源搜索] 补充搜索失败:', error)
    }

    // 去重并限制数量
    const uniqueResults = this.deduplicateSearchResults(results)
    console.log(`✅ [多源搜索] 搜索完成，去重后返回 ${uniqueResults.length} 首歌曲`)

    return uniqueResults.slice(0, limit)
  },

  // 搜索结果去重
  deduplicateSearchResults(songs: Song[]): Song[] {
    const seen = new Set<string>()
    return songs.filter(song => {
      const key = `${song.name}-${song.artists?.[0]?.name || ''}`
        .toLowerCase()
        .replace(/\s+/g, '')

      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  },

  // 获取推荐歌单
  getPersonalizedPlaylists(limit = 10): Promise<{ result: Playlist[] }> {
    return api.get('/personalized', {
      params: { limit }
    })
  },

  // 获取歌单详情
  getPlaylistDetail(id: number): Promise<{ playlist: Playlist }> {
    return api.get('/playlist_detail', {
      params: { id }
    })
  },

  // 获取歌单所有歌曲
  getPlaylistTracks(id: number, limit = 100, offset = 0): Promise<{ songs: Song[] }> {
    return api.get('/playlist_track_all', {
      params: { id, limit, offset }
    })
  },

  // 获取热门歌手
  getTopArtists(limit = 50, offset = 0): Promise<{ artists: Artist[] }> {
    return api.get('/top/artists', {
      params: { limit, offset }
    })
  },

  // 获取歌手详情
  getArtistDetail(id: number): Promise<{ artist: Artist }> {
    return api.get('/artist_detail', {
      params: { id }
    })
  },

  // 获取歌手热门歌曲
  getArtistTopSongs(id: number): Promise<{ hotSongs: Song[] }> {
    return api.get('/artist_top_song', {
      params: { id }
    })
  },

  // 获取歌手全部歌曲
  getArtistAllSongs(id: number, limit = 100, offset = 0): Promise<{ songs: Song[], more: boolean }> {
    return api.get('/artist_songs', {
      params: { id, limit, offset }
    })
  },

  // 获取歌手专辑
  getArtistAlbums(id: number, limit = 50, offset = 0): Promise<{ hotAlbums: Album[], more: boolean }> {
    return api.get('/artist_album', {
      params: { id, limit, offset }
    })
  },

  // 获取歌手视频
  getArtistVideos(id: number, limit = 50, offset = 0): Promise<{ mvs: any[], more: boolean }> {
    return api.get('/artist_mv', {
      params: { id, limit, offset }
    })
  },

  // 获取专辑详情
  getAlbumDetail(id: number): Promise<{ album: Album, songs: Song[] }> {
    return api.get('/album', {
      params: { id }
    })
  },

  // 获取新碟上架
  getNewAlbums(limit = 10, offset = 0): Promise<{ albums: Album[] }> {
    return api.get('/album_new', {
      params: { limit, offset }
    })
  },

  // 获取每日推荐歌曲 (需要登录)
  getDailyRecommendSongs(): Promise<{ data: { dailySongs: Song[] } }> {
    return api.get('/recommend_songs')
  },

  // 获取热搜榜
  getHotSearch(): Promise<{ data: Array<{ searchWord: string, score: number, content: string, iconUrl?: string, iconType?: number }> }> {
    return api.get('/search_hot_detail')
  },

  // 获取搜索建议
  getSearchSuggest(keywords: string): Promise<{ result: { songs?: Song[], artists?: Artist[], albums?: Album[], playlists?: Playlist[] } }> {
    return api.get('/search_suggest', {
      params: { keywords }
    })
  },

  // 解锁歌曲 - 网易云
  unlockNeteaseUrl(id: number): Promise<{ code: number, url: string | null }> {
    return api.get('/unblock/netease', {
      params: { id }
    })
  },

  // 解锁歌曲 - 酷我
  unlockKuwoUrl(keyword: string): Promise<{ code: number, url: string | null }> {
    return api.get('/unblock/kuwo', {
      params: { keyword }
    })
  },
}

// 工具函数：格式化歌曲数据
export const formatSong = (song: any): Song => {
  return {
    id: song.id,
    name: song.name,
    artists: song.ar || song.artists || [],
    album: song.al || song.album,
    duration: song.dt || song.duration || 0,
    cover: song.al?.picUrl || song.album?.picUrl || song.cover,
    url: song.url || undefined,
    lyric: song.lyric || undefined
  }
}

// 工具函数：格式化歌单数据
export const formatPlaylist = (playlist: any): Playlist => {
  return {
    id: playlist.id,
    name: playlist.name,
    cover: playlist.picUrl || playlist.coverImgUrl,
    description: playlist.description || playlist.copywriter,
    creator: playlist.creator,
    tracks: playlist.tracks ? playlist.tracks.map(formatSong) : [],
    playCount: playlist.playCount
  }
}

// 工具函数：格式化歌手数据
export const formatArtist = (artist: any): Artist => {
  return {
    id: artist.id,
    name: artist.name,
    avatar: artist.picUrl || artist.img1v1Url
  }
}

// 工具函数：格式化专辑数据
export const formatAlbum = (album: any): Album => {
  return {
    id: album.id,
    name: album.name,
    cover: album.picUrl || album.blurPicUrl,
    artist: album.artist || album.artists?.[0]
  }
}
