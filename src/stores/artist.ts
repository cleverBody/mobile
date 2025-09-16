import { defineStore } from 'pinia'
import { ref } from 'vue'
import { musicApi } from '@/api/music'
import { formatArtist, formatSong, formatAlbum, formatVideo } from '@/utils/format'
import type { Artist, Song, Album, Video } from '@/types/music'

// 使用统一的类型定义
export type ArtistInfo = Artist
export type ArtistSong = Song
export type ArtistAlbum = Album
export type ArtistVideo = Video

export const useArtistStore = defineStore('artist', () => {
  const currentArtist = ref<Artist | null>(null)
  const artistSongs = ref<Song[]>([])
  const artistAlbums = ref<Album[]>([])
  const artistVideos = ref<Video[]>([])
  const similarArtists = ref<Artist[]>([])
  const loading = ref(false)

  const loadArtist = async (id: number) => {
    if (loading.value) return

    loading.value = true
    try {
      // 获取歌手详情
      const artistRes = await musicApi.getArtistDetail(id)

      // 处理响应数据结构
      const artist = artistRes.data?.artist || artistRes.artist || artistRes

      // 使用统一的格式化函数
      currentArtist.value = formatArtist(artist)

      // 获取歌手热门歌曲
      const songsRes = await musicApi.getArtistTopSongs(id)

      // 处理歌曲数据结构
      const songs = songsRes.songs || songsRes.hotSongs || []
      artistSongs.value = songs.map(formatSong)

      console.log('歌手信息加载完成:', currentArtist.value.name)
      console.log('歌曲数据:', songsRes)
      console.log('处理后的歌曲:', artistSongs.value)
    } catch (error) {
      console.error('加载歌手信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadArtistAlbums = async (id: number) => {
    try {
      const albumsRes = await musicApi.getArtistAlbums(id)
      const albums = albumsRes.hotAlbums || albumsRes.albums || []
      artistAlbums.value = albums.map(formatAlbum).filter(Boolean)
    } catch (error) {
      console.error('加载歌手专辑失败:', error)
    }
  }

  const loadArtistVideos = async (id: number) => {
    try {
      const videosRes = await musicApi.getArtistVideos(id)
      const videos = videosRes.mvs || videosRes.videos || []
      artistVideos.value = videos.map(formatVideo).filter(Boolean)
    } catch (error) {
      console.error('加载歌手视频失败:', error)
    }
  }

  const followArtist = async (id: number) => {
    // TODO: 实现关注歌手
    console.log('关注歌手:', id)
  }

  const unfollowArtist = async (id: number) => {
    // TODO: 实现取消关注歌手
    console.log('取消关注歌手:', id)
  }

  const clearArtist = () => {
    currentArtist.value = null
    artistSongs.value = []
    artistAlbums.value = []
    artistVideos.value = []
    similarArtists.value = []
  }

  return {
    // 状态
    currentArtist,
    artistSongs,
    artistAlbums,
    artistVideos,
    similarArtists,
    loading,

    // 方法
    loadArtist,
    loadArtistAlbums,
    loadArtistVideos,
    followArtist,
    unfollowArtist,
    clearArtist
  }
})
