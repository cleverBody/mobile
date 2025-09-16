// 移动端数据格式化工具函数
// 与桌面端保持一致的数据处理逻辑

import type { Song, Artist, Album, Playlist } from '@/types/music'

// 格式化歌曲数据
export const formatSong = (item: any): Song => {
  if (!item) return {} as Song

  // 处理歌手数据
  const formatArtists = (artistData: any): Artist[] => {
    if (!artistData) return []
    if (typeof artistData === 'string') return [{ id: 0, name: artistData, avatar: '' }]

    const artists = Array.isArray(artistData) ? artistData : [artistData]
    return artists.map((ar: any) => ({
      id: ar?.id || 0,
      name: ar?.name || ar || '未知艺术家',
      avatar: ar?.img1v1Url || ar?.picUrl || ar?.avatar || ''
    }))
  }

  // 处理专辑数据
  const formatAlbum = (albumData: any) => {
    if (!albumData) return undefined
    if (typeof albumData === 'string') return { id: 0, name: albumData, cover: '' }

    return {
      id: albumData.id || 0,
      name: albumData.name || '未知专辑',
      cover: albumData.picUrl || albumData.cover || ''
    }
  }

  return {
    id: item.id || 0,
    name: item.name || '未知歌曲',
    artists: formatArtists(item.ar || item.artists || item.artist),
    album: formatAlbum(item.al || item.album),
    duration: Number(item.dt || item.duration || 0),
    cover: getCoverUrl(item),
    url: item.url,
    lyric: item.lyric
  }
}

// 格式化歌手数据
export const formatArtist = (item: any): Artist | null => {
  if (!item) return null

  return {
    id: item.id || 0,
    name: item.name || '未知艺术家',
    cover: getCoverUrl(item),
    description: item.description || item.briefDesc || '',
    followers: item.followeds || item.followers || 0,
    songsCount: item.musicSize || item.songsCount || 0,
    albumsCount: item.albumSize || item.albumsCount || 0,
    mvCount: item.mvSize || item.mvCount || 0,
    isFollowed: item.followed || false,
    alias: item.alias?.[0] || '',
    identify: item.identifyTag?.[0] || item.identify
  }
}

// 格式化专辑数据
export const formatAlbum = (item: any): Album | null => {
  if (!item) return null

  return {
    id: item.id || 0,
    name: item.name || '未知专辑',
    cover: getCoverUrl(item),
    publishTime: item.publishTime ? formatDate(item.publishTime) : '',
    songsCount: item.size || item.trackCount || 0,
    description: item.description || item.briefDesc || '',
    artist: formatArtist(item.artist || item.artists?.[0])
  }
}

// 格式化视频数据
export const formatVideo = (item: any): Video | null => {
  if (!item) return null

  return {
    id: item.id || 0,
    name: item.name || '未知视频',
    cover: item.imgurl || item.cover || item.picUrl || '',
    duration: item.duration || 0,
    playCount: item.playCount || 0,
    publishTime: item.publishTime ? formatDate(item.publishTime) : '',
    artists: formatArtists(item.artists || item.artist || [])
  }
}

// 格式化歌单数据
export const formatPlaylist = (item: any): Playlist => {
  if (!item) return {} as Playlist

  return {
    id: item.id || 0,
    name: item.name || '未知歌单',
    cover: getCoverUrl(item),
    description: item.description || item.copywriter || '',
    creator: {
      id: item.creator?.userId || item.creator?.id || 0,
      name: item.creator?.nickname || item.creator?.name || '未知用户',
      avatar: item.creator?.avatarUrl || ''
    },
    tracks: item.tracks ? item.tracks.map(formatSong) : [],
    playCount: item.playCount || 0,
    trackCount: item.trackCount || item.size || 0,
    createTime: item.createTime || 0,
    updateTime: item.updateTime || 0
  }
}

// 格式化歌手数组
export const formatArtists = (data: any): Artist[] => {
  if (!data) return []
  const artists = Array.isArray(data) ? data : [data]
  return artists.map(formatArtist).filter(Boolean)
}

// 获取封面URL
export const getCoverUrl = (item: any): string => {
  const cover =
    item.cover ||
    item.picUrl ||
    item.coverUrl ||
    item.coverImgUrl ||
    item.imgurl ||
    item.img1v1Url ||
    (item.album || item.al)?.picUrl ||
    ''

  return cover ? cover.replace(/^http:/, 'https:') : ''
}

// 获取不同尺寸的封面URL
export const getCoverSizeUrl = (url: string, size: number = 300): string => {
  if (!url) return ''

  try {
    const sizeParam = `?param=${size}y${size}`
    const httpsUrl = url.replace(/^http:/, 'https:')

    if (httpsUrl.includes('?')) {
      return httpsUrl.replace(/\?.*/, sizeParam)
    }

    return httpsUrl + sizeParam
  } catch (error) {
    console.error('封面URL处理错误:', error)
    return url
  }
}

// 格式化时间戳为日期
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化数字（播放量等）
export const formatNumber = (num: number): string => {
  if (!num || num < 0) return '0'

  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 格式化时长（毫秒转分秒）
export const formatDuration = (duration: number): string => {
  if (!duration || duration < 0) return '00:00'

  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes < 0) return '0 B'

  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  } else {
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  }
}
