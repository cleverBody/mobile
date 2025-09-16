import { defineStore } from 'pinia'
import { ref } from 'vue'
import { musicApi, formatSong } from '@/api/music'

export interface PlaylistInfo {
  id: number
  name: string
  cover: string
  description?: string
  trackCount: number
  playCount?: number
  createTime?: string
  updateTime?: string
  creator: {
    id: number
    name: string
    avatar?: string
  }
  tags?: string[]
}

export interface Song {
  id: number
  name: string
  artists: Array<{ id: number; name: string }>
  album?: { id: number; name: string }
  cover?: string
  duration?: number
  url?: string
  addTime?: string
}

export const usePlaylistStore = defineStore('playlist', () => {
  // 状态
  const currentPlaylist = ref<PlaylistInfo | null>(null)
  const playlistSongs = ref<Song[]>([])
  const loading = ref(false)
  
  // 方法
  const loadPlaylist = async (id: number) => {
    if (loading.value) return
    
    loading.value = true
    try {
      console.log('加载歌单:', id)
      
      // 调用真实API获取歌单详情
      const playlistResponse = await musicApi.getPlaylistDetail(id)
      const playlist = playlistResponse.playlist
      
      // 设置歌单信息
      currentPlaylist.value = {
        id: playlist.id,
        name: playlist.name,
        cover: playlist.coverImgUrl || playlist.picUrl,
        description: playlist.description,
        trackCount: playlist.trackCount || playlist.tracks?.length || 0,
        playCount: playlist.playCount,
        createTime: new Date(playlist.createTime).toLocaleDateString(),
        updateTime: new Date(playlist.updateTime || playlist.createTime).toLocaleDateString(),
        creator: {
          id: playlist.creator.userId,
          name: playlist.creator.nickname,
          avatar: playlist.creator.avatarUrl
        },
        tags: playlist.tags || []
      }
      
      // 获取歌单歌曲列表
      try {
        const songsResponse = await musicApi.getPlaylistTracks(id, 100)
        playlistSongs.value = songsResponse.songs ? songsResponse.songs.map(formatSong) : []
        console.log('歌单歌曲加载完成:', playlistSongs.value.length)
      } catch (songsError) {
        console.error('获取歌单歌曲失败:', songsError)
        // 如果获取歌曲失败，使用歌单详情中的tracks
        if (playlist.tracks) {
          playlistSongs.value = playlist.tracks.map(formatSong)
        } else {
          playlistSongs.value = []
        }
      }
      
    } catch (error) {
      console.error('加载歌单失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const addSongToPlaylist = async (playlistId: number, songId: number) => {
    // TODO: 添加歌曲到歌单
    console.log('添加歌曲到歌单', playlistId, songId)
  }
  
  const removeSongFromPlaylist = async (playlistId: number, songId: number) => {
    // TODO: 从歌单移除歌曲
    const index = playlistSongs.value.findIndex(song => song.id === songId)
    if (index > -1) {
      playlistSongs.value.splice(index, 1)
      if (currentPlaylist.value) {
        currentPlaylist.value.trackCount--
      }
    }
  }
  
  const subscribePlaylist = async (playlistId: number) => {
    // TODO: 收藏歌单
    console.log('收藏歌单', playlistId)
  }
  
  const unsubscribePlaylist = async (playlistId: number) => {
    // TODO: 取消收藏歌单
    console.log('取消收藏歌单', playlistId)
  }
  
  const clearPlaylist = () => {
    currentPlaylist.value = null
    playlistSongs.value = []
  }
  
  return {
    // 状态
    currentPlaylist,
    playlistSongs,
    loading,
    
    // 方法
    loadPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    subscribePlaylist,
    unsubscribePlaylist,
    clearPlaylist
  }
})