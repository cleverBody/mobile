<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton default-href="/tabs/radio" />
        </IonButtons>
        <IonTitle>{{ categoryName || '电台分类' }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="category-page">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <IonSpinner></IonSpinner>
          <p>加载中...</p>
        </div>

        <!-- 电台列表 -->
        <div v-else-if="stations.length > 0" class="stations-grid">
          <div
            v-for="station in stations"
            :key="station.id"
            class="station-card"
            @click="goToStation(station.id)"
          >
            <div class="station-cover">
              <img
                :src="station.picUrl"
                :alt="station.name"
                @error="handleImageError"
              />
              <div class="play-button">
                <IonIcon :icon="play" />
              </div>
            </div>
            <div class="station-info">
              <h3 class="station-name">{{ station.name }}</h3>
              <p class="station-desc">{{ station.description }}</p>
              <div class="station-meta">
                <span v-if="station.dj" class="dj-name">{{ station.dj.nickname }}</span>
                <div class="station-stats">
                  <span v-if="station.subCount" class="stat-item">
                    <IonIcon :icon="peopleOutline" />
                    {{ formatCount(station.subCount) }}
                  </span>
                  <span v-if="station.programCount" class="stat-item">
                    <IonIcon :icon="albumsOutline" />
                    {{ station.programCount }}期
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
          <IonIcon :icon="radioOutline" />
          <p>暂无电台</p>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore && !loading" class="load-more">
          <IonButton fill="outline" @click="loadMore">加载更多</IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonSpinner
} from '@ionic/vue'
import {
  play,
  peopleOutline,
  albumsOutline,
  radioOutline
} from 'ionicons/icons'
import { useRoute, useRouter } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import type { RadioStation } from '@/api/radio'

const route = useRoute()
const router = useRouter()
const radioStore = useRadioStore()

// 响应式数据
const stations = ref<RadioStation[]>([])
const loading = ref(false)
const hasMore = ref(true)
const offset = ref(0)
const limit = 20

// 计算属性
const categoryId = computed(() => Number(route.params.id))
const categoryName = computed(() => route.query.name as string)

// 方法
const loadStations = async (loadMore = false) => {
  if (loading.value) return

  loading.value = true
  
  try {
    const currentOffset = loadMore ? offset.value : 0
    // 调用正确的API方法，传入offset参数
    const result = await radioStore.loadCategoryStations(categoryId.value, limit, currentOffset)
    
    if (loadMore) {
      stations.value = [...stations.value, ...result]
    } else {
      stations.value = result
      offset.value = 0
    }
    
    offset.value = currentOffset + limit
    hasMore.value = result.length === limit
    
  } catch (error) {
    console.error('加载分类电台失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadStations(true)
}

const goToStation = (stationId: number) => {
  router.push(`/radio/station/${stationId}`)
}

const formatCount = (count?: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // 使用更合适的电台默认图片
  target.src = '/images/radio-default.png'
  // 如果默认图片也不存在，使用通用默认图片
  target.onerror = () => {
    target.src = '/images/album.jpg'
  }
}

// 生命周期
onMounted(() => {
  loadStations()
})
</script>

<style scoped>
.category-page {
  padding: 16px;
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

.stations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.station-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.station-card:active {
  transform: scale(0.95);
}

.station-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.station-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.station-card:hover .play-button {
  opacity: 1;
}

.station-info {
  padding: 0 4px;
}

.station-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--ion-color-step-800);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.station-desc {
  font-size: 12px;
  color: var(--ion-color-step-600);
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.station-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dj-name {
  font-size: 11px;
  color: var(--ion-color-primary);
  font-weight: 500;
}

.station-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--ion-color-step-600);
}

.stat-item ion-icon {
  font-size: 14px;
}

.load-more {
  margin-top: 32px;
  text-align: center;
}

@media (max-width: 480px) {
  .stations-grid {
    grid-template-columns: 1fr;
  }
}
</style>