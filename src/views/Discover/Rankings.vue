<template>
  <ion-page>
    <ion-content :fullscreen="true" class="rankings-content">
      <div class="rankings-page">
        <!-- 顶部操作栏 -->
        <div class="top-bar">
          <BackButton />
          <h1 class="page-title">排行榜</h1>
          <div class="spacer"></div>
        </div>

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
                <img :src="ranking.cover" :alt="ranking.name" />
              </div>
              <div class="ranking-info">
                <h3 class="ranking-name">{{ ranking.name }}</h3>
                <p class="update-frequency">{{ ranking.updateFrequency }}</p>
                <div class="top-songs">
                  <div
                    v-for="(song, index) in ranking.topSongs"
                    :key="song.id"
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
                <img :src="ranking.cover" :alt="ranking.name" />
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
          <ion-spinner name="bubbles"></ion-spinner>
          <p>加载中...</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonSpinner
} from '@ionic/vue'
import { toplistApi } from '@/api/discover'
import { useSwipeBack } from '@/composables/useSwipeBack'
import BackButton from '@/components/common/BackButton.vue'

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

// 启用侧滑返回
const { goBack } = useSwipeBack()

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
    const response = await toplistApi.getTopPlaylists()
    if (response?.list && Array.isArray(response.list)) {
      rankings.value = response.list.map(formatRanking)
    } else {
      console.warn('排行榜API响应格式异常:', response)
      rankings.value = []
    }
  } catch (error) {
    console.error('加载排行榜失败:', error)
    rankings.value = []
  } finally {
    loading.value = false
  }
}

const formatRanking = (item: any): RankingItem => ({
  id: item.id,
  name: item.name,
  cover: item.coverImgUrl || '/images/ranking.jpg',
  updateFrequency: item.updateFrequency || '每日更新',
  ToplistType: item.ToplistType,
  topSongs: item.tracks?.slice(0, 3).map((track: any, index: number) => ({
    id: index + 1, // 使用索引作为ID，因为API返回的tracks没有id字段
    name: track.first || '', // 歌曲名在first字段
    artist: track.second || '' // 歌手名在second字段
  })) || []
})



const goToRanking = (id: number) => {
  router.push(`/playlist/${id}`)
}
</script>

<style scoped>
.rankings-content {
  --background: var(--ion-color-light);
}

.rankings-page {
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
</style>
