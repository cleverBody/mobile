// 移动端音乐相关类型定义
// 与桌面端保持一致

export interface Artist {
  id: number
  name: string
  avatar: string
  alias?: string
  description?: string
  followers?: number
  songsCount?: number
  albumsCount?: number
  mvCount?: number
  isFollowed?: boolean
  identify?: string
}

export interface Album {
  id: number
  name: string
  cover: string
  artist?: Artist
  publishTime?: string
  songsCount?: number
  description?: string
}

export interface Song {
  id: number | string
  name: string
  artists: Artist[]
  album?: Album
  duration: number
  cover?: string
  url?: string
  lyric?: string
  alia?: string
  mv?: number
  free?: number
  playCount?: number
  createTime?: number
  updateTime?: number
  // 本地文件相关字段
  type?: 'online' | 'local'
  filePath?: string
}

export interface Video {
  id: number
  name: string
  cover: string
  duration: number
  playCount: number
  publishTime: string
  artists: Artist[]
}

export interface Playlist {
  id: number
  name: string
  cover: string
  description?: string
  creator: {
    id: number
    name: string
    avatar: string
  }
  tracks: Song[]
  playCount?: number
  trackCount?: number
  createTime?: number
  updateTime?: number
}

export interface User {
  id: number
  name: string
  avatar: string
  signature?: string
  level?: number
  vipType?: number
}

export interface Comment {
  id: number
  content: string
  user: User
  time: number
  likedCount: number
  liked: boolean
  beReplied?: {
    content: string
    user: User
  }
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  code?: number
  message?: string
  timestamp?: string
}

// 搜索结果类型
export interface SearchResult {
  songs?: Song[]
  artists?: Artist[]
  albums?: Album[]
  playlists?: Playlist[]
}

// 歌词类型
export interface Lyric {
  time: number
  text: string
  translation?: string
}

// 播放质量类型
export type PlayQuality = 'standard' | 'higher' | 'exhigh' | 'lossless' | 'hires'

// 播放模式类型
export type PlayMode = 'order' | 'random' | 'single' | 'repeat'

// 音乐状态类型
export interface MusicState {
  currentSong: Song | null
  playlist: Song[]
  currentIndex: number
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  volume: number
  playMode: PlayMode
  quality: PlayQuality
}

// 用户状态类型
export interface UserState {
  isLoggedIn: boolean
  userInfo: User | null
  token: string | null
  likedSongs: number[]
  likedPlaylists: number[]
  likedArtists: number[]
  likedAlbums: number[]
}

// 设置状态类型
export interface SettingsState {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  playQuality: PlayQuality
  downloadQuality: PlayQuality
  autoPlay: boolean
  showLyrics: boolean
  enableCache: boolean
  cacheSize: number
}
