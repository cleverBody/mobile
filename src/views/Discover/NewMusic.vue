<template>
  <IonPage>
    <IonContent :fullscreen="true" class="new-music-content">
      <div class="new-music-page">
        <!-- 顶部操作栏 -->
        <div class="top-bar">
          <BackButton />
          <h1 class="page-title">最新音乐</h1>
          <div class="spacer"></div>
        </div>

        <!-- 分类选择 -->
        <div class="category-section">
          <IonSegment
            v-model="selectedCategory"
            @ionChange="onCategoryChange"
            scrollable
          >
            <IonSegmentButton value="songs">
              <IonLabel>新歌速递</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="albums">
              <IonLabel>新碟上架</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <!-- 新歌速递 -->
        <div v-if="selectedCategory === 'songs'" class="songs-section">
          <!-- 地区筛选 -->
          <div class="area-filter">
            <IonChip
              v-for="area in songAreas"
              :key="area.value"
              :color="selectedSongArea === area.value ? 'primary' : 'medium'"
              @click="selectSongArea(area.value)"
            >
              <IonLabel>{{ area.label }}</IonLabel>
            </IonChip>
          </div>

          <!-- 歌曲列表 -->
          <div class="songs-list">
            <div
              v-for="(song, index) in newSongs"
              :key="song.id"
              class="song-item"
              @click="playSong(song)"
            >
            <div class="song-index">{{ index + 1 }}</div>
            <div class="song-cover">
              <img :src="song.cover" :alt="song.name" />
              <div class="play-icon">
                <ion-icon :icon="play"></ion-icon>
              </div>
            </div>
            <div class="song-info">
              <h3 class="song-name">{{ song.name }}</h3>
              <p class="song-artist">{{ song.artist }}</p>
            </div>
            <ion-button fill="clear" size="small">
              <ion-icon :icon="ellipsisHorizontal"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>

      <!-- 新碟上架 -->
      <div v-if="selectedCategory === 'albums'" class="albums-section">
        <!-- 地区筛选 -->
        <div class="area-filter">
          <ion-chip
            v-for="area in albumAreas"
            :key="area.value"
            :color="selectedAlbumArea === area.value ? 'primary' : 'medium'"
            @click="selectAlbumArea(area.value)"
          >
            <ion-label>{{ area.label }}</ion-label>
          </ion-chip>
        </div>

        <!-- 专辑网格 -->
        <div class="albums-grid">
          <div
            v-for="album in newAlbums"
            :key="album.id"
            class="album-card"
            @click="goToAlbum(album.id)"
          >
            <div class="album-cover">
              <img :src="album.cover" :alt="album.name" />
            </div>
            <div class="album-info">
              <h3 class="album-name">{{ album.name }}</h3>
              <p class="album-artist">{{ album.artist }}</p>
              <p class="album-date">{{ formatDate(album.publishTime) }}</p>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <ion-infinite-scroll
          @ionInfinite="loadMoreAlbums"
          threshold="100px"
          :disabled="!albumHasMore"
        >
          <ion-infinite-scroll-content
            loading-spinner="bubbles"
            loading-text="加载更多专辑..."
          >
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </div>

        <!-- 没有更多提示 -->
        <div v-if="!hasMore && items.length > 0" class="no-more">
          没有更多了
        </div>

        <!-- 加载状态 -->
        <div v-if="loading && items.length === 0" class="loading-state">
          <IonSpinner name="bubbles" />
          <p>加载中...</p>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent,
  IonButton, IonIcon, IonSegment,
  IonSegmentButton, IonLabel, IonChip, IonInfiniteScroll,
  IonInfiniteScrollContent, IonSpinner
} from '@ionic/vue'
import { play, ellipsisHorizontal } from 'ionicons/icons'
import { newMusicApi } from '@/api/discover'
import { useSwipeBack } from '@/composables/useSwipeBack'
import BackButton from '@/components/common/BackButton.vue'

interface Song {
  id: number
  name: string
  artist: string
  cover: string
  duration?: number
}

interface Album {
  id: number
  name: string
  artist: string
  cover: string
  publishTime: number
  size?: number
}

const router = useRouter()

// 启用侧滑返回
const { goBack } = useSwipeBack()

const loading = ref(false)
const selectedCategory = ref('songs')

// 新歌相关
const newSongs = ref<Song[]>([])
const selectedSongArea = ref(0)

// 新专辑相关
const newAlbums = ref<Album[]>([])
const selectedAlbumArea = ref('ALL')
const albumOffset = ref(0)
const albumHasMore = ref(true)

// 地区选项
const songAreas = [
  { label: '全部', value: 0 },
  { label: '华语', value: 7 },
  { label: '欧美', value: 96 },
  { label: '日本', value: 8 },
  { label: '韩国', value: 16 }
]

const albumAreas = [
  { label: '全部', value: 'ALL' },
  { label: '华语', value: 'ZH' },
  { label: '欧美', value: 'EA' },
  { label: '韩国', value: 'KR' },
  { label: '日本', value: 'JP' }
]

const items = computed(() =>
  selectedCategory.value === 'songs' ? newSongs.value : newAlbums.value
)

const hasMore = computed(() =>
  selectedCategory.value === 'albums' ? albumHasMore.value : false
)

onMounted(async () => {
  await loadNewSongs()
  await loadNewAlbums()
})

const onCategoryChange = async (event: any) => {
  selectedCategory.value = event.detail.value
}

const loadNewSongs = async () => {
  loading.value = true
  try {
    const response = await newMusicApi.getNewSongs(selectedSongArea.value)
    if (response?.data && Array.isArray(response.data)) {
      newSongs.value = response.data.map(formatSong)
    } else {
      console.warn('新歌API响应格式异常:', response)
      newSongs.value = []
    }
  } catch (error) {
    console.error('加载新歌失败:', error)
    newSongs.value = []
  } finally {
    loading.value = false
  }
}

const loadNewAlbums = async (reset: boolean = true) => {
  if (reset) {
    albumOffset.value = 0
    newAlbums.value = []
  }

  loading.value = true
  try {
    const response = await newMusicApi.getNewAlbums(
      selectedAlbumArea.value,
      20,
      albumOffset.value
    )

    const albums = response.albums?.map(formatAlbum) || []

    if (reset) {
      newAlbums.value = albums
    } else {
      newAlbums.value = [...newAlbums.value, ...albums]
    }

    albumHasMore.value = response.hasMore || false
  } catch (error) {
    console.error('加载新专辑失败:', error)
    if (reset) {
      newAlbums.value = getMockAlbums()
    }
  } finally {
    loading.value = false
  }
}

const formatSong = (item: any): Song => ({
  id: item.id,
  name: item.name,
  artist: item.song?.artists?.[0]?.name || item.artists?.[0]?.name || '',
  cover: item.song?.album?.picUrl || item.album?.picUrl || '/images/album.jpg',
  duration: item.song?.duration || item.duration
})

const formatAlbum = (item: any): Album => ({
  id: item.id,
  name: item.name,
  artist: item.artist?.name || item.artists?.[0]?.name || '',
  cover: item.picUrl || '/images/album.jpg',
  publishTime: item.publishTime,
  size: item.size
})

const getMockSongs = (): Song[] => [
  {
    id: 1,
    name: '最伟大的作品',
    artist: '周杰伦',
    cover: '/images/song1.jpg'
  },
  {
    id: 2,
    name: '还是会想你',
    artist: '林达浪',
    cover: '/images/song2.jpg'
  }
]

const getMockAlbums = (): Album[] => [
  {
    id: 1,
    name: '最伟大的作品',
    artist: '周杰伦',
    cover: '/images/album1.jpg',
    publishTime: Date.now()
  },
  {
    id: 2,
    name: '时代少年团',
    artist: '时代少年团',
    cover: '/images/album2.jpg',
    publishTime: Date.now()
  }
]

const selectSongArea = async (area: number) => {
  selectedSongArea.value = area
  await loadNewSongs()
}

const selectAlbumArea = async (area: string) => {
  selectedAlbumArea.value = area
  await loadNewAlbums()
}

const loadMoreAlbums = async (event: any) => {
  if (!albumHasMore.value || loading.value) {
    event.target.complete()
    return
  }

  albumOffset.value += 20
  await loadNewAlbums(false)
  event.target.complete()
}

const playSong = (song: Song) => {
  // TODO: 播放歌曲
  console.log('播放歌曲:', song.name)
}

const goToAlbum = (id: number) => {
  router.push(`/album/${id}`)
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.new-music-content {
  --background: var(--ion-color-light);
}

.category-section {
  padding: 16px;
  background: white;
  margin-bottom: 8px;
}

.area-filter {
  padding: 16px;
  background: white;
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.songs-list {
  background: white;
  margin-bottom: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ion-color-light);
  transition: background-color 0.2s ease;
}

.song-item:active {
  background-color: var(--ion-color-light);
}

.song-item:last-child {
  border-bottom: none;
}

.song-index {
  width: 30px;
  text-align: center;
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-right: 12px;
}

.song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.song-item:hover .play-icon {
  opacity: 1;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

.album-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.album-card:active {
  transform: scale(0.98);
}

.album-cover {
  aspect-ratio: 1;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-info {
  padding: 12px;
}

.album-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-artist {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-date {
  font-size: 11px;
  color: var(--ion-color-medium);
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
