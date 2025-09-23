<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton default-href="/tabs/discover" />
        </IonButtons>
        <IonTitle>排行榜</IonTitle>
      </IonToolbar>
    </IonHeader>
    
    <IonContent :fullscreen="true" class="rankings-content">
      <!-- 官方榜 -->
      <div class="section">
        <h2 class="section-title">官方榜</h2>
        <div class="official-rankings">
          <div
            v-for="ranking in officialRankings"
            :key="ranking.id"
            class="ranking-card official"
            @click="goToRanking(ranking.id)"
          >
            <div class="ranking-cover">
              <img :src="ranking.cover" :alt="ranking.name" @error="handleImageError" />
            </div>
            <div class="ranking-info">
              <h3 class="ranking-name">{{ ranking.name }}</h3>
              <p class="update-frequency">{{ ranking.updateFrequency }}</p>
              <div class="top-songs">
                <div
                  v-for="(song, index) in ranking.topSongs"
                  :key="index"
                  class="top-song"
                >
                  <span class="song-index">{{ index + 1 }}</span>
                  <span class="song-info">{{ song.name }} - {{ song.artist }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全球榜 -->
      <div class="section">
        <h2 class="section-title">全球榜</h2>
        <div class="global-rankings">
          <div
            v-for="ranking in globalRankings"
            :key="ranking.id"
            class="ranking-card global"
            @click="goToRanking(ranking.id)"
          >
            <div class="ranking-cover">
              <img :src="ranking.cover" :alt="ranking.name" @error="handleImageError" />
            </div>
            <div class="ranking-info">
              <h3 class="ranking-name">{{ ranking.name }}</h3>
              <p class="update-frequency">{{ ranking.updateFrequency }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <IonSpinner name="bubbles"></IonSpinner>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && rankings.length === 0" class="empty-state">
        <p>暂无排行榜数据</p>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonSpinner
} from '@ionic/vue'

interface RankingItem {
  id: number
  name: string
  cover: string
  updateFrequency: string
  topSongs?: Array<{
    id: number
    name: string
    artist: string
  }>
  ToplistType?: string
}

const router = useRouter()
const loading = ref(false)
const rankings = ref<RankingItem[]>([])

const officialRankings = computed(() =>
  rankings.value.filter(item => item.ToplistType !== undefined)
)

const globalRankings = computed(() =>
  rankings.value.filter(item => item.ToplistType === undefined)
)

onMounted(async () => {
  await loadRankings()
})

const loadRankings = async () => {
  loading.value = true
  try {
    // 暂时使用模拟数据，因为 toplistApi 可能不存在
    const mockRankings: RankingItem[] = [
      {
        id: 1,
        name: '飙升榜',
        cover: '/images/ranking.jpg',
        updateFrequency: '每日更新',
        ToplistType: 'official',
        topSongs: [
          { id: 1, name: '青花瓷', artist: '周杰伦' },
          { id: 2, name: '稻香', artist: '周杰伦' },
          { id: 3, name: '晴天', artist: '周杰伦' }
        ]
      },
      {
        id: 2,
        name: '新歌榜',
        cover: '/images/ranking.jpg',
        updateFrequency: '每日更新',
        ToplistType: 'official',
        topSongs: [
          { id: 1, name: '新歌1', artist: '歌手1' },
          { id: 2, name: '新歌2', artist: '歌手2' },
          { id: 3, name: '新歌3', artist: '歌手3' }
        ]
      },
      {
        id: 3,
        name: 'UK榜',
        cover: '/images/ranking.jpg',
        updateFrequency: '每周更新'
      },
      {
        id: 4,
        name: 'US榜',
        cover: '/images/ranking.jpg',
        updateFrequency: '每周更新'
      }
    ]
    
    rankings.value = mockRankings
    console.log('排行榜数据加载完成')
  } catch (error) {
    console.error('加载排行榜失败:', error)
    rankings.value = []
  } finally {
    loading.value = false
  }
}

const goToRanking = (id: number) => {
  router.push(`/playlist/${id}`)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}
</script>

<style scoped>
.rankings-content {
  --background: var(--ion-color-light);
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 16px 0;
  padding: 0 16px;
}

.official-rankings {
  padding: 0 16px;
}

.ranking-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 16px;
  transition: transform 0.2s ease;
}

.ranking-card:active {
  transform: scale(0.98);
}

.ranking-card.official {
  min-height: 120px;
}

.ranking-cover {
  flex-shrink: 0;
}

.ranking-card.official .ranking-cover {
  width: 80px;
  height: 80px;
}

.ranking-card.global .ranking-cover {
  width: 60px;
  height: 60px;
}

.ranking-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 4px 0;
}

.update-frequency {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin: 0 0 12px 0;
}

.top-songs {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.top-song {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.song-index {
  color: var(--ion-color-medium);
  font-weight: 600;
  min-width: 16px;
}

.song-info {
  color: var(--ion-color-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.global-rankings {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
}

.global-rankings .ranking-card {
  flex-direction: column;
  text-align: center;
  margin-bottom: 0;
}

.global-rankings .ranking-info {
  margin-top: 8px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--ion-color-medium);
  text-align: center;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}
</style>
