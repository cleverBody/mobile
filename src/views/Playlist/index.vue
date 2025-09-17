<template>
  <IonPage>
    <!-- 沉浸式头部，无IonHeader -->
    <IonContent :fullscreen="true" class="playlist-content">
      <div class="playlist-page">
        <!-- 沉浸式歌单头部 -->
        <div class="playlist-hero" :style="{ backgroundImage: `url(${playlistInfo?.cover || '/images/album.jpg'})` }">
          <!-- 背景渐变遮罩 -->
          <div class="hero-overlay"></div>

          <!-- 顶部操作栏 -->
          <div class="top-bar">
            <IonButton
              fill="clear"
              color="light"
              @click="goBack"
              class="back-button"
            >
              <IonIcon :icon="arrowBackOutline" />
            </IonButton>

            <div class="top-actions">
              <IonButton fill="clear" color="light" @click="sharePlaylist">
                <IonIcon :icon="shareOutline" />
              </IonButton>
              <IonButton fill="clear" color="light" @click="moreActions">
                <IonIcon :icon="ellipsisVerticalOutline" />
              </IonButton>
            </div>
          </div>

          <!-- 歌单信息 - 紧凑横向布局 -->
          <div class="hero-content">
            <div class="playlist-main">
              <div class="playlist-cover-container">
                <div class="playlist-cover">
                  <img
                    :src="playlistInfo?.cover || '/images/album.jpg'"
                    :alt="playlistInfo?.name"
                    @error="handleImageError"
                  />
                  <div class="play-overlay" @click="playAll">
                    <div class="play-button">
                      <IonIcon :icon="play" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="playlist-info">
                <h1 class="playlist-title">{{ playlistInfo?.name || '加载中...' }}</h1>

                <div class="creator-info">
                  <img
                    :src="playlistInfo?.creator?.avatar || ''"
                    :alt="playlistInfo?.creator?.name"
                    class="creator-avatar"
                    @error="handleAvatarError"
                  />
                  <span class="creator-name">{{ playlistInfo?.creator?.name }}</span>
                </div>

                <div class="playlist-stats">
                  <span>{{ playlistInfo?.trackCount || 0 }}首</span>
                  <span class="separator">•</span>
                  <span>{{ formatPlayCount(playlistInfo?.playCount) }}次播放</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="hero-actions">
              <IonButton
                expand="block"
                class="play-all-button"
                @click="playAll"
                :disabled="!songs.length"
              >
                <IonIcon :icon="play" slot="start" />
                播放全部
              </IonButton>

              <div class="action-row">
                <IonButton
                  fill="clear"
                  size="small"
                  color="light"
                  @click="toggleSubscribe"
                  :color="isSubscribed ? 'danger' : 'light'"
                >
                  <IonIcon :icon="isSubscribed ? heart : heartOutline" />
                </IonButton>

                <IonButton fill="clear" size="small" color="light" @click="downloadAll">
                  <IonIcon :icon="downloadOutline" />
                </IonButton>

                <IonButton fill="clear" size="small" color="light" @click="sharePlaylist">
                  <IonIcon :icon="shareOutline" />
                </IonButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 歌曲列表区域 -->
        <div class="songs-section">
          <div class="section-header">
            <h2 class="section-title">歌曲列表</h2>
            <div class="list-controls">
              <IonButton fill="clear" size="small" @click="toggleSortOrder">
                <IonIcon :icon="swapVerticalOutline" />
              </IonButton>
              <IonButton fill="clear" size="small" @click="toggleSelectMode">
                <IonIcon :icon="checkboxOutline" />
              </IonButton>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <IonSpinner name="circular" />
            <p>加载中...</p>
          </div>

          <!-- 歌曲列表 -->
          <div v-else-if="songs.length > 0" class="songs-list">
            <div
              v-for="(song, index) in sortedSongs"
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

              <!-- 歌曲编号/播放状态 -->
              <div v-else class="song-index">
                <span v-if="currentSong?.id !== song.id">{{ index + 1 }}</span>
                <IonIcon v-else :icon="volumeHighOutline" color="primary" />
              </div>

              <!-- 歌曲信息 -->
              <div class="song-main">
                <div class="song-cover">
                  <img
                    :src="song.cover || playlistInfo?.cover || '/images/album.jpg'"
                    :alt="song.name"
                    @error="handleImageError"
                  />
                </div>

                <div class="song-info">
                  <h3 class="song-name s-text-truncate">{{ song.name }}</h3>
                  <p class="song-meta s-text-secondary s-text-truncate">
                    {{ song.artists?.map(a => a.name).join(', ') }}
                    <span v-if="song.album"> - {{ song.album.name }}</span>
                  </p>
                </div>
              </div>

              <!-- 歌曲操作 -->
              <div class="song-actions">
                <IonButton
                  fill="clear"
                  size="small"
                  @click.stop="toggleSongLike(song.id)"
                  :color="musicStore.isLiked(song.id) ? 'primary' : 'medium'"
                >
                  <IonIcon :icon="musicStore.isLiked(song.id) ? heart : heartOutline" />
                </IonButton>

                <IonButton fill="clear" size="small" @click.stop="moreSongActions(song)">
                  <IonIcon :icon="ellipsisVerticalOutline" />
                </IonButton>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <IonIcon :icon="musicalNotesOutline" class="empty-icon" />
            <h3>暂无歌曲</h3>
            <p>这个歌单还没有添加任何歌曲</p>
          </div>
        </div>

        <!-- 多选操作栏 -->
        <div v-if="selectMode && selectedSongs.size > 0" class="batch-actions">
          <div class="batch-info">
            <span>已选择 {{ selectedSongs.size }} 首歌曲</span>
          </div>
          <div class="batch-buttons">
            <IonButton fill="clear" size="small" @click="playSelected">
              <IonIcon :icon="play" />
              播放
            </IonButton>
            <IonButton fill="clear" size="small" @click="addToPlaylist">
              <IonIcon :icon="addOutline" />
              添加到
            </IonButton>
            <IonButton fill="clear" size="small" @click="downloadSelected">
              <IonIcon :icon="downloadOutline" />
              下载
            </IonButton>
          </div>
        </div>
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
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonAvatar,
  IonSpinner,
  IonCheckbox
} from '@ionic/vue'
import {
  arrowBackOutline,
  shareOutline,
  ellipsisVerticalOutline,
  play,
  heart,
  heartOutline,
  downloadOutline,
  swapVerticalOutline,
  checkboxOutline,
  volumeHighOutline,
  musicalNotesOutline,
  addOutline
} from 'ionicons/icons'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylistStore } from '@/stores/playlist'
import { useMusicStore } from '@/stores/music'

const route = useRoute()
const router = useRouter()
const playlistStore = usePlaylistStore()
const musicStore = useMusicStore()

// 响应式状态
const loading = ref(true)
const selectMode = ref(false)
const selectedSongs = ref(new Set<number>())
const sortOrder = ref<'asc' | 'desc'>('asc')
const isSubscribed = ref(false)

// 计算属性
const playlistId = computed(() => Number(route.params.id))
const playlistInfo = computed(() => playlistStore.currentPlaylist)
const songs = computed(() => playlistStore.playlistSongs)
const currentSong = computed(() => musicStore.currentSong)

const sortedSongs = computed(() => {
  const songsCopy = [...songs.value]
  return sortOrder.value === 'asc' ? songsCopy : songsCopy.reverse()
})

// 方法
const goBack = () => {
  router.back()
}

const sharePlaylist = () => {
  // TODO: 分享歌单
  console.log('分享歌单')
}

const moreActions = () => {
  // TODO: 更多操作
  console.log('更多操作')
}

const playAll = () => {
  if (songs.value.length > 0) {
    musicStore.setPlaylist(songs.value, 0)
  }
}

const toggleSubscribe = () => {
  isSubscribed.value = !isSubscribed.value
  // TODO: 调用收藏/取消收藏API
}

const downloadAll = () => {
  // TODO: 下载全部歌曲
  console.log('下载全部')
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const toggleSelectMode = () => {
  selectMode.value = !selectMode.value
  if (!selectMode.value) {
    selectedSongs.value.clear()
  }
}

const handleSongClick = (song: any, index: number) => {
  if (selectMode.value) {
    toggleSongSelection(song.id)
  } else {
    // 播放歌曲
    musicStore.setPlaylist(songs.value, index)
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

const moreSongActions = (song: any) => {
  // TODO: 更多歌曲操作
  console.log('歌曲操作', song)
}

const playSelected = () => {
  const selectedSongList = songs.value.filter(song => selectedSongs.value.has(song.id))
  if (selectedSongList.length > 0) {
    musicStore.setPlaylist(selectedSongList, 0)
  }
  selectMode.value = false
  selectedSongs.value.clear()
}

const addToPlaylist = () => {
  // TODO: 添加选中歌曲到歌单
  console.log('添加到歌单')
}

const downloadSelected = () => {
  // TODO: 下载选中歌曲
  console.log('下载选中')
}

const formatPlayCount = (count?: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await playlistStore.loadPlaylist(playlistId.value)
    // TODO: 检查是否已收藏
    isSubscribed.value = false
  } catch (error) {
    console.error('加载歌单失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.playlist-content {
  --padding-top: 0 !important;
  --padding-bottom: 120px;
}

.playlist-page {
  min-height: 100vh;
}

/* 沉浸式头部区域 - 优化为更紧凑的设计 */
.playlist-hero {
  position: relative;
  min-height: 280px; /* 从70vh改为固定280px */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  color: white;
  padding: var(--ion-safe-area-top) 20px 20px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(168, 230, 207, 0.2) 0%,
    rgba(45, 90, 61, 0.4) 50%,
    rgba(26, 46, 35, 0.8) 100%
  );
  backdrop-filter: blur(8px);
}

/* 顶部操作栏 */
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  --background: rgba(0, 0, 0, 0.3);
  --border-radius: 50%;
  width: 44px;
  height: 44px;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.top-actions ion-button {
  --background: rgba(0, 0, 0, 0.3);
  --border-radius: 50%;
  width: 44px;
  height: 44px;
}

/* 英雄内容区域 - 紧凑横向布局 */
.hero-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.playlist-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.playlist-cover-container {
  flex-shrink: 0;
}

.playlist-cover {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.playlist-cover:active {
  transform: scale(0.95);
}

.playlist-cover img {
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.playlist-cover:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 48px;
  height: 48px;
  background: var(--s-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(168, 230, 207, 0.4);
}

/* 歌单信息 - 优化布局 */
.playlist-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-name {
  font-size: 14px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.playlist-stats {
  font-size: 13px;
  opacity: 0.8;
  display: flex;
  gap: 8px;
  align-items: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.separator {
  opacity: 0.6;
}

/* 操作按钮区域 */
.hero-actions {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.play-all-button {
  --background: var(--s-primary);
  --color: white;
  --border-radius: 25px;
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 20px rgba(168, 230, 207, 0.4);
}

.action-row {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.action-row ion-button {
  --background: rgba(0, 0, 0, 0.3);
  --color: white;
  --border-radius: 50%;
  width: 44px;
  height: 44px;
}

/* 歌曲列表区域 */
.songs-section {
  height: auto;
  padding: 12px 16px;
}

/* 歌曲列表区域 */
.songs-section {
  background: var(--ion-background-color);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 20px;
  position: relative;
  z-index: 5;
  margin-top: -20px;
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

.list-controls {
  display: flex;
  gap: 8px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.loading-container p {
  margin-top: 16px;
  color: var(--ion-color-medium);
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
  width: 32px;
  text-align: center;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--ion-color-dark);
}

.empty-state p {
  margin: 0;
  color: var(--ion-color-medium);
}

.batch-actions {
  position: fixed;
  bottom: calc(50px + var(--ion-safe-area-bottom));
  left: 0;
  right: 0;
  background: var(--ion-background-color);
  border-top: 1px solid var(--ion-color-light);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.batch-info {
  font-size: 14px;
  color: var(--ion-color-dark);
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .playlist-hero {
    min-height: 60vh;
    padding: var(--ion-safe-area-top) 16px 16px;
  }

  .playlist-cover {
    width: 160px;
    height: 160px;
    border-radius: 16px;
  }

  .playlist-title {
    font-size: 24px;
  }

  .action-row {
    flex-wrap: wrap;
    gap: 12px;
  }

  .action-row ion-button {
    flex: 1;
    min-width: 80px;
  }

  .songs-section {
    padding: 20px 16px 16px;
    margin-top: -16px;
  }

  .batch-actions {
    flex-direction: column;
    gap: 8px;
    padding: 16px 20px;
  }

  .batch-buttons {
    justify-content: center;
    width: 100%;
  }
}

/* 适配安全区域 */
@supports (padding: max(0px)) {
  .playlist-hero {
    padding-top: max(var(--ion-safe-area-top), 20px);
  }
}
</style>
