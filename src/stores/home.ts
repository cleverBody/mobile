import { defineStore } from 'pinia'
import { ref } from 'vue'
import { musicApi, formatPlaylist, formatArtist, formatAlbum } from '@/api/music'
import type { Playlist, Artist, Album } from '@/stores/music'

export const useHomeStore = defineStore('home', () => {
  // 状态
  const recommendedPlaylists = ref<Playlist[]>([])
  const popularArtists = ref<Artist[]>([])
  const newAlbums = ref<Album[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 网络连接测试
  const testNetworkConnection = async () => {
    try {
      console.log('🔍 开始网络连接测试...')
      const response = await fetch('https://netease-proxy-server.onrender.com/api')
      const data = await response.json()
      console.log('✅ 网络连接正常:', data)
      return true
    } catch (error) {
      console.error('❌ 网络连接失败:', error)
      return false
    }
  }

  // 加载首页数据
  const loadHomeData = async () => {
    loading.value = true
    error.value = null

    try {
      // 先测试网络连接
      const networkOk = await testNetworkConnection()
      if (!networkOk) {
        throw new Error('网络连接失败，请检查网络设置')
      }

      console.log('🚀 开始加载首页数据...')

      // 并行请求所有数据
      const [playlistsRes, artistsRes, albumsRes] = await Promise.all([
        musicApi.getPersonalizedPlaylists(4),  // 减少推荐歌单从6到4
        musicApi.getTopArtists(9),             // 调整热门歌手为9个
        musicApi.getNewAlbums(4)               // 保持新专辑4个
      ])

      console.log('📦 API响应数据:', { playlistsRes, artistsRes, albumsRes })

      // 格式化并设置数据
      recommendedPlaylists.value = playlistsRes.result.map(formatPlaylist)
      popularArtists.value = artistsRes.artists.map(formatArtist)
      newAlbums.value = albumsRes.albums.map(formatAlbum)

      console.log('✅ 首页数据加载完成:', {
        playlists: recommendedPlaylists.value.length,
        artists: popularArtists.value.length,
        albums: newAlbums.value.length
      })
    } catch (err) {
      console.error('❌ 加载首页数据失败:', err)
      error.value = err instanceof Error ? err.message : '数据加载失败'
    } finally {
      loading.value = false
    }
  }

  // 重新加载数据
  const refresh = async () => {
    await loadHomeData()
  }

  return {
    // 状态
    recommendedPlaylists,
    popularArtists,
    newAlbums,
    loading,
    error,

    // 方法
    loadHomeData,
    refresh
  }
})
