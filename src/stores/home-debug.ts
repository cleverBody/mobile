// 简化版的 Home store 用于调试
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHomeStore = defineStore('home', () => {
  const recommendedPlaylists = ref([
    {
      id: 1,
      name: '测试歌单1',
      cover: '/images/test1.jpg',
      description: '这是测试歌单',
      playCount: 12345,
      creator: '测试用户'
    },
    {
      id: 2,
      name: '测试歌单2', 
      cover: '/images/test2.jpg',
      description: '这是另一个测试歌单',
      playCount: 67890,
      creator: '测试用户2'
    }
  ])
  
  const popularArtists = ref([
    {
      id: 1,
      name: '测试歌手1',
      cover: '/images/artist1.jpg',
      followers: 100000
    },
    {
      id: 2,
      name: '测试歌手2',
      cover: '/images/artist2.jpg', 
      followers: 200000
    }
  ])
  
  const newAlbums = ref([
    {
      id: 1,
      name: '测试专辑1',
      cover: '/images/album1.jpg',
      artist: '测试歌手1',
      releaseDate: '2024-01-01'
    },
    {
      id: 2,
      name: '测试专辑2', 
      cover: '/images/album2.jpg',
      artist: '测试歌手2',
      releaseDate: '2024-01-02'
    }
  ])
  
  const loading = ref(false)
  
  const loadHomeData = async () => {
    console.log('🚀 简化版数据加载开始')
    loading.value = true
    
    // 更短的延迟用于测试
    await new Promise(resolve => setTimeout(resolve, 100))
    
    loading.value = false
    console.log('✅ 简化版数据加载完成')
    console.log('歌单数量:', recommendedPlaylists.value.length)
    console.log('歌手数量:', popularArtists.value.length)
    console.log('专辑数量:', newAlbums.value.length)
  }
  
  return {
    recommendedPlaylists,
    popularArtists,
    newAlbums,
    loading,
    loadHomeData,
    refreshHomeData: loadHomeData
  }
})