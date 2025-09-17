<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/discover"></ion-back-button>
        </ion-buttons>
        <ion-title>歌单广场</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleHighQuality">
            <ion-icon :icon="isHighQuality ? star : starOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="playlist-square-content">
      <!-- 分类选择 -->
      <div class="category-section">
        <ion-segment
          v-model="selectedCategory"
          @ionChange="onCategoryChange"
          scrollable
        >
          <ion-segment-button value="全部">
            <ion-label>全部</ion-label>
          </ion-segment-button>
          <ion-segment-button
            v-for="category in categories"
            :key="category.name"
            :value="category.name"
          >
            <ion-label>{{ category.name }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- 精品歌单标识 -->
      <div v-if="isHighQuality" class="quality-badge">
        <ion-chip color="warning">
          <ion-icon :icon="star"></ion-icon>
          <ion-label>精品歌单</ion-label>
        </ion-chip>
      </div>

      <!-- 歌单列表 -->
      <div class="playlist-grid">
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="playlist-card"
          @click="goToPlaylist(playlist.id)"
        >
          <div class="playlist-cover">
            <img :src="playlist.cover" :alt="playlist.name" />
            <div class="play-count">
              <ion-icon :icon="play"></ion-icon>
              {{ formatPlayCount(playlist.playCount) }}
            </div>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-creator">by {{ playlist.creator }}</p>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <ion-infinite-scroll
        @ionInfinite="loadMore"
        threshold="100px"
        :disabled="!hasMore"
      >
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="加载更多歌单..."
        >
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <!-- 没有更多提示 -->
      <div v-if="!hasMore && playlists.length > 0" class="no-more">
        没有更多了
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && playlists.length === 0" class="loading-state">
        <ion-spinner name="bubbles"></ion-spinner>
        <p>加载中...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonIcon, IonSegment,
  IonSegmentButton, IonLabel, IonChip, IonInfiniteScroll,
  IonInfiniteScrollContent, IonSpinner
} from '@ionic/vue'
import { star, starOutline, play } from 'ionicons/icons'
import { useDiscoverStore } from '@/stores/discover'
import { storeToRefs } from 'pinia'

const router = useRouter()
const discoverStore = useDiscoverStore()

const {
  hotPlaylists: playlists,
  playlistCategories: categories,
  loading,
  playlistHasMore: hasMore,
  currentCategory,
  isHighQuality
} = storeToRefs(discoverStore)

const selectedCategory = ref('全部')

onMounted(async () => {
  await discoverStore.loadDiscoverData()
  await discoverStore.loadCategoryPlaylists('全部')
})

const onCategoryChange = async (event: any) => {
  const category = event.detail.value
  selectedCategory.value = category
  await discoverStore.loadCategoryPlaylists(category)
}

const toggleHighQuality = async () => {
  await discoverStore.toggleHighQuality(!isHighQuality.value)
}

const loadMore = async (event: any) => {
  await discoverStore.loadMorePlaylists()
  event.target.complete()
}

const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`)
}

const formatPlayCount = (count: number): string => {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}亿`
  } else if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  return count.toString()
}
</script>

<style scoped>
.playlist-square-content {
  --background: var(--s-background);
}

.category-section {
  padding: 16px;
  background: var(--s-surface);
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--s-shadow);
}

.quality-badge {
  padding: 8px 16px;
  background: var(--s-surface);
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--s-shadow);
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.playlist-card {
  background: var(--s-surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--s-shadow);
  transition: transform 0.2s ease;
}

.playlist-card:active {
  transform: scale(0.98);
}

.playlist-cover {
  position: relative;
  aspect-ratio: 1;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.play-count ion-icon {
  font-size: 12px;
}

.playlist-info {
  padding: 12px;
}

.playlist-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--s-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.playlist-creator {
  font-size: 12px;
  color: var(--s-text-secondary);
  margin: 0;
}

.no-more {
  text-align: center;
  padding: 20px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--ion-color-medium);
}

.loading-state p {
  margin-top: 16px;
  font-size: 14px;
}
</style>
