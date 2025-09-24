<template>
  <IonPage>
    <IonContent :fullscreen="true" class="player-content">
      <!-- 全屏顶部控制栏 -->
      <div class="fullscreen-header">
        <button @click="closePlayer" class="close-btn">
          <IonIcon :icon="chevronDownOutline" />
        </button>
        <div class="header-title">正在播放</div>
        <button @click="showMore" class="more-btn">
          <IonIcon :icon="ellipsisHorizontalOutline" />
        </button>
      </div>

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

        <!-- 主要内容 - 垂直居中布局 -->
        <div class="player-main">
          <!-- 专辑封面区域 -->
          <div class="album-section">
            <div class="album-cover circular" :class="{ spinning: isPlaying }">
              <img
                :src="currentSong?.cover || '/images/album.jpg'"
                :alt="currentSong?.name"
                @error="handleImageError"
              />
            </div>
          </div>

          <!-- 歌曲信息区域 -->
          <div class="song-info-section">
            <h1 class="song-title">{{ currentSong?.name || '未知歌曲' }}</h1>
            <p class="artist-name">
              {{ currentSong?.artists?.map(a => a.name).join(', ') || '未知艺人' }}
            </p>
          </div>

          <!-- 功能按钮区域 - 进度条上方 -->
          <div class="action-section">
            <button class="action-btn" @click="toggleLike" :class="{ active: isLiked }">
              <IonIcon :icon="isLiked ? heart : heartOutline" />
            </button>

            <button class="action-btn" @click="showComments">
              <IonIcon :icon="chatbubbleOutline" />
            </button>

            <button class="action-btn" @click="showPlaylist">
              <IonIcon :icon="listOutline" />
            </button>

            <button class="action-btn" @click="shareSong">
              <IonIcon :icon="shareOutline" />
            </button>

            <button class="action-btn" @click="showMore">
              <IonIcon :icon="ellipsisHorizontalOutline" />
            </button>
          </div>

          <!-- 进度条区域 -->
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

          <!-- 播放控制区域 - 进度条下方 -->
          <div class="player-controls">
            <button
              class="control-btn secondary"
              @click="togglePlayMode"
              :title="getPlayModeText()"
            >
              <IonIcon :icon="getPlayModeIcon()" />
            </button>

            <button class="control-btn secondary" @click="prevSong" :disabled="!hasPrev">
              <IonIcon :icon="playSkipBackOutline" />
            </button>

            <button class="control-btn primary play-button" @click="togglePlay">
              <IonIcon :icon="isPlaying ? pause : play" />
            </button>

            <button class="control-btn secondary" @click="nextSong" :disabled="!hasNext">
              <IonIcon :icon="playSkipForwardOutline" />
            </button>

            <button class="control-btn secondary" @click="toggleVolume">
              <IonIcon :icon="getVolumeIcon()" />
            </button>
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
  reorderTwoOutline,
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
  const percent = event.detail.value
  const time = (percent / 100) * musicStore.duration
  musicStore.seekTo(time)
}

const togglePlay = () => {
  musicStore.togglePlay()
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
      return shuffleOutline // 随机播放
    case 'repeat':
      return repeatOutline // 单曲循环
    case 'order':
    default:
      return reorderTwoOutline // 顺序播放
  }
}

const getPlayModeText = () => {
  switch (musicStore.playMode) {
    case 'random':
      return '随机播放'
    case 'repeat':
      return '单曲循环'
    case 'order':
    default:
      return '顺序播放'
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
/* === 全屏播放器基础样式 === */
.full-player {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f9f4 0%, #e8f5ea 30%, #fafcfb 70%, #ffffff 100%);
}

.player-content {
  --padding-top: 0 !important;
  --padding-bottom: 0 !important;
  --background: transparent;
}

/* === 背景处理 === */
.player-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.player-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(30px) brightness(0.2) saturate(0.8);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(168, 230, 207, 0.15) 0%,
    rgba(136, 216, 163, 0.2) 30%,
    rgba(248, 253, 249, 0.3) 70%,
    rgba(255, 255, 255, 0.1) 100%
  );
  backdrop-filter: blur(10px);
}

/* === 顶部控制栏 === */
.fullscreen-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0));
  z-index: 100;
  padding-top: calc(var(--ion-safe-area-top) + 8px);
}

.close-btn, .more-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.2s ease;
}

.close-btn:hover, .more-btn:hover {
  color: white;
  transform: scale(1.1);
}

.header-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* === 主要内容布局 === */
.player-main {
  position: relative;
  z-index: 10;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 32px 40px;
  gap: 18px;
}

/* === 专辑封面区域 === */
.album-section {
  flex-shrink: 0;
}

.album-cover {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 8px rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.album-cover.spinning {
  animation: spin 20s linear infinite;
}

.album-cover:hover {
  transform: scale(1.02);
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.5),
    0 0 0 8px rgba(255, 255, 255, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.15);
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

/* === 歌曲信息区域 === */
.song-info-section {
  text-align: center;
  max-width: 90%;
  flex-shrink: 0;
  margin: 8px 0;
}

.song-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--s-text-primary);
  margin: 0 0 6px 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.artist-name {
  font-size: 16px;
  color: var(--s-text-secondary);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* === 进度条区域 === */
.progress-section {
  width: 100%;
  flex-shrink: 0;
  padding: 0 0;
}

.progress-container {
  margin-bottom: 6px;
}

.progress-container ion-range {
  --bar-background: rgba(255, 255, 255, 0.2);
  --bar-background-active: linear-gradient(90deg, var(--s-primary) 0%, var(--s-primary-accent) 100%);
  --knob-background: var(--s-primary);
  --knob-size: 16px;
  --bar-height: 3px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--s-text-tertiary);
  font-weight: 400;
  letter-spacing: 0.3px;
}

/* === 播放控制区域 === */
.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-shrink: 0;
  margin-top: 12px;
}

.control-btn {
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  outline: none;
  position: relative;
  color: rgba(255, 255, 255, 0.8);
}

.control-btn.secondary {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 20px;
}

.control-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: scale(1.05);
}

.control-btn.secondary:active:not(:disabled) {
  transform: scale(0.95);
}

.control-btn.secondary:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn.primary {
  width: 68px;
  height: 68px;
  background: var(--s-primary-light);
  color: var(--s-text-primary);
  font-size: 28px;
  box-shadow:
    0 6px 24px var(--s-shadow),
    0 0 0 3px rgba(255, 255, 255, 0.1);
}

.control-btn.primary:hover {
  transform: scale(1.05);
  box-shadow:
    0 8px 32px var(--s-shadow),
    0 0 0 3px rgba(255, 255, 255, 0.15);
}

.control-btn.primary:active {
  transform: scale(0.98);
}

/* === 功能按钮区域 === */
.action-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-shrink: 0;
  margin: 20px 0;
  padding: 0;
}

.action-btn {
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  transition: all 0.3s ease;
  outline: none;
  font-size: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.action-btn.active {
  background: rgba(168, 230, 207, 0.2);
  color: var(--s-primary);
  border-color: rgba(168, 230, 207, 0.3);
}

/* === 响应式设计 === */
@media (max-width: 480px) {
  .player-main {
    padding: 70px 24px 30px;
    gap: 16px;
  }

  .album-cover {
    width: 240px;
    height: 240px;
  }

  .song-title {
    font-size: 22px;
  }

  .artist-name {
    font-size: 15px;
  }

  .song-info-section {
    margin: 6px 0;
  }

  .action-section {
    margin: 16px 0;
    padding: 0;
  }

  .player-controls {
    gap: 20px;
    margin-top: 10px;
  }

  .control-btn.secondary {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .control-btn.primary {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }

  .action-btn {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .fullscreen-header {
    padding: 0 20px;
  }

  .close-btn, .more-btn {
    padding: 6px;
    font-size: 20px;
  }
}

@media (max-height: 700px) {
  .player-main {
    gap: 16px;
  }

  .album-cover {
    width: 200px;
    height: 200px;
  }

  .song-title {
    font-size: 22px;
  }

  .control-btn.primary {
    width: 70px;
    height: 70px;
  }
}
</style>
