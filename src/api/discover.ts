import { api } from './index'

// 歌单相关API
export const playlistApi = {
  // 获取歌单分类
  getPlaylistCatlist() {
    return api.get('/playlist/catlist')
  },

  // 获取精品歌单分类
  getHighQualityTags() {
    return api.get('/playlist/highquality/tags')
  },

  // 获取分类歌单
  getCategoryPlaylists(cat: string = '全部', limit: number = 50, offset: number = 0) {
    return api.get('/top/playlist', {
      params: { cat, limit, offset }
    })
  },

  // 获取精品歌单
  getHighQualityPlaylists(cat: string = '全部', limit: number = 50, before?: number) {
    return api.get('/top/playlist/highquality', {
      params: { cat, limit, ...(before && { before }) }
    })
  },

  // 获取歌单详情
  getPlaylistDetail(id: number) {
    return api.get('/playlist/detail', {
      params: { id, s: 0, noCookie: true }
    })
  },

  // 获取歌单所有歌曲
  getPlaylistTracks(id: number, limit: number = 50, offset: number = 0) {
    return api.get('/playlist/track/all', {
      params: { id, limit, offset }
    })
  }
}

// 排行榜相关API
export const toplistApi = {
  // 获取所有榜单（包含歌曲信息）
  getTopPlaylists() {
    return api.get('/toplist')
  }
}

// 歌手相关API
export const artistApi = {
  // 获取歌手分类列表
  getArtistList(
    type: number = -1,
    area: number = -1,
    initial: number | string = -1,
    offset: number = 0,
    limit: number = 50
  ) {
    return api.get('/artist_list', {
      params: { type, area, initial, offset, limit }
    })
  },

  // 获取歌手详情
  getArtistDetail(id: number) {
    return api.get('/artist/detail', {
      params: { id }
    })
  },

  // 获取歌手热门歌曲
  getArtistHotSongs(id: number) {
    return api.get('/artists', {
      params: { id }
    })
  },

  // 获取歌手全部歌曲
  getArtistAllSongs(
    id: number,
    limit: number = 50,
    offset: number = 0,
    order: 'hot' | 'time' = 'hot'
  ) {
    return api.get('/artist/songs', {
      params: { id, limit, offset, order }
    })
  },

  // 获取歌手专辑
  getArtistAlbums(id: number, limit: number = 50, offset: number = 0) {
    return api.get('/artist/album', {
      params: { id, limit, offset }
    })
  }
}

// 最新音乐相关API
export const newMusicApi = {
  // 获取新碟上架
  getNewAlbums(area: string = 'ALL', limit: number = 50, offset: number = 0) {
    return api.get('/album/new', {
      params: { area, limit, offset }
    })
  },

  // 获取新歌速递 - 参照桌面应用实现
  getNewSongs(type: number = 0) {
    return api.get('/top/song', {
      params: { type }
    })
  }
}

// 搜索相关API
export const searchApi = {
  // 搜索歌曲
  searchSongs(keywords: string, limit: number = 30, offset: number = 0) {
    return api.get('/search', {
      params: { keywords, type: 1, limit, offset }
    })
  },

  // 搜索歌单
  searchPlaylists(keywords: string, limit: number = 30, offset: number = 0) {
    return api.get('/search', {
      params: { keywords, type: 1000, limit, offset }
    })
  },

  // 搜索歌手
  searchArtists(keywords: string, limit: number = 30, offset: number = 0) {
    return api.get('/search', {
      params: { keywords, type: 100, limit, offset }
    })
  },

  // 搜索专辑
  searchAlbums(keywords: string, limit: number = 30, offset: number = 0) {
    return api.get('/search', {
      params: { keywords, type: 10, limit, offset }
    })
  },

  // 获取搜索建议
  getSearchSuggest(keywords: string) {
    return api.get('/search/suggest', {
      params: { keywords }
    })
  },

  // 获取热搜列表
  getHotSearch() {
    return api.get('/search/hot')
  }
}

// 推荐相关API - 参照桌面应用实现
export const recommendApi = {
  // 获取推荐歌单 - 对应桌面应用的 personalized
  getRecommendPlaylists(limit: number = 10) {
    return api.get('/personalized', {
      params: { limit }
    })
  },

  // 获取热门歌手 - 对应桌面应用的 topArtists
  getHotArtists(limit: number = 50) {
    return api.get('/top/artists', {
      params: { limit }
    })
  },

  // 获取推荐新音乐
  getRecommendNewSongs() {
    return api.get('/personalized/newsong')
  },

  // 获取推荐MV
  getRecommendMVs() {
    return api.get('/personalized/mv')
  },

  // 获取每日推荐歌单 - 需要登录
  getDailyPlaylists() {
    return api.get('/recommend/resource')
  },

  // 获取每日推荐歌曲 - 需要登录
  getDailySongs() {
    return api.get('/recommend/songs')
  }
}
