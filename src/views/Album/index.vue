<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/discover"></ion-back-button>
        </ion-buttons>
        <ion-title>专辑详情</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="shareAlbum">
            <ion-icon :icon="shareOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="album-content">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>加载中...</p>
      </div>

      <div v-else-if="currentAlbum" class="album-detail">
        <!-- 专辑信息 -->
        <div class="album-header">
          <div class="album-cover">
            <img :src="currentAlbum.cover" :alt="currentAlbum.name" />
            <div class="play-button" @click="playAll">
              <ion-icon :icon="play"></ion-icon>
            </div>
          </div>
          <div class="album-info">
            <h1 class="album-name">{{ currentAlbum.name }}</h1>
            <div class="album-artist" @click="goToArtist(currentAlbum.artistId)">
              {{ currentAlbum.artist }}
            </div>
            <div class="album-stats">
              <span>{{ currentAlbum.publishTime }}</span>
              <span>{{ currentAlbum.songsCount }}首</span>
              <span v-if="currentAlbum.playCount">{{ formatNumber(currentAlbum.playCount) }}播放</span>
            </div>
            <div class="album-actions">
              <ion-button
                :color="currentAlbum.isSubscribed ? 'medium' : 'primary'"
                size="small"
                @click="handleSubscribe"
              >
                <ion-icon :icon="currentAlbum.isSubscribed ? checkmarkCircle : addCircle" slot="start"></ion-icon>
                {{ currentAlbum.isSubscribed ? '已收藏' : '收藏' }}
              </ion-button>
              <ion-button size="small" fill="outline" @click="downloadAlbum">
                <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
                下载
              </ion-button>
            </div>
          </div>
        </div>

        <!-- 专辑简介 -->
        <div v-if="currentAlbum.description" class="album-description">
          <h3>专辑简介</h3>
          <div class="description-content">
            <p :class="{ 'description-collapsed': !descriptionExpanded }">
              {{ currentAlbum.description }}
            </p>
            <div v-if="currentAlbum.description.length > 100" class="description-toggle" @click="descriptionExpanded = !descriptionExpanded">
              {{ descriptionExpanded ? '收起' : '展开' }}
              <ion-icon :icon="descriptionExpanded ? chevronUp : chevronDown"></ion-icon>
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
            <ion-button fill="clear" size="small" @click="playAll">
              <ion-icon :icon="play" slot="start"></ion-icon>
              播放全部
            </ion-button>
            <ion-button fill="clear" size="small" @click="selectMode = !selectMode">
              <ion-icon :icon="selectMode ? close : ellipsisVertical" slot="start"></ion-icon>
              {{ selectMode ? '取消' : '管理' }}
            </ion-button>
          </div>
        </div>

        <!-- 批量操作栏 -->
        <div v-if="selectMode && selectedSongs.length > 0" class="batch-actions">
          <span>已选择 {{ selectedSongs.length }} 首</span>
          <div class="batch-buttons">
            <ion-button size="small" fill="outline" @click="batchPlay">播放</ion-button>
            <ion-button size="small" fill="outline" @click="batchAddToPlaylist">添加到歌单</ion-button>
            <ion-button size="small" fill="outline" @click="batchDownload">下载</ion-button>
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
              <ion-checkbox
                :checked="selectedSongs.includes(song.id)"
                @ionChange="toggleSongSelection(song.id)"
              ></ion-checkbox>
            </div>
            <div v-else class="song-track">{{ song.track }}</div>

            <div class="song-info" @click="selectMode ? toggleSongSelection(song.id) : playSong(song, index)">
              <div class="song-details">
                <h4 class="song-name">
                  {{ song.name }}
                  <ion-icon v-if="song.mv" :icon="videocamOutline" class="mv-icon"></ion-icon>
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
              <ion-button fill="clear" size="small" @click="showSongMenu(song, index)">
                <ion-icon :icon="ellipsisVertical"></ion-icon>
              </ion-button>
            </div>
          </div>

          <!-- 没有更多了提示 -->
          <div v-if="albumSongs.length > 0" class="no-more-tip">
            <span>没有更多了</span>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonSpinner, IonCheckbox,
  actionSheetController, toastController
} from '@ionic/vue'
import {
  play, addCircle, checkmarkCircle, ellipsisVertical, shareOutline,
  downloadOutline, videocamOutline, close, chevronUp, chevronDown
} from 'ionicons/icons'
import { useAlbumStore } from '../../stores/album'
import { useMusicStore } from '../../stores/music'

const route = useRoute()
const router = useRouter()
const albumStore = useAlbumStore()
const musicStore = useMusicStore()

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
</script>

<style scoped>
.album-content {
  --padding-bottom: 120px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.album-detail {
  padding: 0;
}

.album-header {
  display: flex;
  padding: 20px;
  background: linear-gradient(135deg, var(--s-primary), var(--s-primary-accent));
  color: white;
  gap: 16px;
  position: relative;
}

.album-cover {
  flex-shrink: 0;
  position: relative;
}

.album-cover img {
  width: 140px;
  height: 140px;
  border-radius: 12px;
  object-fit: cover;
}

.play-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--s-primary);
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(168, 230, 207, 0.3);
}

.album-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.album-name {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  line-height: 1.3;
}

.album-artist {
  font-size: 16px;
  opacity: 0.9;
  cursor: pointer;
  text-decoration: underline;
}

.album-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.album-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.album-description {
  padding: 20px;
  border-bottom: 1px solid var(--ion-color-step-150);
}

.album-description h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.album-description .description-content {
  position: relative;
}

.album-description p {
  margin: 0;
  line-height: 1.6;
  color: var(--ion-color-step-600);
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
  margin-top: 8px;
  padding: 8px;
  color: var(--s-primary);
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.description-toggle:hover {
  opacity: 0.8;
}

.songs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ion-color-step-150);
}

.songs-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.songs-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.songs-count {
  font-size: 12px;
  color: var(--ion-color-step-600);
}

.songs-actions {
  display: flex;
  gap: 8px;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--ion-color-step-50);
  border-bottom: 1px solid var(--ion-color-step-150);
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

.songs-list {
  padding: 0 20px;
  padding-bottom: 0;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-color-step-100);
  gap: 16px;
  transition: background-color 0.2s;
}

.song-item.song-selected {
  background-color: var(--ion-color-step-50);
}

.song-track, .song-checkbox {
  width: 30px;
  text-align: center;
  font-size: 14px;
  color: var(--ion-color-step-600);
}

.song-info {
  flex: 1;
  cursor: pointer;
}

.song-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mv-icon {
  font-size: 14px;
  color: var(--ion-color-danger);
}

.song-meta {
  margin: 0;
  font-size: 12px;
  color: var(--ion-color-step-600);
  display: flex;
  gap: 8px;
}

.song-actions {
  display: flex;
  align-items: center;
}

.no-more-tip {
  text-align: center;
  padding: 20px;
  color: var(--ion-color-medium);
  font-size: 14px;
  position: relative;
  margin: 20px 0;
  margin-bottom: -100px; /* 抵消ion-content的底部padding */
}

.no-more-tip span {
  position: relative;
  background: var(--ion-background-color);
  padding: 0 16px;
  z-index: 1;
}

.no-more-tip::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  height: 1px;
  background: var(--ion-color-step-150);
  z-index: 0;
}
</style>
