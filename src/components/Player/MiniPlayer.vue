<template>
  <div v-if="musicStore.isHasPlayer" class="mini-player" :class="{ 'with-tabs': isInTabsLayout }">
    <!-- 进度条 -->
    <div class="progress-container">
      <div
        class="progress-bar"
        :style="{ width: progressPercent + '%' }"
      ></div>
    </div>

    <!-- 主要内容区域 - 三栏布局 -->
    <div class="player-main">
      <!-- 左侧：歌曲信息 -->
      <div class="song-section" @click="openFullPlayer">
        <!-- 歌曲封面 -->
        <div class="cover-container">
          <div class="cover">
            <img
              :src="currentSong.cover || '/images/album.jpg'"
              :alt="currentSong.name"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- 歌曲信息 -->
        <div class="song-info">
          <div class="song-name">{{ currentSong.name }}</div>
          <div class="artist-name">{{ currentSong.artists?.map(a => a.name).join(', ') }}</div>
        </div>
      </div>

      <!-- 中间：播放控制 -->
      <div class="control-section">
        <!-- 上一首 -->
        <button
          class="control-btn"
          @click.stop="prevSong"
          :disabled="!musicStore.hasPrev"
        >
          <IonIcon :icon="playSkipBackOutline" />
        </button>

        <!-- 播放/暂停 -->
        <button
          class="control-btn play-btn"
          @click.stop="togglePlay"
        >
          <IonIcon :icon="isPlaying ? pause : play" />
        </button>

        <!-- 下一首 -->
        <button
          class="control-btn"
          @click.stop="nextSong"
          :disabled="!musicStore.hasNext"
        >
          <IonIcon :icon="playSkipForwardOutline" />
        </button>
      </div>

      <!-- 右侧：功能按钮 -->
      <div class="function-section">
        <!-- 播放模式 -->
        <button
          class="control-btn function"
          @click.stop="togglePlayMode"
          :title="playModeText"
        >
          <IonIcon :icon="playModeIcon" />
        </button>

        <!-- 喜欢 -->
        <button
          class="control-btn function"
          @click.stop="toggleLike"
          :class="{ active: isLiked }"
        >
          <IonIcon :icon="isLiked ? heart : heartOutline" />
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  play,
  pause,
  heart,
  heartOutline,
  playSkipBackOutline,
  playSkipForwardOutline,
  repeat,
  shuffle,
  reorderTwo
} from 'ionicons/icons'
import { useMusicStore } from '@/stores/music'
import { useRouter } from 'vue-router'

const musicStore = useMusicStore()
const router = useRouter()



// 计算属性
const currentSong = computed(() => musicStore.currentSong)
const isPlaying = computed(() => musicStore.isPlaying)
const isLiked = computed(() => musicStore.isLiked(currentSong.value?.id))
const progressPercent = computed(() => musicStore.progress)

// 检测是否在tabs布局中（首页等）
const isInTabsLayout = computed(() => {
  return router.currentRoute.value.path.startsWith('/tabs')
})

// 播放模式相关
const playModeIcon = computed(() => {
  switch (musicStore.playMode) {
    case 'repeat':
      return repeat
    case 'random':
      return shuffle
    default:
      return reorderTwo // 顺序播放
  }
})

const playModeText = computed(() => {
  switch (musicStore.playMode) {
    case 'repeat':
      return '单曲循环'
    case 'random':
      return '随机播放'
    default:
      return '顺序播放'
  }
})



// 方法
const togglePlay = () => {
  if (!currentSong.value) {
    musicStore.setTestSong()
    return
  }
  musicStore.togglePlay()
}

const nextSong = () => {
  musicStore.nextSong()
}

const prevSong = () => {
  musicStore.prevSong()
}

const toggleLike = () => {
  if (currentSong.value) {
    musicStore.toggleLike(currentSong.value.id)
  }
}

const togglePlayMode = () => {
  musicStore.togglePlayMode()
}



const openFullPlayer = () => {
  router.push('/player')
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}


</script>

<style scoped>
/* === 主容器设计 === */
.mini-player {
  position: fixed;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 1000;
  background: var(--ion-color-step-50, #f8f9fa);
  border-top: 1px solid var(--ion-color-step-150, #e0e0e0);
  backdrop-filter: blur(20px);
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  /* 默认紧贴底部（二级页面） */
  bottom: 0;

  /* 在tabs布局中，留出底部导航栏空间 */
  &.with-tabs {
    bottom: calc(50px + var(--ion-safe-area-bottom));
  }
}

/* === 进度条设计 === */
.progress-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--ion-color-step-100, #f0f0f0);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--ion-color-primary, #3880ff);
  transition: width 0.2s ease;
  position: relative;
}

/* === 主要布局 === */
.player-main {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  gap: 8px;
}

/* === 歌曲信息区域 === */
.song-section {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
  cursor: pointer;
  padding: 8px 0;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.song-section:active {
  background: var(--ion-color-step-50, rgba(0, 0, 0, 0.04));
}

/* === 封面设计 === */
.cover-container {
  flex-shrink: 0;
}

.cover {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}



/* === 歌曲信息设计 === */
.song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-step-850, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.artist-name {
  font-size: 12px;
  color: var(--ion-color-step-600, #666);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

/* === 控制区域 === */
.control-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* === 功能区域 === */
.function-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* === 按钮基础样式 === */
.control-btn {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  width: 36px;
  height: 36px;
  font-size: 18px;
  color: var(--ion-color-step-600, #666);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn:not(:disabled):active {
  transform: scale(0.9);
  background: var(--ion-color-step-100, rgba(0, 0, 0, 0.05));
}

/* === 播放按钮 === */
.control-btn.play-btn {
  width: 40px;
  height: 40px;
  background: var(--ion-color-primary, #3880ff);
  color: white;
  font-size: 20px;
}

.control-btn.play-btn:not(:disabled):active {
  background: var(--ion-color-primary-shade, #3171e0);
}

/* === 功能按钮 === */
.control-btn.function {
  width: 32px;
  height: 32px;
  font-size: 16px;
}

.control-btn.function.active {
  color: var(--ion-color-primary, #3880ff);
}


</style>
