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
  const loadingMore = ref(false)
  const hasMoreSongs = ref(true)
  const songsOffset = ref(0)

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

      // 重置分页状态
      songsOffset.value = 0
      hasMoreSongs.value = true
      artistSongs.value = []

      // 获取歌手全部歌曲（第一页）
      await loadArtistSongs(id, true)

      console.log('歌手信息加载完成:', currentArtist.value.name)
    } catch (error) {
      console.error('加载歌手信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadArtistSongs = async (id: number, reset: boolean = false) => {
    if (loadingMore.value || (!hasMoreSongs.value && !reset)) return

    if (reset) {
      songsOffset.value = 0
      hasMoreSongs.value = true
      loadingMore.value = false
    } else {
      loadingMore.value = true
    }

    try {
      // 直接使用 getArtistAllSongs API 进行分页请求
      const songsRes = await musicApi.getArtistAllSongs(id, 50, songsOffset.value)

      // 处理歌曲数据结构
      const songs = songsRes.songs || []
      const newSongs = songs.map(formatSong)

      if (reset) {
        artistSongs.value = newSongs
      } else {
        artistSongs.value = [...artistSongs.value, ...newSongs]
      }

      // 更新分页状态
      songsOffset.value += 50
      hasMoreSongs.value = songsRes.more !== false && songs.length === 50

      console.log(`加载歌曲完成，当前总数: ${artistSongs.value.length}，本次加载: ${songs.length}，还有更多: ${hasMoreSongs.value}`)
    } catch (error) {
      console.error('加载歌手歌曲失败:', error)
      // 如果 getArtistAllSongs 失败，回退到热门歌曲
      if (reset) {
        try {
          const songsRes = await musicApi.getArtistTopSongs(id)
          const songs = songsRes.songs || songsRes.hotSongs || []
          artistSongs.value = songs.map(formatSong)
          hasMoreSongs.value = false // 热门歌曲没有更多页
        } catch (fallbackError) {
          console.error('回退到热门歌曲也失败:', fallbackError)
        }
      }
    } finally {
      loadingMore.value = false
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
    songsOffset.value = 0
    hasMoreSongs.value = true
  }

  return {
    // 状态
    currentArtist,
    artistSongs,
    artistAlbums,
    artistVideos,
    similarArtists,
    loading,
    loadingMore,
    hasMoreSongs,

    // 方法
    loadArtist,
    loadArtistSongs,
    loadArtistAlbums,
    loadArtistVideos,
    followArtist,
    unfollowArtist,
    clearArtist
  }
})
