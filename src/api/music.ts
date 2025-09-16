import axios from 'axios'
import type { Song, Playlist, Album, Artist } from '@/stores/music'

// API基础配置
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
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
  getSongUrl(id: number, level = 'exhigh'): Promise<{ data: Array<{ id: number, url: string }> }> {
    return api.get('/song_url_v1', {
      params: { id, level }
    })
  },

  // 获取歌词
  getLyric(id: number): Promise<{ lrc?: { lyric: string }, tlyric?: { lyric: string } }> {
    return api.get('/lyric', {
      params: { id }
    })
  },

  // 搜索歌曲
  searchSongs(keywords: string, limit = 30, offset = 0): Promise<{ result: { songs: Song[] } }> {
    return api.get('/search', {
      params: { keywords, type: 1, limit, offset }
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
    return api.get('/top_artists', {
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
  getAlbumDetail(id: number): Promise<{ album: Album }> {
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
  getHotSearch(): Promise<{ data: Array<{ searchWord: string, score: number }> }> {
    return api.get('/search_hot')
  },

  // 获取搜索建议
  getSearchSuggest(keywords: string): Promise<{ result: { songs?: Song[], artists?: Artist[], albums?: Album[], playlists?: Playlist[] } }> {
    return api.get('/search_suggest', {
      params: { keywords }
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
