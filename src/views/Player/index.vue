<template>
  <IonPage>
    <IonHeader class="player-header">
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton @click="closePlayer">
            <IonIcon :icon="chevronDownOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle>正在播放</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="showMore">
            <IonIcon :icon="ellipsisHorizontalOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="player-content">
      <div class="full-player">
        <!-- 背景模糊图 -->
        <div class="player-background">
          <img
            :src="currentSong?.cover || '/images/album.jpg'"
            :alt="currentSong?.name"
            @error="handleImageError"
          />
          <div class="background-overlay"></div>
        </div>

        <!-- 主要内容 -->
        <div class="player-main">
          <!-- 专辑封面 -->
          <div class="album-cover-container">
            <div class="album-cover" :class="{ spinning: isPlaying }">
              <img
                :src="currentSong?.cover || '/images/album.jpg'"
                :alt="currentSong?.name"
                @error="handleImageError"
              />
            </div>
          </div>

          <!-- 歌曲信息 -->
          <div class="song-info">
            <h1 class="song-title">{{ currentSong?.name || '未知歌曲' }}</h1>
            <p class="artist-name">
              {{ currentSong?.artists?.map(a => a.name).join(', ') || '未知艺人' }}
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <IonButton
              fill="clear"
              size="large"
              @click="toggleLike"
              :color="isLiked ? 'primary' : 'medium'"
            >
              <IonIcon :icon="isLiked ? heart : heartOutline" />
            </IonButton>

            <IonButton fill="clear" size="large" @click="showComments">
              <IonIcon :icon="chatbubbleOutline" />
            </IonButton>

            <IonButton fill="clear" size="large" @click="showPlaylist">
              <IonIcon :icon="listOutline" />
            </IonButton>

            <IonButton fill="clear" size="large" @click="shareSong">
              <IonIcon :icon="shareOutline" />
            </IonButton>
          </div>

          <!-- 进度条 -->
          <div class="progress-section">
            <div class="progress-container">
              <IonRange
                :value="progressPercent"
                :min="0"
                :max="100"
                @ionInput="handleSeek"
                @ionStart="seeking = true"
                @ionEnd="seeking = false"
              />
            </div>
            <div class="time-display">
              <span class="current-time">{{ currentTimeFormatted }}</span>
              <span class="total-time">{{ durationFormatted }}</span>
            </div>
          </div>

          <!-- 播放控制 -->
          <div class="player-controls">
            <IonButton fill="clear" size="large" @click="togglePlayMode">
              <IonIcon :icon="getPlayModeIcon()" />
            </IonButton>

            <IonButton fill="clear" size="large" @click="prevSong" :disabled="!hasPrev">
              <IonIcon :icon="playSkipBackOutline" />
            </IonButton>

            <IonButton
              class="play-button"
              fill="solid"
              size="large"
              @click="togglePlay"
            >
              <IonIcon :icon="isPlaying ? pause : play" />
            </IonButton>

            <IonButton fill="clear" size="large" @click="nextSong" :disabled="!hasNext">
              <IonIcon :icon="playSkipForwardOutline" />
            </IonButton>

            <IonButton fill="clear" size="large" @click="toggleVolume">
              <IonIcon :icon="getVolumeIcon()" />
            </IonButton>
          </div>
        </div>

        <!-- 底部标签页 -->
        <div class="player-tabs">
          <IonSegment v-model="activeTab" @ionChange="handleTabChange">
            <IonSegmentButton value="player">
              <IonLabel>播放器</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="lyric">
              <IonLabel>歌词</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="playlist">
              <IonLabel>列表</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <!-- 标签页内容 -->
        <div class="tab-content" v-show="activeTab === 'lyric'">
          <div class="lyric-container">
            <div class="lyric-line" v-for="(line, index) in lyrics" :key="index">
              {{ line }}
            </div>
          </div>
        </div>

        <div class="tab-content" v-show="activeTab === 'playlist'">
          <div class="playlist-container">
            <div class="playlist-header">
              <h3>播放列表 ({{ playlist.length }})</h3>
              <IonButton fill="clear" size="small" @click="clearPlaylist">
                清空列表
              </IonButton>
            </div>
            <div class="playlist-list">
              <div
                v-for="(song, index) in playlist"
                :key="song.id"
                class="playlist-item"
                :class="{ active: index === currentIndex }"
                @click="playSongAtIndex(index)"
              >
                <div class="song-index">{{ index + 1 }}</div>
                <div class="song-info">
                  <h4 class="song-name">{{ song.name }}</h4>
                  <p class="song-artist">{{ song.artists?.map(a => a.name).join(', ') }}</p>
                </div>
                <IonButton fill="clear" size="small" @click.stop="removeSongFromPlaylist(index)">
                  <IonIcon :icon="closeOutline" />
                </IonButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonRange,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/vue'
import {
  chevronDownOutline,
  ellipsisHorizontalOutline,
  heart,
  heartOutline,
  chatbubbleOutline,
  listOutline,
  shareOutline,
  play,
  pause,
  playSkipBackOutline,
  playSkipForwardOutline,
  shuffleOutline,
  repeatOutline,
  volumeHighOutline,
  volumeMediumOutline,
  volumeLowOutline,
  volumeMuteOutline,
  closeOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'

const router = useRouter()
const musicStore = useMusicStore()

// 响应式状态
const activeTab = ref('player')
const seeking = ref(false)
const lyrics = ref([
  '暂无歌词',
  '请欣赏美妙的音乐'
])

// 计算属性
const currentSong = computed(() => musicStore.currentSong)
const playlist = computed(() => musicStore.playlist)
const currentIndex = computed(() => musicStore.currentIndex)
const isPlaying = computed(() => musicStore.isPlaying)
const isLiked = computed(() => musicStore.isLiked(currentSong.value?.id))
const hasPrev = computed(() => musicStore.hasPrev)
const hasNext = computed(() => musicStore.hasNext)
const progressPercent = computed(() => musicStore.progress)
const currentTimeFormatted = computed(() => formatTime(musicStore.currentTime))
const durationFormatted = computed(() => formatTime(musicStore.duration))

// 方法
const closePlayer = () => {
  router.back()
}

const showMore = () => {
  // TODO: 显示更多操作菜单
  console.log('显示更多操作')
}

const toggleLike = () => {
  if (currentSong.value) {
    musicStore.toggleLike(currentSong.value.id)
  }
}

const showComments = () => {
  // TODO: 显示评论
  console.log('显示评论')
}

const showPlaylist = () => {
  activeTab.value = 'playlist'
}

const shareSong = () => {
  // TODO: 分享歌曲
  console.log('分享歌曲')
}

const handleSeek = (event: CustomEvent) => {
  if (!seeking.value) return
  const percent = event.detail.value
  const time = (percent / 100) * playerStore.duration
  playerStore.seek(time)
}

const togglePlay = () => {
  if (isPlaying.value) {
    playerStore.pause()
  } else {
    playerStore.play()
  }
}

const prevSong = () => {
  musicStore.prevSong()
}

const nextSong = () => {
  musicStore.nextSong()
}

const togglePlayMode = () => {
  musicStore.togglePlayMode()
}

const toggleVolume = () => {
  musicStore.toggleMute()
}

const getPlayModeIcon = () => {
  switch (musicStore.playMode) {
    case 'random':
      return shuffleOutline
    case 'repeat':
      return repeatOutline
    default:
      return listOutline
  }
}

const getVolumeIcon = () => {
  const volume = musicStore.volume
  if (volume === 0 || musicStore.isMuted) return volumeMuteOutline
  if (volume < 0.3) return volumeLowOutline
  if (volume < 0.7) return volumeMediumOutline
  return volumeHighOutline
}

const handleTabChange = (event: CustomEvent) => {
  activeTab.value = event.detail.value
}

const playSongAtIndex = (index: number) => {
  musicStore.currentIndex = index
  musicStore.setCurrentSong(playlist.value[index])
}

const removeSongFromPlaylist = (index: number) => {
  // TODO: 从播放列表移除歌曲
  console.log('移除歌曲', index)
}

const clearPlaylist = () => {
  // TODO: 清空播放列表
  console.log('清空播放列表')
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.full-player {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
}

.player-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.player-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px) brightness(0.3);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

.player-header {
  --background: transparent;
  --color: white;
}

.player-header ion-toolbar {
  --background: transparent;
  --color: white;
}

.player-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  justify-content: center;
}

.album-cover-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.album-cover {
  width: 280px;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

.album-cover.spinning {
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  text-align: center;
  margin-bottom: 24px;
}

.song-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.artist-name {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
}

.action-buttons ion-button {
  --color: white;
  --background: transparent;
}

.progress-section {
  margin-bottom: 32px;
}

.progress-container {
  margin-bottom: 12px;
}

.progress-container ion-range {
  --bar-background: rgba(255, 255, 255, 0.3);
  --bar-background-active: white;
  --knob-background: white;
  --knob-size: 20px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  opacity: 0.8;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.player-controls ion-button {
  --color: white;
  --background: transparent;
}

.play-button {
  --background: white;
  --color: var(--s-primary);
  --border-radius: 50%;
  width: 64px;
  height: 64px;
}

.player-tabs {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.player-tabs ion-segment {
  --background: transparent;
}

.player-tabs ion-segment-button {
  --color: rgba(255, 255, 255, 0.6);
  --color-checked: white;
  --indicator-color: white;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.lyric-container {
  padding: 20px;
  text-align: center;
  overflow-y: auto;
  height: 100%;
}

.lyric-line {
  font-size: 18px;
  line-height: 2;
  margin: 16px 0;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.lyric-line.active {
  opacity: 1;
  font-weight: bold;
}

.playlist-container {
  padding: 20px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.playlist-header h3 {
  margin: 0;
  font-size: 18px;
}

.playlist-header ion-button {
  --color: white;
}

.playlist-list {
  flex: 1;
  overflow-y: auto;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.2s ease;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.playlist-item.active {
  background: rgba(255, 255, 255, 0.2);
}

.song-index {
  width: 32px;
  text-align: center;
  font-size: 14px;
  opacity: 0.6;
}

.playlist-item .song-info {
  flex: 1;
  text-align: left;
  margin: 0;
}

.playlist-item .song-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.playlist-item .song-artist {
  font-size: 12px;
  opacity: 0.6;
  margin: 0;
}

.playlist-item ion-button {
  --color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 480px) {
  .album-cover {
    width: 240px;
    height: 240px;
  }

  .song-title {
    font-size: 20px;
  }

  .action-buttons {
    gap: 24px;
  }

  .player-controls {
    gap: 16px;
  }

  .play-button {
    width: 56px;
    height: 56px;
  }
}
</style>
