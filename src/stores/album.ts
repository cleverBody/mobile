import { defineStore } from 'pinia'
import { ref } from 'vue'
import { musicApi, formatSong } from '@/api/music'

export interface AlbumInfo {
  id: number
  name: string
  cover: string
  description?: string
  artist: string
  artistId: number
  publishTime: string
  company?: string
  songsCount: number
  playCount?: number
  isSubscribed?: boolean
}

export interface AlbumSong {
  id: number
  name: string
  artists: Array<{ id: number; name: string }>
  duration?: number
  track: number
  disc?: number
  mv?: number
  playCount?: number
}

export const useAlbumStore = defineStore('album', () => {
  const currentAlbum = ref<AlbumInfo | null>(null)
  const albumSongs = ref<AlbumSong[]>([])
  const loading = ref(false)

  const loadAlbum = async (id: number) => {
    if (loading.value) return

    loading.value = true
    try {
      // 获取专辑详情
      const albumResponse = await musicApi.getAlbumDetail(id)

      // 根据实际API响应结构解析数据
      const album = albumResponse.album || albumResponse.data?.album
      const songs = albumResponse.songs || albumResponse.data?.songs || []

      currentAlbum.value = {
        id: album.id,
        name: album.name,
        cover: album.picUrl || album.blurPicUrl,
        description: album.description,
        artist: album.artist?.name || album.artists?.[0]?.name || '未知艺人',
        artistId: album.artist?.id || album.artists?.[0]?.id || 0,
        publishTime: album.publishTime ? new Date(album.publishTime).toLocaleDateString() : '',
        company: album.company,
        songsCount: album.size || songs.length || 0,
        playCount: album.playCount,
        isSubscribed: album.subType === 1
      }

      // 处理专辑歌曲
      if (songs && songs.length > 0) {
        albumSongs.value = songs.map((song: any, index: number) => ({
          id: song.id,
          name: song.name,
          artists: song.ar || song.artists || [],
          duration: Math.floor((song.dt || song.duration || 0) / 1000),
          track: song.no || index + 1,
          disc: song.cd || 1,
          mv: song.mv || undefined,
          playCount: song.playCount
        }))
      } else {
        albumSongs.value = []
      }


    } catch (error) {
      console.error('加载专辑信息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const subscribeAlbum = async (albumId: number) => {
    console.log('收藏专辑', albumId)
    if (currentAlbum.value && currentAlbum.value.id === albumId) {
      currentAlbum.value.isSubscribed = true
    }
  }

  const unsubscribeAlbum = async (albumId: number) => {
    console.log('取消收藏专辑', albumId)
    if (currentAlbum.value && currentAlbum.value.id === albumId) {
      currentAlbum.value.isSubscribed = false
    }
  }

  const playAlbum = async (albumId: number, startIndex: number = 0) => {
    console.log('播放专辑', albumId, '从第', startIndex + 1, '首开始')
  }

  const clearAlbum = () => {
    currentAlbum.value = null
    albumSongs.value = []
  }

  return {
    currentAlbum,
    albumSongs,
    loading,

    loadAlbum,
    subscribeAlbum,
    unsubscribeAlbum,
    playAlbum,
    clearAlbum
  }
})
