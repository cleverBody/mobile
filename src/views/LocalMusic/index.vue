<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <BackButton />
        </IonButtons>
        <IonTitle>本地音乐</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="local-music-page">
        <!-- 导入进度 -->
        <div v-if="importProgress.isImporting" class="import-progress">
          <div class="progress-info">
            <h3>正在导入音乐文件</h3>
            <p>{{ importProgress.current }} / {{ importProgress.total }}</p>
            <p class="current-file">{{ importProgress.currentFile }}</p>
          </div>
          <IonProgressBar
            :value="importProgress.current / importProgress.total"
            color="primary"
          />
        </div>

        <!-- 歌曲列表区域 -->
        <div v-if="!importProgress.isImporting" class="songs-section">
          <!-- 空状态 -->
          <div v-if="localSongs.length === 0" class="empty-state">
            <IonIcon :icon="musicalNotesOutline" class="empty-icon" />
            <h2>还没有本地音乐</h2>
            <p>点击下方按钮导入音乐文件</p>
            <IonButton @click="importMusic" expand="block" class="import-btn">
              <IonIcon :icon="folderOpenOutline" slot="start" />
              导入本地音乐
            </IonButton>
          </div>

          <!-- 有歌曲时显示列表 -->
          <div v-else>
            <div class="section-header">
              <h2 class="section-title">本地音乐</h2>
              <div class="title-controls">
                <IonButton fill="clear" size="small" @click="importMusic" :disabled="importProgress.isImporting">
                  <IonIcon :icon="addOutline" />
                  添加
                </IonButton>
                <IonButton fill="clear" size="small" @click="playAll" :disabled="localSongs.length === 0">
                  <IonIcon :icon="play" />
                  播放全部
                </IonButton>
              </div>
            </div>

            <!-- 歌曲列表 -->
            <div class="songs-list">
              <div
                v-for="(song, index) in localSongs"
                :key="song.id"
                class="song-item"
                :class="{
                  selected: selectedSongs.has(song.id),
                  playing: currentSong?.id === song.id
                }"
                @click="handleSongClick(song, index)"
              >
                <!-- 多选框 -->
                <IonCheckbox
                  v-if="selectMode"
                  :checked="selectedSongs.has(song.id)"
                  @ionChange="toggleSongSelection(song.id)"
                  @click.stop
                />

                <!-- 歌曲编号 -->
                <div v-else class="song-index">
                  <span>{{ index + 1 }}</span>
                </div>

                <!-- 歌曲信息 -->
                <div class="song-main">
                  <div class="song-cover">
                    <img
                      :src="song.cover || '/images/album.jpg'"
                      :alt="song.name"
                      @error="handleImageError"
                    />
                  </div>

                  <div class="song-info">
                    <h3 class="song-name s-text-truncate">{{ song.title || song.name }}</h3>
                    <p class="song-meta s-text-secondary s-text-truncate">
                      {{ song.artist || '未知艺术家' }}
                      <span v-if="song.album"> - {{ song.album }}</span>
                    </p>
                  </div>
                </div>

                <!-- 歌曲操作 -->
                <div class="song-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    @click.stop="toggleSongLike(song.id)"
                    color="medium"
                  >
                    <IonIcon :icon="heartOutline" />
                  </IonButton>

                  <IonButton fill="clear" size="small" @click.stop="showSongMenu(song)">
                    <IonIcon :icon="ellipsisVerticalOutline" />
                  </IonButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作菜单 -->
        <IonActionSheet
          :is-open="showActionSheet"
          :buttons="actionSheetButtons"
          @didDismiss="showActionSheet = false"
        />

        <!-- 歌曲菜单 -->
        <IonActionSheet
          :is-open="showSongActionSheet"
          :buttons="songActionSheetButtons"
          @didDismiss="showSongActionSheet = false"
        />

        <!-- Toast -->
        <IonToast
          :is-open="showToast"
          :message="toastMessage"
          :duration="2000"
          @didDismiss="showToast = false"
        />
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonCheckbox,
  IonActionSheet,
  IonToast
} from '@ionic/vue'
import {
  addOutline,
  ellipsisVerticalOutline,
  play,
  pause,
  musicalNotesOutline,
  folderOpenOutline,
  checkboxOutline,
  heartOutline
} from 'ionicons/icons'
import { useLocalMusicStore } from '@/stores/localMusic'
import { useMusicStore } from '@/stores/music'
import { storeToRefs } from 'pinia'
import { useSwipeBack } from '@/composables/useSwipeBack'
import BackButton from '@/components/common/BackButton.vue'

const localMusicStore = useLocalMusicStore()
const musicStore = useMusicStore()

// 启用侧滑返回
const { goBack } = useSwipeBack()

// 响应式状态
const selectMode = ref(false)
const selectedSongs = ref(new Set<number>())
const showActionSheet = ref(false)
const showSongActionSheet = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const currentSongMenu = ref<any>(null)

// 从store获取状态
const { localSongs, importProgress } = storeToRefs(localMusicStore)
const { currentSong } = storeToRefs(musicStore)

// 计算属性
const totalSize = computed(() => {
  return localSongs.value.reduce((total, song) => total + (song.size || 0), 0)
})

// 方法
const importMusic = async () => {
  try {
    await localMusicStore.importMusicFiles()
    showToastMessage('音乐导入完成')
  } catch (error) {
    console.error('导入音乐失败:', error)
    showToastMessage('导入音乐失败')
  }
}

const playAll = () => {
  if (localSongs.value.length > 0) {
    // 转换为标准歌曲格式，添加本地文件标识
    const songs = localSongs.value.map(song => ({
      id: song.id,
      name: song.name, // 使用原始文件名
      title: song.name, // 保留原始文件名用于格式检测
      artists: [{ id: 0, name: song.artist || '未知艺术家' }],
      album: { id: 0, name: song.album || '未知专辑' },
      cover: song.cover || '/images/album.jpg',
      duration: song.duration * 1000, // 转换为毫秒
      isLocal: true, // 标识为本地音乐
      localFilePath: song.filePath, // 本地文件路径
      localFormat: song.format // 本地文件格式
    }))

    musicStore.setPlaylist(songs, 0)
  }
}

const handleSongClick = (song: any, index: number) => {
  if (selectMode.value) {
    toggleSongSelection(song.id)
  } else {
    // 转换为标准歌曲格式，添加本地文件标识
    const songs = localSongs.value.map(s => ({
      id: s.id,
      name: s.name, // 使用原始文件名
      title: s.name, // 保留原始文件名用于格式检测
      artists: [{ id: 0, name: s.artist || '未知艺术家' }],
      album: { id: 0, name: s.album || '未知专辑' },
      cover: s.cover || '/images/album.jpg',
      duration: s.duration * 1000, // 转换为毫秒
      isLocal: true, // 标识为本地音乐
      localFilePath: s.filePath, // 本地文件路径
      localFormat: s.format // 本地文件格式
    }))

    musicStore.setPlaylist(songs, index)
  }
}

const toggleSelectMode = () => {
  selectMode.value = !selectMode.value
  if (!selectMode.value) {
    selectedSongs.value.clear()
  }
}

const toggleSongSelection = (songId: number) => {
  if (selectedSongs.value.has(songId)) {
    selectedSongs.value.delete(songId)
  } else {
    selectedSongs.value.add(songId)
  }
}

const toggleSongLike = (songId: number) => {
  musicStore.toggleLike(songId)
}

const showSongMenu = (song: any) => {
  currentSongMenu.value = song
  showSongActionSheet.value = true
}

const showMenu = () => {
  showActionSheet.value = true
}

const moreActions = () => {
  showActionSheet.value = true
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}

const formatDuration = (duration: number) => {
  if (!duration) return '0:00'
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const showToastMessage = (message: string) => {
  toastMessage.value = message
  showToast.value = true
}

// 操作菜单按钮
const actionSheetButtons = [
  {
    text: '导入音乐',
    icon: addOutline,
    handler: importMusic
  },
  {
    text: '清空列表',
    role: 'destructive',
    handler: () => {
      localMusicStore.clearAllSongs()
      showToastMessage('已清空本地音乐')
    }
  },
  {
    text: '取消',
    role: 'cancel'
  }
]

// 歌曲菜单按钮
const songActionSheetButtons = computed(() => [
  {
    text: '删除',
    role: 'destructive',
    handler: () => {
      if (currentSongMenu.value) {
        localMusicStore.deleteSong(currentSongMenu.value.id)
        showToastMessage('已删除歌曲')
      }
    }
  },
  {
    text: '取消',
    role: 'cancel'
  }
])

// 生命周期
onMounted(async () => {
  await localMusicStore.initLocalMusic()
})
</script>

<style scoped>
/* 页面基础样式 */
.local-music-page {
  padding: 16px;
}

/* 歌曲列表区域 */
.songs-section {
  background: var(--ion-background-color);
  padding: 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ion-color-light);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: var(--ion-color-dark);
}

.title-controls {
  display: flex;
  gap: 8px;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: var(--ion-color-light-shade);
  transform: translateX(4px);
}

.song-item.selected {
  background: rgba(var(--ion-color-primary-rgb), 0.1);
  border: 1px solid var(--ion-color-primary);
}

.song-item.playing {
  background: rgba(var(--ion-color-primary-rgb), 0.1);
}

.song-item.playing .song-name {
  color: var(--ion-color-primary);
  font-weight: 600;
}

.song-index {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-right: 12px;
}

.song-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--ion-color-dark);
}

.song-meta {
  font-size: 13px;
  margin: 0;
  color: var(--ion-color-medium);
}

.song-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* 文本样式类 */
.s-text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.s-text-secondary {
  color: var(--ion-color-medium);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 20px;
  color: var(--ion-color-dark);
  margin: 0 0 12px 0;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin: 0 0 24px 0;
}

.import-btn {
  margin-top: 16px;
}

/* 导入进度 */
.import-progress {
  padding: 16px;
  background: var(--ion-color-light);
  margin: 16px 0;
  border-radius: 12px;
}

.progress-info {
  text-align: center;
  margin-bottom: 16px;
}

.progress-info h3 {
  margin: 0 0 8px 0;
  color: var(--ion-color-dark);
}

.progress-info p {
  margin: 4px 0;
  color: var(--ion-color-medium);
}

.current-file {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .song-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}
</style>


