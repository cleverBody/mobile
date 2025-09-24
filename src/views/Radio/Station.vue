<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton default-href="/tabs/radio" text="" />
        </IonButtons>
        <IonTitle>电台详情</IonTitle>
        <IonButtons slot="end">
          <IonButton fill="clear" @click="toggleSubscribe" v-if="currentStation">
            <IonIcon :icon="isSubscribed ? heart : heartOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="station-page">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <IonSpinner></IonSpinner>
          <p>加载中...</p>
        </div>

        <!-- 电台信息 -->
        <div v-else-if="currentStation" class="station-header">
          <div class="station-cover">
            <img
              :src="currentStation.picUrl"
              :alt="currentStation.name"
              @error="handleImageError"
            />
          </div>

          <div class="station-info">
            <h1 class="station-name">{{ currentStation.name }}</h1>
            <p class="station-desc">{{ currentStation.description }}</p>

            <div class="station-meta">
              <div v-if="currentStation.dj" class="dj-info">
                <img
                  :src="currentStation.dj.avatarUrl"
                  :alt="currentStation.dj.nickname"
                  class="dj-avatar"
                  @error="handleImageError"
                />
                <span class="dj-name">{{ currentStation.dj.nickname }}</span>
              </div>

              <div class="station-stats">
                <span v-if="currentStation.subCount" class="stat-item">
                  <IonIcon :icon="peopleOutline" />
                  {{ formatCount(currentStation.subCount) }}订阅
                </span>
                <span v-if="currentStation.programCount" class="stat-item">
                  <IonIcon :icon="albumsOutline" />
                  {{ currentStation.programCount }}期节目
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 节目列表 -->
        <div v-if="currentPrograms.length > 0" class="programs-section">
          <div class="section-header">
            <h2 class="section-title">节目列表</h2>
            <div class="play-all-button" @click="playFirstProgram">
              <IonIcon :icon="play" />
              <span>播放全部</span>
            </div>
          </div>

          <div class="programs-list">
            <div
              v-for="(program, index) in currentPrograms"
              :key="program.id"
              class="program-item"
              @click="playProgram(program)"
            >
              <div class="program-index">{{ index + 1 }}</div>
              <div class="program-cover">
                <img
                  :src="program.picUrl"
                  :alt="program.name"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
              </div>
              <div class="program-info">
                <h3 class="program-name">{{ program.name }}</h3>
                <p class="program-desc">{{ program.description }}</p>
                <div class="program-meta">
                  <span class="program-duration">{{ formatDuration(program.duration) }}</span>
                  <span class="program-date">{{ formatDate(program.createTime) }}</span>
                  <span v-if="program.playCount" class="program-plays">
                    {{ formatCount(program.playCount) }}次播放
                  </span>
                </div>
              </div>
              <IonButton fill="clear" size="small">
                <IonIcon :icon="playOutline" />
              </IonButton>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-container">
          <IonIcon :icon="albumsOutline" />
          <p>暂无节目</p>
        </div>

        <!-- 无限滚动 -->
        <IonInfiniteScroll
          @ionInfinite="onInfiniteScroll"
          threshold="100px"
          :disabled="!hasMorePrograms"
          v-if="programs.length > 0"
        >
          <IonInfiniteScrollContent
            loading-spinner="bubbles"
            loading-text="加载更多节目..."
          >
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>

        <!-- 没有更多提示 -->
        <div v-if="!hasMorePrograms && programs.length > 0" class="no-more">
          已显示全部节目
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue'
import {
  play,
  playOutline,
  heart,
  heartOutline,
  peopleOutline,
  albumsOutline
} from 'ionicons/icons'
import { useRoute } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import { useMusicStore } from '@/stores/music'
import type { RadioProgram } from '@/api/radio'

const route = useRoute()
const radioStore = useRadioStore()
const musicStore = useMusicStore()

// 计算属性
const stationId = computed(() => Number(route.params.id))
const currentStation = computed(() => radioStore.currentStation)
const currentPrograms = computed(() => radioStore.currentPrograms)
const loading = computed(() => radioStore.loading)
const loadingMorePrograms = computed(() => radioStore.loadingMorePrograms)
const hasMorePrograms = computed(() => radioStore.hasMorePrograms)
const isSubscribed = computed(() => radioStore.isSubscribed(stationId.value))

// 为了模板中使用方便，创建别名
const programs = currentPrograms

// 方法
const toggleSubscribe = () => {
  radioStore.toggleSubscribe(stationId.value)
}

const playFirstProgram = () => {
  if (currentPrograms.value.length > 0) {
    playProgram(currentPrograms.value[0])
  }
}

const playProgram = async (program: RadioProgram) => {
  // 转换为音乐格式播放
  const song = {
    id: program.id,
    name: program.name,
    artists: [{ id: 0, name: currentStation.value?.dj?.nickname || '未知主播' }],
    album: { id: stationId.value, name: currentStation.value?.name || '电台节目' },
    cover: program.picUrl,
    duration: program.duration,
    url: program.url
  }

  await musicStore.setCurrentSong(song)
  await musicStore.setPlaylist([song], 0)
}

const formatCount = (count?: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const formatDuration = (duration?: number) => {
  if (!duration) return '00:00'
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  console.log(`❌ [电台详情] 图片加载失败: ${target.src}`)
  target.src = '/images/album.jpg'
}

const handleImageLoad = (event: Event) => {
  const target = event.target as HTMLImageElement
  console.log(`✅ [电台详情] 图片加载成功: ${target.src}`)
}

// 无限滚动处理
const onInfiniteScroll = async (ev: any) => {
  console.log(`🔄 [电台详情] 触发无限滚动, hasMore=${hasMorePrograms.value}, loadingMore=${loadingMorePrograms.value}`)
  if (hasMorePrograms.value && !loadingMorePrograms.value) {
    await radioStore.loadMorePrograms(stationId.value)
  }
  ev.target.complete()
}

// 生命周期
onMounted(() => {
  radioStore.loadStationDetail(stationId.value)
})
</script>

<style scoped>
.station-page {
  padding-bottom: 120px;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-container p,
.empty-container p {
  margin: 12px 0;
  color: var(--ion-color-step-600);
}

.empty-container ion-icon {
  font-size: 64px;
  color: var(--ion-color-step-400);
  margin-bottom: 16px;
}

.station-header {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-tint));
  color: white;
}

.station-cover {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.station-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.play-all-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--ion-color-primary);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.3);
}

.play-all-button:active {
  transform: scale(0.95);
}

.station-info {
  text-align: center;
}

.station-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.station-desc {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.station-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.dj-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dj-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.dj-name {
  font-size: 16px;
  font-weight: 500;
}

.station-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  opacity: 0.9;
}

.stat-item ion-icon {
  font-size: 16px;
}

.programs-section {
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: var(--ion-color-step-800);
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.program-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--ion-color-step-50);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.program-item:active {
  background: var(--ion-color-step-100);
  transform: scale(0.98);
}

.program-index {
  width: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-right: 12px;
  flex-shrink: 0;
}

.program-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.program-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.program-info {
  flex: 1;
  min-width: 0;
}

.program-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--ion-color-step-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.program-desc {
  font-size: 12px;
  color: var(--ion-color-step-600);
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.program-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--ion-color-step-500);
}

.program-duration {
  font-weight: 500;
}

.no-more {
  text-align: center;
  padding: 20px;
  color: var(--ion-color-step-500);
  font-size: 14px;
}

@media (max-width: 480px) {
  .station-cover {
    width: 160px;
    height: 160px;
  }

  .station-name {
    font-size: 20px;
  }

  .station-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
