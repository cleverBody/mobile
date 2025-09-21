<template>
  <IonPage>
    <IonContent :fullscreen="true" class="album-content">
      <div class="album-page">
        <!-- 沉浸式专辑头部 -->
        <div class="album-hero" :style="{ backgroundImage: `url(${currentAlbum?.cover || '/images/album.jpg'})` }">
          <!-- 背景渐变遮罩 -->
          <div class="hero-overlay"></div>

          <!-- 顶部操作栏 -->
          <div class="top-bar">
            <BackButton color="light" />

            <div class="top-actions">
              <IonButton fill="clear" color="light" @click="shareAlbum">
                <IonIcon :icon="shareOutline" />
              </IonButton>
            </div>
          </div>

          <!-- 专辑信息 -->
          <div class="hero-content">
            <div class="album-main">
              <div class="album-cover-container">
                <div class="album-cover">
                  <img
                    :src="currentAlbum?.cover || '/images/album.jpg'"
                    :alt="currentAlbum?.name"
                    @error="handleImageError"
                  />
                  <div class="play-overlay" @click="playAll">
                    <div class="play-button">
                      <IonIcon :icon="play" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="album-info">
                <h1 class="album-title">{{ currentAlbum?.name || '加载中...' }}</h1>

                <div class="artist-info" @click="goToArtist(currentAlbum?.artistId)">
                  <span class="artist-name">{{ currentAlbum?.artist }}</span>
                </div>

                <div class="album-stats">
                  <span>{{ currentAlbum?.publishTime }}</span>
                  <span class="separator">•</span>
                  <span>{{ currentAlbum?.songsCount || 0 }}首</span>
                  <span v-if="currentAlbum?.playCount" class="separator">•</span>
                  <span v-if="currentAlbum?.playCount">{{ formatNumber(currentAlbum.playCount) }}次播放</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="hero-actions">
              <IonButton
                expand="block"
                class="play-all-button"
                @click="playAll"
                :disabled="!albumSongs.length"
              >
                <IonIcon :icon="play" slot="start" />
                播放全部
              </IonButton>

              <div class="action-row">
                <IonButton
                  fill="clear"
                  size="small"
                  color="light"
                  @click="handleSubscribe"
                  :color="currentAlbum?.isSubscribed ? 'danger' : 'light'"
                >
                  <IonIcon :icon="currentAlbum?.isSubscribed ? checkmarkCircle : addCircle" />
                </IonButton>

                <IonButton fill="clear" size="small" color="light" @click="downloadAlbum">
                  <IonIcon :icon="downloadOutline" />
                </IonButton>

                <IonButton fill="clear" size="small" color="light" @click="shareAlbum">
                  <IonIcon :icon="shareOutline" />
                </IonButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-section">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <IonSpinner name="circular" />
            <p>加载中...</p>
          </div>

          <div v-else-if="currentAlbum" class="album-details">
            <!-- 专辑简介 -->
            <div v-if="currentAlbum.description" class="album-description">
              <h3>专辑简介</h3>
              <div class="description-content">
                <p :class="{ 'description-collapsed': !descriptionExpanded }">
                  {{ currentAlbum.description }}
                </p>
                <div v-if="currentAlbum.description.length > 100" class="description-toggle" @click="descriptionExpanded = !descriptionExpanded">
                  {{ descriptionExpanded ? '收起' : '展开' }}
                  <IonIcon :icon="descriptionExpanded ? chevronUp : chevronDown"></IonIcon>
                </div>
              </div>
            </div>

            <!-- 歌曲列表头部 -->
            <div class="songs-header">
              <div class="songs-title">
                <h3>歌曲列表</h3>
                <span class="songs-count">{{ albumSongs.length }}首</span>
              </div>
              <div class="songs-actions">
                <IonButton fill="clear" size="small" @click="selectMode = !selectMode">
                  <IonIcon :icon="selectMode ? close : ellipsisVertical" />
                </IonButton>
              </div>
            </div>

            <!-- 批量操作栏 -->
            <div v-if="selectMode && selectedSongs.length > 0" class="batch-actions">
              <span>已选择 {{ selectedSongs.length }} 首</span>
              <div class="batch-buttons">
                <IonButton size="small" fill="outline" @click="batchPlay">播放</IonButton>
                <IonButton size="small" fill="outline" @click="batchAddToPlaylist">添加到歌单</IonButton>
                <IonButton size="small" fill="outline" @click="batchDownload">下载</IonButton>
              </div>
            </div>

            <!-- 歌曲列表 -->
            <div class="songs-list">
              <div
                v-for="(song, index) in albumSongs"
                :key="song.id"
                class="song-item"
                :class="{ 'song-selected': selectedSongs.includes(song.id) }"
              >
                <div v-if="selectMode" class="song-checkbox">
                  <IonCheckbox
                    :checked="selectedSongs.includes(song.id)"
                    @ionChange="toggleSongSelection(song.id)"
                  />
                </div>
                <div v-else class="song-track">{{ song.track }}</div>

                <div class="song-info" @click="selectMode ? toggleSongSelection(song.id) : playSong(song, index)">
                  <div class="song-details">
                    <h4 class="song-name">
                      {{ song.name }}
                      <IonIcon v-if="song.mv" :icon="videocamOutline" class="mv-icon" />
                    </h4>
                    <p class="song-meta">
                      <span v-if="song.artists && song.artists.length > 0">
                        {{ song.artists.map(a => a.name).join(' / ') }}
                      </span>
                      <span v-if="song.duration">{{ formatDuration(song.duration) }}</span>
                      <span v-if="song.playCount">{{ formatNumber(song.playCount) }}播放</span>
                    </p>
                  </div>
                </div>

                <div v-if="!selectMode" class="song-actions">
                  <IonButton fill="clear" size="small" @click="showSongMenu(song, index)">
                    <IonIcon :icon="ellipsisVertical" />
                  </IonButton>
                </div>
              </div>

              <!-- 没有更多了提示 -->
              <div v-if="albumSongs.length > 0" class="no-more-tip">
                <span>没有更多了</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage, IonContent,
  IonButton, IonIcon, IonSpinner, IonCheckbox,
  actionSheetController, toastController
} from '@ionic/vue'
import {
  play, addCircle, checkmarkCircle, ellipsisVertical, shareOutline,
  downloadOutline, videocamOutline, close, chevronUp, chevronDown
} from 'ionicons/icons'
import { useAlbumStore } from '../../stores/album'
import { useMusicStore } from '../../stores/music'
import { useSwipeBack } from '@/composables/useSwipeBack'
import BackButton from '@/components/common/BackButton.vue'

const route = useRoute()
const router = useRouter()
const albumStore = useAlbumStore()
const musicStore = useMusicStore()

// 启用侧滑返回
const { goBack } = useSwipeBack()

const selectMode = ref(false)
const selectedSongs = ref<number[]>([])
const descriptionExpanded = ref(false)

const { currentAlbum, albumSongs, loading } = storeToRefs(albumStore)

onMounted(() => {
  const albumId = parseInt(route.params.id as string)
  if (albumId) {
    albumStore.loadAlbum(albumId)
  }
})

const formatNumber = (num?: number) => {
  if (!num) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const formatDuration = (duration?: number) => {
  if (!duration) return '00:00'
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const handleSubscribe = async () => {
  if (!currentAlbum.value) return

  try {
    if (currentAlbum.value.isSubscribed) {
      await albumStore.unsubscribeAlbum(currentAlbum.value.id)
      showToast('已取消收藏')
    } else {
      await albumStore.subscribeAlbum(currentAlbum.value.id)
      showToast('收藏成功')
    }
  } catch (error) {
    showToast('操作失败')
  }
}

const playAll = () => {
  if (albumSongs.value.length > 0) {
    const formattedSongs = albumSongs.value.map(song => ({
      id: song.id,
      name: song.name,
      artists: song.artists,
      duration: song.duration,
      cover: currentAlbum.value?.cover,
      album: currentAlbum.value ? { id: currentAlbum.value.id, name: currentAlbum.value.name } : undefined
    }))
    musicStore.setPlaylist(formattedSongs, 0)
  }
}

const playSong = (song: any, index: number) => {
  if (selectMode.value) {
    toggleSongSelection(song.id)
    return
  }

  const formattedSongs = albumSongs.value.map(s => ({
    id: s.id,
    name: s.name,
    artists: s.artists,
    duration: s.duration,
    cover: currentAlbum.value?.cover,
    album: currentAlbum.value ? { id: currentAlbum.value.id, name: currentAlbum.value.name } : undefined
  }))
  musicStore.setPlaylist(formattedSongs, index)
}

const toggleSongSelection = (songId: number) => {
  const index = selectedSongs.value.indexOf(songId)
  if (index > -1) {
    selectedSongs.value.splice(index, 1)
  } else {
    selectedSongs.value.push(songId)
  }
}

const batchPlay = () => {
  const selectedSongData = albumSongs.value.filter(song => selectedSongs.value.includes(song.id))
  if (selectedSongData.length > 0) {
    const formattedSongs = selectedSongData.map(song => ({
      id: song.id,
      name: song.name,
      artists: song.artists,
      duration: song.duration,
      cover: currentAlbum.value?.cover,
      album: currentAlbum.value ? { id: currentAlbum.value.id, name: currentAlbum.value.name } : undefined
    }))
    musicStore.setPlaylist(formattedSongs, 0)
    selectMode.value = false
    selectedSongs.value = []
  }
}

const batchAddToPlaylist = () => {
  showToast('功能开发中')
}

const batchDownload = () => {
  showToast('功能开发中')
}

const showSongMenu = async (song: any, index: number) => {
  const actionSheet = await actionSheetController.create({
    header: song.name,
    buttons: [
      {
        text: '立即播放',
        icon: play,
        handler: () => playSong(song, index)
      },
      {
        text: '下一首播放',
        handler: () => {
          showToast('已添加到下一首播放')
        }
      },
      {
        text: '添加到歌单',
        handler: () => {
          showToast('功能开发中')
        }
      },
      {
        text: '下载',
        icon: downloadOutline,
        handler: () => {
          showToast('功能开发中')
        }
      },
      {
        text: '分享',
        icon: shareOutline,
        handler: () => {
          showToast('功能开发中')
        }
      },
      {
        text: '取消',
        role: 'cancel'
      }
    ]
  })

  await actionSheet.present()
}

const goToArtist = (artistId: number) => {
  router.push({ name: 'Artist', query: { id: artistId.toString() } })
}

const shareAlbum = () => {
  showToast('功能开发中')
}

const downloadAlbum = () => {
  showToast('功能开发中')
}

const showToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom'
  })
  await toast.present()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}
</script>

<style scoped>
.album-content {
  --padding-top: 0 !important;
  --padding-bottom: 120px;
}

.album-page {
  min-height: 100vh;
}

/* 沉浸式头部区域 */
.album-hero {
  position: relative;
  min-height: 280px;
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

/* 英雄内容区域 */
.hero-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.album-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.album-cover-container {
  flex-shrink: 0;
}

.album-cover {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.album-cover:active {
  transform: scale(0.95);
}

.album-cover img {
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

.album-cover:hover .play-overlay {
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

/* 专辑信息 */
.album-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.album-title {
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

.artist-info {
  cursor: pointer;
}

.artist-name {
  font-size: 14px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  text-decoration: underline;
}

.album-stats {
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

/* 内容区域 */
.content-section {
  background: var(--ion-background-color);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 20px;
  position: relative;
  z-index: 5;
  margin-top: -20px;
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

.album-description {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--ion-color-light);
}

.album-description h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.album-description p {
  margin: 0;
  line-height: 1.6;
  color: var(--ion-color-medium);
  transition: all 0.3s ease;
}

.album-description .description-collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.description-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 12px;
  padding: 8px 16px;
  color: var(--s-primary);
  font-size: 14px;
  cursor: pointer;
  border-radius: 20px;
  background: var(--ion-color-light);
  transition: all 0.2s ease;
  align-self: center;
  width: fit-content;
}

.description-toggle:hover {
  background: var(--ion-color-light-shade);
}

.songs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ion-color-light);
}

.songs-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.songs-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.songs-count {
  font-size: 12px;
  color: var(--ion-color-medium);
  background: var(--ion-color-light);
  padding: 2px 8px;
  border-radius: 10px;
}

.songs-actions {
  display: flex;
  gap: 8px;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--ion-color-light);
  border-radius: 12px;
  margin-bottom: 16px;
}

.batch-buttons {
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
  gap: 12px;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: var(--ion-color-light-shade);
  transform: translateX(4px);
}

.song-item.song-selected {
  background: rgba(var(--ion-color-primary-rgb), 0.1);
  border: 1px solid var(--ion-color-primary);
}

.song-track, .song-checkbox {
  width: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.song-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.song-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-name {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ion-color-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mv-icon {
  font-size: 14px;
  color: var(--ion-color-danger);
  flex-shrink: 0;
}

.song-meta {
  margin: 0;
  font-size: 13px;
  color: var(--ion-color-medium);
  display: flex;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.no-more-tip {
  text-align: center;
  padding: 24px;
  color: var(--ion-color-medium);
  font-size: 14px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .album-hero {
    min-height: 60vh;
    padding: var(--ion-safe-area-top) 16px 16px;
  }

  .album-cover {
    width: 100px;
    height: 100px;
  }

  .album-title {
    font-size: 18px;
  }

  .action-row {
    flex-wrap: wrap;
    gap: 12px;
  }

  .action-row ion-button {
    flex: 1;
    min-width: 80px;
  }

  .content-section {
    padding: 20px 16px 16px;
    margin-top: -16px;
  }
}

/* 适配安全区域 */
@supports (padding: max(0px)) {
  .album-hero {
    padding-top: max(var(--ion-safe-area-top), 20px);
  }
}
</style>
