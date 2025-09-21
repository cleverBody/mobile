<template>
  <ion-page>
    <ion-content :fullscreen="true" class="artists-content">
      <div class="artists-page">
        <!-- 顶部操作栏 -->
        <div class="top-bar">
          <BackButton />
          <h1 class="page-title">歌手分类</h1>
          <div class="spacer"></div>
        </div>

        <!-- 筛选条件 -->
        <div class="filter-section">
          <!-- 语种 -->
          <div class="filter-group">
            <h3 class="filter-title">语种</h3>
            <div class="filter-options">
              <ion-chip 
                v-for="area in areaOptions" 
                :key="area.value"
                :color="selectedArea === area.value ? 'primary' : 'medium'"
                @click="selectArea(area.value)"
              >
                <ion-label>{{ area.label }}</ion-label>
              </ion-chip>
            </div>
          </div>

          <!-- 分类 -->
          <div class="filter-group">
            <h3 class="filter-title">分类</h3>
            <div class="filter-options">
              <ion-chip 
                v-for="type in typeOptions" 
                :key="type.value"
                :color="selectedType === type.value ? 'primary' : 'medium'"
                @click="selectType(type.value)"
              >
                <ion-label>{{ type.label }}</ion-label>
              </ion-chip>
            </div>
          </div>

          <!-- 首字母 -->
          <div class="filter-group">
            <h3 class="filter-title">首字母</h3>
            <div class="initial-grid">
              <ion-chip 
                v-for="initial in initialOptions" 
                :key="initial.value"
                :color="selectedInitial === initial.value ? 'primary' : 'medium'"
                @click="selectInitial(initial.value)"
                class="initial-chip"
              >
                <ion-label>{{ initial.label }}</ion-label>
              </ion-chip>
            </div>
          </div>
        </div>

        <!-- 歌手列表 -->
        <div class="artists-list">
          <div 
            v-for="artist in artists" 
            :key="artist.id"
            class="artist-item"
            @click="goToArtist(artist.id)"
          >
            <div class="artist-avatar">
              <img :src="artist.cover" :alt="artist.name" />
            </div>
            <div class="artist-info">
              <h3 class="artist-name">{{ artist.name }}</h3>
              <p class="artist-stats">
                <span>{{ artist.albumSize || 0 }}张专辑</span>
                <span>{{ artist.musicSize || 0 }}首歌曲</span>
              </p>
            </div>
            <ion-button fill="clear" size="small">
              <ion-icon :icon="chevronForward"></ion-icon>
            </ion-button>
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
            loading-text="加载更多歌手..."
          >
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>

        <!-- 没有更多提示 -->
        <div v-if="!hasMore && artists.length > 0" class="no-more">
          没有更多了
        </div>

        <!-- 加载状态 -->
        <div v-if="loading && artists.length === 0" class="loading-state">
          <ion-spinner name="bubbles"></ion-spinner>
          <p>加载中...</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonButton, IonIcon, IonChip,
  IonLabel, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner
} from '@ionic/vue'
import { chevronForward } from 'ionicons/icons'
import { artistApi } from '@/api/discover'
import { useSwipeBack } from '@/composables/useSwipeBack'
import BackButton from '@/components/common/BackButton.vue'

interface Artist {
  id: number
  name: string
  cover: string
  albumSize?: number
  musicSize?: number
}

const router = useRouter()

// 启用侧滑返回
const { goBack } = useSwipeBack()

const loading = ref(false)
const artists = ref<Artist[]>([])
const hasMore = ref(true)
const offset = ref(0)

// 筛选条件
const selectedArea = ref(-1)
const selectedType = ref(-1)
const selectedInitial = ref(-1)

// 筛选选项
const areaOptions = [
  { label: '全部', value: -1 },
  { label: '华语', value: 7 },
  { label: '欧美', value: 96 },
  { label: '日本', value: 8 },
  { label: '韩国', value: 16 },
  { label: '其他', value: 0 }
]

const typeOptions = [
  { label: '全部', value: -1 },
  { label: '男歌手', value: 1 },
  { label: '女歌手', value: 2 },
  { label: '乐队', value: 3 }
]

const initialOptions = [
  { label: '热门', value: -1 },
  { label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' },
  { label: 'D', value: 'D' }, { label: 'E', value: 'E' }, { label: 'F', value: 'F' },
  { label: 'G', value: 'G' }, { label: 'H', value: 'H' }, { label: 'I', value: 'I' },
  { label: 'J', value: 'J' }, { label: 'K', value: 'K' }, { label: 'L', value: 'L' },
  { label: 'M', value: 'M' }, { label: 'N', value: 'N' }, { label: 'O', value: 'O' },
  { label: 'P', value: 'P' }, { label: 'Q', value: 'Q' }, { label: 'R', value: 'R' },
  { label: 'S', value: 'S' }, { label: 'T', value: 'T' }, { label: 'U', value: 'U' },
  { label: 'V', value: 'V' }, { label: 'W', value: 'W' }, { label: 'X', value: 'X' },
  { label: 'Y', value: 'Y' }, { label: 'Z', value: 'Z' }, { label: '#', value: 0 }
]

onMounted(async () => {
  await loadArtists()
})

const loadArtists = async (reset: boolean = true) => {
  if (reset) {
    offset.value = 0
    artists.value = []
  }
  
  loading.value = true
  try {
    const response = await artistApi.getArtistList(
      selectedType.value,
      selectedArea.value,
      selectedInitial.value,
      offset.value,
      30
    )
    
    const newArtists = response.artists?.map(formatArtist) || []
    
    if (reset) {
      artists.value = newArtists
    } else {
      artists.value = [...artists.value, ...newArtists]
    }
    
    hasMore.value = response.more || false
  } catch (error) {
    console.error('加载歌手失败:', error)
    // 使用备用数据
    if (reset) {
      artists.value = getMockArtists()
    }
  } finally {
    loading.value = false
  }
}

const formatArtist = (item: any): Artist => ({
  id: item.id,
  name: item.name,
  cover: item.picUrl || item.img1v1Url || '/images/artist.jpg',
  albumSize: item.albumSize || 0,
  musicSize: item.musicSize || 0
})

const getMockArtists = (): Artist[] => [
  {
    id: 1,
    name: '周杰伦',
    cover: '/images/artist1.jpg',
    albumSize: 15,
    musicSize: 200
  },
  {
    id: 2,
    name: '陈奕迅',
    cover: '/images/artist2.jpg',
    albumSize: 20,
    musicSize: 300
  }
]

const selectArea = async (area: number) => {
  selectedArea.value = area
  await loadArtists()
}

const selectType = async (type: number) => {
  selectedType.value = type
  await loadArtists()
}

const selectInitial = async (initial: number | string) => {
  selectedInitial.value = initial
  await loadArtists()
}

const loadMore = async (event: any) => {
  if (!hasMore.value || loading.value) {
    event.target.complete()
    return
  }
  
  offset.value += 30
  await loadArtists(false)
  event.target.complete()
}

const goToArtist = (id: number) => {
  router.push(`/artist/${id}`)
}
</script>

<style scoped>
.artists-content {
  --background: var(--ion-color-light);
}

.artists-page {
  padding-bottom: 120px;
}

.top-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0;
  flex: 1;
  text-align: center;
}

.spacer {
  min-width: 44px;
}

.filter-section {
  background: white;
  padding: 16px;
  margin-bottom: 8px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 12px 0;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.initial-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.initial-chip {
  min-width: auto;
}

.artists-list {
  background: white;
  margin-bottom: 8px;
}

.artist-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--ion-color-light);
  transition: background-color 0.2s ease;
}

.artist-item:active {
  background-color: var(--ion-color-light);
}

.artist-item:last-child {
  border-bottom: none;
}

.artist-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-info {
  flex: 1;
  min-width: 0;
}

.artist-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 4px 0;
}

.artist-stats {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin: 0;
  display: flex;
  gap: 12px;
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
