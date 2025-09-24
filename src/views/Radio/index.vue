<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>播客电台</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="radio-page">
        <!-- 搜索栏 -->
        <div class="search-section">
          <div class="search-bar" @click="openSearch">
            <IonIcon :icon="searchOutline" />
            <span class="search-placeholder">搜索播客电台</span>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="radioStore.loading && radioStore.categories.length === 0" class="loading-container">
          <IonSpinner></IonSpinner>
          <p>加载中...</p>
        </div>

        <!-- 电台分类 -->
        <section v-if="radioStore.categories.length > 0" class="content-section">
          <div class="section-header">
            <h2 class="section-title">电台分类</h2>
            <IonButton v-if="radioStore.categories.length > 8" fill="clear" size="small" @click="toggleCategories">
              {{ showAllCategories ? '收起' : '更多' }}
              <IonIcon :icon="showAllCategories ? chevronUpOutline : chevronForwardOutline" />
            </IonButton>
          </div>

          <div class="category-grid">
            <div
              v-for="category in displayCategories"
              :key="category.id"
              class="category-card"
              @click="goToCategory(category.id, category.name)"
            >
              <div class="category-icon">
                <IonIcon :icon="radioOutline" />
              </div>
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
        </section>

        <!-- 热门推荐 -->
        <section v-if="radioStore.hotStations.length > 0" class="content-section">
          <div class="section-header">
            <h2 class="section-title">热门推荐</h2>
            <IonButton fill="clear" size="small" @click="goToHotStations">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>

          <div class="station-grid">
            <div
              v-for="station in radioStore.hotStations.slice(0, 6)"
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
        </section>

        <!-- 推荐电台 -->
        <section v-if="radioStore.recommendStations.length > 0" class="content-section">
          <div class="section-header">
            <h2 class="section-title">为你推荐</h2>
            <IonButton fill="clear" size="small" @click="goToRecommendStations">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>

          <div class="recommend-list">
            <div
              v-for="(station, index) in radioStore.recommendStations.slice(0, 8)"
              :key="station.id"
              class="recommend-item"
              @click="goToStation(station.id)"
            >
              <div class="rank-number">{{ index + 1 }}</div>
              <div class="station-cover-small">
                <img
                  :src="station.picUrl"
                  :alt="station.name"
                  @error="handleImageError"
                />
              </div>
              <div class="recommend-info">
                <h3 class="recommend-name">{{ station.name }}</h3>
                <p class="recommend-dj">{{ station.dj?.nickname || '未知主播' }}</p>
              </div>
              <IonButton fill="clear" size="small">
                <IonIcon :icon="playOutline" />
              </IonButton>
            </div>
          </div>
        </section>

        <!-- 分类推荐 -->
        <section
          v-for="categoryRec in radioStore.categoryRecommends.slice(0, 3)"
          :key="categoryRec.id"
          class="content-section"
        >
          <div class="section-header">
            <h2 class="section-title">{{ categoryRec.name }}</h2>
            <IonButton fill="clear" size="small" @click="goToCategory(categoryRec.id, categoryRec.name)">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>

          <div class="horizontal-scroll">
            <div
              v-for="station in categoryRec.stations?.slice(0, 6)"
              :key="station.id"
              class="horizontal-card"
              @click="goToStation(station.id)"
            >
              <div class="horizontal-cover">
                <img
                  :src="station.picUrl"
                  :alt="station.name"
                  @error="handleImageError"
                />
                <div class="mini-play-button">
                  <IonIcon :icon="play" />
                </div>
              </div>
              <h3 class="horizontal-name">{{ station.name }}</h3>
            </div>
          </div>
        </section>

        <!-- 错误状态 -->
        <div v-if="radioStore.error && !radioStore.loading" class="error-container">
          <IonIcon :icon="alertCircleOutline" />
          <p>{{ radioStore.error }}</p>
          <IonButton @click="refresh">重试</IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner
} from '@ionic/vue'
import {
  searchOutline,
  radioOutline,
  chevronUpOutline,
  chevronDownOutline,
  chevronForwardOutline,
  play,
  playOutline,
  peopleOutline,
  albumsOutline,
  alertCircleOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useRadioStore } from '@/stores/radio'

const router = useRouter()
const radioStore = useRadioStore()

// 响应式数据
const showAllCategories = ref(false)

// 计算属性 - 不要解构，保持响应式
const displayCategories = computed(() => {
  if (showAllCategories.value) {
    return radioStore.categories
  }
  return radioStore.categories.slice(0, 8)
})

// 方法
const openSearch = () => {
  router.push('/search')
}

const toggleCategories = () => {
  showAllCategories.value = !showAllCategories.value
}

const goToCategory = (categoryId: number, categoryName: string) => {
  router.push({
    path: `/radio/category/${categoryId}`,
    query: { name: categoryName }
  })
}

const goToStation = (stationId: number) => {
  router.push(`/radio/station/${stationId}`)
}

const goToHotStations = () => {
  // 跳转到热门推荐页面，使用一个通用的热门分类ID
  router.push({
    path: '/radio/category/0',
    query: { name: '热门推荐', type: 'hot' }
  })
}

const goToRecommendStations = () => {
  // 跳转到推荐电台页面
  router.push({
    path: '/radio/category/0',
    query: { name: '为你推荐', type: 'recommend' }
  })
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

const refresh = () => {
  radioStore.refresh()
}

// 生命周期
onMounted(() => {
  radioStore.loadHomeData()
})
</script>

<style scoped>
.radio-page {
  padding: 16px;
  padding-bottom: 120px;
}

.search-section {
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--ion-color-step-50);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-bar:hover {
  background: var(--ion-color-step-100);
}

.search-bar ion-icon {
  margin-right: 8px;
  color: var(--ion-color-step-600);
}

.search-placeholder {
  color: var(--ion-color-step-600);
  font-size: 14px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-container p,
.error-container p {
  margin: 12px 0;
  color: var(--ion-color-step-600);
}

.error-container ion-icon {
  font-size: 48px;
  color: var(--ion-color-danger);
  margin-bottom: 16px;
}

.content-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: var(--ion-color-step-800);
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: var(--ion-color-step-50);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-card:active {
  transform: scale(0.95);
  background: var(--ion-color-step-100);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-tint));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 8px;
}

.expand-card .category-icon {
  background: var(--ion-color-step-200);
  color: var(--ion-color-step-600);
}

.category-name {
  font-size: 12px;
  text-align: center;
  color: var(--ion-color-step-800);
  line-height: 1.2;
}

/* 电台网格 */
.station-grid {
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

/* 推荐列表 */
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--ion-color-step-50);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recommend-item:active {
  background: var(--ion-color-step-100);
}

.rank-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.station-cover-small {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.station-cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommend-info {
  flex: 1;
  min-width: 0;
}

.recommend-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--ion-color-step-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-dj {
  font-size: 12px;
  color: var(--ion-color-step-600);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 水平滚动 */
.horizontal-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.horizontal-card {
  flex-shrink: 0;
  width: 120px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.horizontal-card:active {
  transform: scale(0.95);
}

.horizontal-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.horizontal-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.horizontal-card:hover .mini-play-button {
  opacity: 1;
}

.horizontal-name {
  font-size: 13px;
  font-weight: 500;
  margin: 0;
  color: var(--ion-color-step-800);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

@media (max-width: 480px) {
  .station-grid {
    grid-template-columns: 1fr;
  }

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .horizontal-card {
    width: 100px;
  }
}
</style>
