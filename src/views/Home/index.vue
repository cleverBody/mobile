<template>
  <IonPage>
    <IonContent :fullscreen="true">
      <div class="home-page">
        <!-- 欢迎头部 -->
        <div class="welcome-header">
          <h1 class="greeting">{{ greeting }}</h1>
          <p class="subtitle s-text-secondary">由此开启好心情 ~</p>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar-container">
          <div class="search-bar" @click="goToSearch">
            <IonIcon :icon="searchOutline" class="search-icon" />
            <span class="search-placeholder">搜索歌曲、歌手、专辑</span>
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="quick-actions">
          <div class="action-grid">
            <div class="action-item" @click="goToDailyRecommend">
              <div class="action-icon daily">
                <IonIcon :icon="calendarOutline" />
                <span class="date">{{ currentDate }}</span>
              </div>
              <span class="action-label">每日推荐</span>
            </div>

            <div class="action-item" @click="startPersonalFM">
              <div class="action-icon">
                <IonIcon :icon="radioOutline" />
              </div>
              <span class="action-label">私人FM</span>
            </div>

            <div class="action-item" @click="goToLiked">
              <div class="action-icon">
                <IonIcon :icon="heartOutline" />
              </div>
              <span class="action-label">我喜欢的</span>
            </div>

            <div class="action-item" @click="goToPodcast">
              <div class="action-icon">
                <IonIcon :icon="micOutline" />
              </div>
              <span class="action-label">播客电台</span>
            </div>
          </div>
        </div>

        <!-- 为你推荐 -->
        <section class="content-section">
          <div class="section-header">
            <h2 class="section-title">为你推荐</h2>
            <IonButton fill="clear" size="small" @click="goToDiscover">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <IonSpinner></IonSpinner>
            <p>加载中...</p>
          </div>

          <!-- 数据显示 -->
          <div v-else-if="recommendedPlaylists.length > 0" class="playlist-grid">
            <div
              v-for="playlist in recommendedPlaylists"
              :key="playlist.id"
              class="playlist-card"
              @click="goToPlaylist(playlist.id)"
            >
              <div
                class="playlist-cover"
                :style="{backgroundImage: `url(${playlist.cover})`}"
              >
                <div class="play-button">
                  <IonIcon :icon="play" />
                </div>
              </div>
              <h3 class="playlist-name s-text-truncate">{{ playlist.name }}</h3>
            </div>
          </div>

          <!-- 无数据状态 -->
          <div v-else class="empty-state">
            <p>暂无推荐歌单</p>
          </div>
        </section>

        <!-- 热门歌手 -->
        <section class="content-section">
          <div class="section-header">
            <h2 class="section-title">热门歌手</h2>
            <IonButton fill="clear" size="small" @click="goToArtists">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>
          <div class="artist-grid">
            <div
              v-for="artist in popularArtists"
              :key="artist.id"
              class="artist-card"
              @click="goToArtist(artist.id)"
            >
              <div class="artist-avatar">
                <img
                  :src="artist.avatar || '/images/default-avatar.jpg'"
                  :alt="artist.name"
                  @error="handleImageError"
                />
              </div>
              <h3 class="artist-name s-text-truncate">{{ artist.name }}</h3>
            </div>
          </div>
        </section>

        <!-- 新碟上架 -->
        <section class="content-section">
          <div class="section-header">
            <h2 class="section-title">新碟上架</h2>
            <IonButton fill="clear" size="small" @click="goToNewAlbums">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>
          <div class="album-grid">
            <div
              v-for="album in newAlbums"
              :key="album.id"
              class="album-card"
              @click="goToAlbum(album.id)"
            >
              <div
                class="album-cover"
                :style="{backgroundImage: `url(${album.cover})`}"
              ></div>
              <h3 class="album-name s-text-truncate">{{ album.name }}</h3>
              <p class="album-artist s-text-truncate s-text-secondary">{{ album.artist?.name || '未知艺人' }}</p>
            </div>
          </div>
        </section>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import {
  calendarOutline,
  radioOutline,
  heartOutline,
  micOutline,
  chevronForwardOutline,
  play,
  searchOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useHomeStore } from '@/stores/home'
import { useMusicStore } from '@/stores/music'

const router = useRouter()
const homeStore = useHomeStore()
const musicStore = useMusicStore()

// 使用 storeToRefs 保持响应性
const { recommendedPlaylists, popularArtists, newAlbums, loading, error } = storeToRefs(homeStore)

// 基本计算属性
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const currentDate = computed(() => new Date().getDate())

// 方法
const goToDailyRecommend = () => {
  router.push('/daily-recommend')
}

const startPersonalFM = () => {
  // TODO: 启动私人FM
  console.log('启动私人FM')
}

const goToLiked = () => {
  router.push('/tabs/library')
}

const goToSearch = () => {
  router.push('/search')
}

const goToPodcast = () => {
  // TODO: 跳转到播客电台页面
  console.log('跳转到播客电台')
  router.push('/tabs/discover')
}

const goToDiscover = () => {
  router.push('/tabs/discover')
}

const goToArtists = () => {
  router.push('/tabs/discover')
}

const goToNewAlbums = () => {
  router.push('/tabs/discover')
}

const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`)
}

const goToArtist = (id: number) => {
  router.push({ name: 'Artist', query: { id: id.toString() } })
}

const goToAlbum = (id: number) => {
  router.push({ name: 'Album', params: { id: id.toString() } })
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // 只设置一次，避免循环
  if (target.src !== '/images/album.jpg') {
    target.src = '/images/album.jpg'
  }
}



// 生命周期
onMounted(async () => {
  console.log('首页组件已挂载，开始加载数据...')
  await homeStore.loadHomeData()
  console.log('数据加载完成后的状态检查:')
  console.log('推荐歌单数量:', homeStore.recommendedPlaylists.length)
  console.log('热门歌手数量:', homeStore.popularArtists.length)
  console.log('新专辑数量:', homeStore.newAlbums.length)
})
</script>

<style scoped>
.home-page {
  padding: 16px;
  padding-bottom: 120px; /* 为迷你播放器和底部导航预留空间 */
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.loading-container p {
  margin: 0;
  color: var(--ion-color-step-600);
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-step-600);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.welcome-header {
  margin-bottom: 24px;
}

.greeting {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  margin: 0;
}

.quick-actions {
  margin-bottom: 32px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.action-item:active {
  transform: scale(0.95);
}

.action-icon {
  position: relative;
  width: 56px;
  height: 56px;
  background: var(--s-primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 8px;
}

.action-icon.daily .date {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  margin-top: 2px;
}

.action-label {
  font-size: 12px;
  text-align: center;
  color: var(--s-text-primary);
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
}

.playlist-grid,
.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr; /* 所有行等高 */
  gap: 12px;
  width: 100%;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr; /* 所有行等高 */
  gap: 12px;
  width: 100%;
}

.playlist-card,
.album-card,
.artist-card {
  cursor: pointer;
  transition: transform 0.2s ease;
  width: 100%;
  min-width: 0; /* 防止flex子项收缩问题 */
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保所有卡片等高 */
}

.playlist-card:active,
.album-card:active,
.artist-card:active {
  transform: scale(0.95);
}

.playlist-cover,
.album-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 4px;
  width: 100% !important;
  height: 130px !important; /* 强制固定高度 */
  min-height: 130px !important;
  max-height: 130px !important;
  background-size: cover !important; /* 背景图填满 */
  background-position: center !important; /* 背景图居中 */
  background-repeat: no-repeat !important; /* 不重复 */
}

.artist-avatar {
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 8px;
  width: 100%;
}

.playlist-cover img,
.album-cover img,
.artist-avatar img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important; /* 强制填满容器，保持比例，可能裁剪 */
  display: block !important;
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

.playlist-card:hover .play-button {
  opacity: 1;
}

.playlist-name,
.album-name,
.artist-name {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  line-height: 1.2;
  height: 26px; /* 固定文本区域高度 */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* 标准属性 */
  -webkit-box-orient: vertical;
  flex-shrink: 0; /* 不允许收缩 */
}

.album-artist {
  font-size: 11px;
  margin: 2px 0 0 0;
  line-height: 1.2;
}

.search-bar-container {
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--s-surface);
  border-radius: 24px;
  border: 1px solid var(--s-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-bar:hover {
  background: var(--s-border);
  border-color: var(--s-primary);
}

.search-bar:active {
  transform: scale(0.98);
}

.search-icon {
  color: var(--s-text-secondary);
  margin-right: 12px;
  font-size: 18px;
}

.search-placeholder {
  color: var(--s-text-secondary);
  font-size: 14px;
  flex: 1;
}

@media (max-width: 480px) {
  .playlist-grid,
  .album-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .artist-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .playlist-cover,
  .album-cover {
    max-width: 120px;
    max-height: 120px;
  }

  .artist-avatar {
    max-width: 60px;
    max-height: 60px;
  }

  .action-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .action-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
