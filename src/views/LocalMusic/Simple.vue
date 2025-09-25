<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>本地音乐</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="importMusic" :disabled="importing">
            <IonIcon :icon="addOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- 导入状态 -->
      <div v-if="importing" class="import-status">
        <p>正在导入音乐文件...</p>
        <IonProgressBar type="indeterminate" />
      </div>

      <!-- 空状态 -->
      <div v-if="!importing && songs.length === 0" class="empty-state">
        <IonIcon :icon="musicalNotesOutline" class="empty-icon" />
        <h2>还没有本地音乐</h2>
        <p>点击右上角的 + 按钮导入音乐文件</p>
        <IonButton @click="importMusic" expand="block" class="import-btn">
          <IonIcon :icon="folderOpenOutline" slot="start" />
          导入本地音乐
        </IonButton>
      </div>

      <!-- 歌曲列表 -->
      <div v-if="!importing && songs.length > 0" class="music-list">
        <div class="list-header">
          <IonButton @click="playAll" fill="clear" size="small">
            <IonIcon :icon="play" slot="start" />
            播放全部 ({{ songs.length }})
          </IonButton>
          <IonButton @click="clearAll" fill="clear" size="small" color="danger">
            <IonIcon :icon="trashOutline" slot="start" />
            清空
          </IonButton>
        </div>

        <div
          v-for="(song, index) in songs"
          :key="song.id"
          class="song-item"
          :class="{ 'playing': currentSongId === song.id }"
          @click="playSong(song, index)"
        >
          <div class="song-cover">
            <img
              :src="song.cover || '/images/album.jpg'"
              :alt="song.name"
              @error="handleImageError"
            />
            <div class="play-overlay">
              <IonIcon
                :icon="currentSongId === song.id && isPlaying ? pause : play"
              />
            </div>
          </div>
          <div class="song-info">
            <h3 class="song-name">{{ song.name }}</h3>
            <p class="song-artist">{{ song.artist }}</p>
            <div class="song-meta">
              <span>{{ formatFileSize(song.size) }}</span>
              <span>{{ song.format?.toUpperCase() }}</span>
            </div>
          </div>
          <div class="song-actions">
            <IonButton fill="clear" size="small" @click.stop="deleteSong(song)">
              <IonIcon :icon="trashOutline" />
            </IonButton>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonProgressBar,
  alertController,
  toastController
} from '@ionic/vue'
import {
  addOutline,
  musicalNotesOutline,
  folderOpenOutline,
  play,
  pause,
  trashOutline
} from 'ionicons/icons'

// 简化的本地歌曲类型
interface SimpleSong {
  id: string
  name: string
  artist: string
  album: string
  size: number
  format: string
  cover: string
  file: File
  dateAdded: number
}

// 状态
const songs = ref<SimpleSong[]>([])
const importing = ref(false)
const currentAudio = ref<HTMLAudioElement | null>(null)
const currentSongId = ref<string>('')
const isPlaying = ref(false)

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 文件选择
const selectFiles = (): Promise<File[]> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'audio/*'

    input.onchange = (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || [])
      resolve(files)
    }

    input.oncancel = () => resolve([])
    input.click()
  })
}

// 导入音乐
const importMusic = async () => {
  try {
    importing.value = true
    const files = await selectFiles()

    if (files.length === 0) {
      importing.value = false
      return
    }

    for (const file of files) {
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'mp3'

      // 简单的文件名解析
      let title = fileName
      let artist = '未知艺术家'

      if (fileName.includes(' - ')) {
        const parts = fileName.split(' - ')
        if (parts.length >= 2) {
          artist = parts[0].trim()
          title = parts.slice(1).join(' - ').trim()
        }
      }

      const song: SimpleSong = {
        id: generateId(),
        name: title,
        artist,
        album: '未知专辑',
        size: file.size,
        format: fileExtension,
        cover: '',
        file,
        dateAdded: Date.now()
      }

      songs.value.push(song)
    }

    // 保存到localStorage
    const songsToStore = songs.value.map(song => ({
      ...song,
      file: undefined // 不保存File对象到localStorage
    }))
    localStorage.setItem('simple-local-songs', JSON.stringify(songsToStore))

    const toast = await toastController.create({
      message: `成功导入 ${files.length} 首歌曲`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()

  } catch (error) {
    console.error('导入失败:', error)
    const toast = await toastController.create({
      message: '导入失败',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  } finally {
    importing.value = false
  }
}

// 停止当前播放
const stopCurrentAudio = () => {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    currentAudio.value = null
  }
  currentSongId.value = ''
  isPlaying.value = false
}

// 播放歌曲
const playSong = async (song: SimpleSong, index: number) => {
  try {
    // 如果点击的是当前播放的歌曲，则暂停/继续
    if (currentSongId.value === song.id && currentAudio.value) {
      if (isPlaying.value) {
        currentAudio.value.pause()
        isPlaying.value = false
      } else {
        currentAudio.value.play()
        isPlaying.value = true
      }
      return
    }

    // 停止当前播放
    stopCurrentAudio()

    // 创建新的音频播放
    const blobUrl = URL.createObjectURL(song.file)
    console.log('播放歌曲:', song.name, blobUrl)

    const audio = new Audio(blobUrl)
    currentAudio.value = audio
    currentSongId.value = song.id

    // 音频事件监听
    audio.addEventListener('loadstart', () => {
      console.log('开始加载音频')
    })

    audio.addEventListener('canplay', () => {
      console.log('音频可以播放')
    })

    audio.addEventListener('play', () => {
      isPlaying.value = true
      console.log('音频开始播放')
    })

    audio.addEventListener('pause', () => {
      isPlaying.value = false
      console.log('音频暂停')
    })

    audio.addEventListener('ended', () => {
      isPlaying.value = false
      currentSongId.value = ''
      console.log('音频播放结束')

      // 自动播放下一首
      const nextIndex = index + 1
      if (nextIndex < songs.value.length) {
        playSong(songs.value[nextIndex], nextIndex)
      }
    })

    audio.addEventListener('error', (e) => {
      console.error('音频播放错误:', e)
      isPlaying.value = false
      currentSongId.value = ''
    })

    // 开始播放
    await audio.play()

    const toast = await toastController.create({
      message: `正在播放: ${song.name}`,
      duration: 1500,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()

  } catch (error) {
    console.error('播放失败:', error)
    const toast = await toastController.create({
      message: '播放失败',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  }
}

// 播放全部
const playAll = () => {
  if (songs.value.length > 0) {
    playSong(songs.value[0], 0)
  }
}

// 暂停播放
const pausePlay = () => {
  if (currentAudio.value && isPlaying.value) {
    currentAudio.value.pause()
  }
}

// 删除歌曲
const deleteSong = async (song: SimpleSong) => {
  const alert = await alertController.create({
    header: '删除歌曲',
    message: `确定要删除 "${song.name}" 吗？`,
    buttons: [
      { text: '取消', role: 'cancel' },
      {
        text: '删除',
        role: 'destructive',
        handler: () => {
          const index = songs.value.findIndex(s => s.id === song.id)
          if (index !== -1) {
            songs.value.splice(index, 1)
            // 更新localStorage
            const songsToStore = songs.value.map(s => ({ ...s, file: undefined }))
            localStorage.setItem('simple-local-songs', JSON.stringify(songsToStore))
          }
        }
      }
    ]
  })
  await alert.present()
}

// 清空所有
const clearAll = async () => {
  const alert = await alertController.create({
    header: '清空所有音乐',
    message: '确定要删除所有本地音乐吗？',
    buttons: [
      { text: '取消', role: 'cancel' },
      {
        text: '清空',
        role: 'destructive',
        handler: () => {
          stopCurrentAudio()
          songs.value = []
          localStorage.removeItem('simple-local-songs')
        }
      }
    ]
  })
  await alert.present()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}

// 加载保存的歌曲
const loadSongs = () => {
  try {
    const stored = localStorage.getItem('simple-local-songs')
    if (stored) {
      const storedSongs = JSON.parse(stored)
      // 注意：File对象无法从localStorage恢复，需要重新导入
      console.log('加载了', storedSongs.length, '首歌曲（需要重新导入文件）')
    }
  } catch (error) {
    console.error('加载歌曲失败:', error)
  }
}

onMounted(() => {
  loadSongs()
})

onUnmounted(() => {
  // 页面卸载时停止播放
  stopCurrentAudio()
})
</script>

<style scoped>
.import-status {
  padding: 20px;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 24px;
}

.music-list {
  padding: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--ion-color-light);
  margin-bottom: 16px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-color-light-shade);
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: var(--ion-color-light);
}

.song-item.playing {
  background-color: var(--ion-color-primary-tint);
}

.song-item.playing .song-name {
  color: var(--ion-color-primary);
  font-weight: 600;
}

.song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.song-item:hover .play-overlay {
  opacity: 1;
}

.play-overlay ion-icon {
  color: white;
  font-size: 20px;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--ion-color-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.song-meta span {
  background: var(--ion-color-light);
  padding: 2px 6px;
  border-radius: 4px;
}

.song-actions {
  margin-left: 12px;
}
</style>
