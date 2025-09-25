import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LocalSong, ImportProgress, LocalMusicStats } from '@/types/localMusic'
import { LocalMusicFileManager } from '@/utils/fileManager'
import { parseAudioMetadata, extractCoverArt, generateId, isSupportedAudioFormat } from '@/utils/audioMetadata'

export const useLocalMusicStore = defineStore('localMusic', () => {
  // 状态
  const localSongs = ref<LocalSong[]>([])
  const importProgress = ref<ImportProgress>({
    total: 0,
    current: 0,
    currentFile: '',
    isImporting: false,
    errors: []
  })

  // 计算属性
  const stats = computed<LocalMusicStats>(() => {
    const songs = localSongs.value
    const artists = new Set(songs.map(s => s.artist)).size
    const albums = new Set(songs.map(s => s.album)).size

    return {
      totalSongs: songs.length,
      totalSize: songs.reduce((sum, s) => sum + s.size, 0),
      totalDuration: songs.reduce((sum, s) => sum + s.duration, 0),
      artists,
      albums
    }
  })

  const artistGroups = computed(() => {
    const groups: Record<string, LocalSong[]> = {}
    localSongs.value.forEach(song => {
      const artist = song.artist || '未知艺术家'
      if (!groups[artist]) {
        groups[artist] = []
      }
      groups[artist].push(song)
    })
    return groups
  })

  const albumGroups = computed(() => {
    const groups: Record<string, LocalSong[]> = {}
    localSongs.value.forEach(song => {
      const album = song.album || '未知专辑'
      if (!groups[album]) {
        groups[album] = []
      }
      groups[album].push(song)
    })
    return groups
  })

  // 方法
  const initLocalMusic = async () => {
    try {
      await LocalMusicFileManager.initDirectories()
      await loadLocalSongs()
    } catch (error) {
      console.error('初始化本地音乐失败:', error)
    }
  }

  const loadLocalSongs = async () => {
    try {
      const stored = localStorage.getItem('local-songs')
      if (stored) {
        localSongs.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载本地歌曲失败:', error)
    }
  }

  const saveLocalSongs = async () => {
    try {
      localStorage.setItem('local-songs', JSON.stringify(localSongs.value))
    } catch (error) {
      console.error('保存本地歌曲失败:', error)
    }
  }

  const importMusicFiles = async () => {
    try {
      const files = await LocalMusicFileManager.pickMusicFiles()
      if (files.length === 0) {
        console.log('用户取消了文件选择或未选择文件')
        return { success: 0, errors: 0 }
      }

      // 过滤支持的音频格式
      const audioFiles = files.filter(file => isSupportedAudioFormat(file.name))

      if (audioFiles.length === 0) {
        throw new Error('没有找到支持的音频文件')
      }

      // 开始导入
      importProgress.value = {
        total: audioFiles.length,
        current: 0,
        currentFile: '',
        isImporting: true,
        errors: []
      }

      const newSongs: LocalSong[] = []

      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i]
        importProgress.value.current = i + 1
        importProgress.value.currentFile = file.name

        try {
          const song = await processAudioFile(file)
          newSongs.push(song)
        } catch (error) {
          console.error(`处理文件 ${file.name} 失败:`, error)
          importProgress.value.errors.push(`${file.name}: ${error.message}`)
        }
      }

      // 添加到本地歌曲列表
      localSongs.value.push(...newSongs)
      await saveLocalSongs()

      // 完成导入
      importProgress.value.isImporting = false

      return {
        success: newSongs.length,
        errors: importProgress.value.errors.length
      }
    } catch (error) {
      importProgress.value.isImporting = false
      console.error('导入音乐文件失败:', error)
      throw error
    }
  }

  const processAudioFile = async (file: File): Promise<LocalSong> => {
    const songId = generateId()

    console.log('处理音频文件:', file.name)

    // 解析音频元数据
    const metadata = await parseAudioMetadata(file)

    // 保存音乐文件
    const filePath = await LocalMusicFileManager.saveMusicFile(file, songId)

    // 处理封面
    let coverPath = ''
    const coverUrl = extractCoverArt(metadata)
    if (coverUrl) {
      coverPath = coverUrl // 直接使用blob URL
    }

    // 从文件名提取基本信息作为后备
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'mp3'

    // 创建本地歌曲对象
    const localSong: LocalSong = {
      id: songId,
      name: metadata.title || fileName,
      artist: metadata.artist || '未知艺术家',
      album: metadata.album || '未知专辑',
      duration: metadata.duration || 0,
      filePath, // 现在存储的是 songId
      cover: coverPath,
      size: file.size,
      format: metadata.format || fileExtension,
      bitrate: metadata.bitrate,
      sampleRate: metadata.sampleRate,
      type: 'local',
      dateAdded: Date.now(),
      playCount: 0
    }

    return localSong
  }

  const deleteSong = async (songId: string) => {
    try {
      const songIndex = localSongs.value.findIndex(s => s.id === songId)
      if (songIndex === -1) return

      const song = localSongs.value[songIndex]

      // 删除本地文件 (filePath 现在存储的是 songId)
      await LocalMusicFileManager.deleteLocalFile(song.filePath)
      // 封面暂时不需要单独删除，因为使用的是 blob URL

      // 从列表中移除
      localSongs.value.splice(songIndex, 1)
      await saveLocalSongs()
    } catch (error) {
      console.error('删除歌曲失败:', error)
      throw error
    }
  }

  const clearAllSongs = async () => {
    try {
      // 删除所有本地文件
      for (const song of localSongs.value) {
        await LocalMusicFileManager.deleteLocalFile(song.filePath)
        if (song.cover) {
          await LocalMusicFileManager.deleteLocalFile(song.cover)
        }
      }

      // 清空列表
      localSongs.value = []
      await saveLocalSongs()
    } catch (error) {
      console.error('清空歌曲失败:', error)
      throw error
    }
  }

  const updatePlayCount = async (songId: string) => {
    const song = localSongs.value.find(s => s.id === songId)
    if (song) {
      song.playCount++
      song.lastPlayed = Date.now()
      await saveLocalSongs()
    }
  }

  return {
    // 状态
    localSongs,
    importProgress,

    // 计算属性
    stats,
    artistGroups,
    albumGroups,

    // 方法
    initLocalMusic,
    loadLocalSongs,
    importMusicFiles,
    deleteSong,
    clearAllSongs,
    updatePlayCount
  }
}, {
  persist: {
    paths: ['localSongs']
  }
})
