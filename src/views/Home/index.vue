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
              <div class="action-icon daily-recommend">
                <IonIcon :icon="sparklesOutline" class="main-icon" />
                <span class="date-badge">{{ currentDate }}</span>
              </div>
              <span class="action-label">每日推荐</span>
            </div>

            <div class="action-item" @click="goToLocalMusic">
              <div class="action-icon local-music">
                <IonIcon :icon="musicalNotesOutline" class="main-icon" />
              </div>
              <span class="action-label">本地音乐</span>
            </div>

            <div class="action-item" @click="goToLiked">
              <div class="action-icon liked-music">
                <IonIcon :icon="heartOutline" class="main-icon" />
              </div>
              <span class="action-label">我喜欢的</span>
            </div>

            <div class="action-item" @click="goToPodcast">
              <div class="action-icon podcast">
                <IonIcon :icon="micOutline" class="main-icon" />
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
                  :src="artist.avatar || ''"
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
  calendar,
  calendarOutline,
  radio,
  radioOutline,
  heart,
  heartOutline,
  mic,
  micOutline,
  chevronForwardOutline,
  play,
  search,
  searchOutline,
  sparkles,
  sparklesOutline,
  musicalNote,
  musicalNoteOutline,
  musicalNotes,
  musicalNotesOutline
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

const goToLocalMusic = () => {
  router.push('/local-music')
}

const goToLiked = () => {
  router.push('/tabs/library')
}

const goToSearch = () => {
  router.push('/search')
}

const goToPodcast = () => {
  // 跳转到移动端电台页面
  router.push('/tabs/radio')
}

const goToDiscover = () => {
  router.push('/discover/playlist-square')
}

const goToArtists = () => {
  router.push('/discover/artists')
}

const goToNewAlbums = () => {
  router.push('/discover/new-music')
}

const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`)
}

const goToArtist = (id: number) => {
  router.push({ name: 'Artist', params: { id: id.toString() } })
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
  padding: 16px 16px 120px 16px;
  max-width: 100%;
  margin: 0 auto;
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
  margin-bottom: 32px;
  padding: 8px 0;
}

.greeting {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--s-text-primary) 0%, var(--s-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 15px;
  margin: 0;
  color: var(--s-text-secondary);
  font-weight: 400;
  letter-spacing: 0.2px;
}

.quick-actions {
  margin-bottom: 32px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0 4px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
  border-radius: 16px;
}

.action-item:active {
  transform: scale(0.95);
  background: var(--s-surface-tint);
}

.action-icon {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px var(--s-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--s-shadow);
}

.main-icon {
  font-size: 28px;
  color: white;
}

/* 每个图标的独特渐变背景 */
.daily-recommend {
  background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%);
}

.local-music {
  background: linear-gradient(135deg, #85c1e9 0%, #5dade2 100%);
}

.liked-music {
  background: linear-gradient(135deg, #f1948a 0%, #ec7063 100%);
}

.podcast {
  background: linear-gradient(135deg, #f4d03f 0%, #f39c12 100%);
}

.date-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--s-text-primary);
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

.action-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: var(--s-text-primary);
  letter-spacing: 0.2px;
}

.content-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 2px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--s-text-primary);
  letter-spacing: -0.3px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  width: 100%;
}

.playlist-card,
.album-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  border-radius: 16px;
  background: var(--s-surface);
  box-shadow: 0 2px 8px var(--s-shadow-light);
}

.artist-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 8px 6px;
  border-radius: 12px;
  background: var(--s-surface);
  box-shadow: 0 2px 8px var(--s-shadow-light);
}

.playlist-card:hover,
.album-card:hover,
.artist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--s-shadow);
  background: var(--s-surface-elevated);
}

.playlist-card:active,
.album-card:active,
.artist-card:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--s-shadow);
}

.playlist-cover,
.album-cover {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  width: 100% !important;
  height: 130px !important;
  min-height: 130px !important;
  max-height: 130px !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  box-shadow: 0 3px 12px var(--s-shadow-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.artist-avatar {
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 6px;
  width: 100%;
  box-shadow: 0 2px 8px var(--s-shadow-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
.album-name {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 4px 0;
  line-height: 1.3;
  color: var(--s-text-primary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex-shrink: 0;
}

.artist-name {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  line-height: 1.3;
  color: var(--s-text-primary);
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.album-artist {
  font-size: 11px;
  margin: 0;
  line-height: 1.2;
  color: var(--s-text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.search-bar-container {
  margin-bottom: 28px;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: var(--s-surface);
  border-radius: 28px;
  border: 1px solid var(--s-border-light);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px var(--s-shadow-light);
}

.search-bar:hover {
  border-color: var(--s-primary);
  box-shadow: 0 4px 20px var(--s-shadow);
  transform: translateY(-1px);
}

.search-bar:active {
  transform: translateY(0);
  box-shadow: 0 2px 12px var(--s-shadow-light);
}

.search-icon {
  color: var(--s-text-tertiary);
  margin-right: 14px;
  font-size: 20px;
  transition: color 0.3s ease;
}

.search-bar:hover .search-icon {
  color: var(--s-primary);
}

.search-placeholder {
  color: var(--s-text-secondary);
  font-size: 15px;
  font-weight: 400;
  flex: 1;
  letter-spacing: 0.2px;
}

@media (max-width: 480px) {
  .home-page {
    padding: 12px 12px 120px 12px;
  }

  .playlist-grid,
  .album-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .artist-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .playlist-cover,
  .album-cover {
    height: 120px !important;
    min-height: 120px !important;
    max-height: 120px !important;
  }

  .playlist-card,
  .album-card {
    padding: 10px;
  }

  .artist-card {
    padding: 6px;
  }

  .action-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .action-icon {
    width: 56px;
    height: 56px;
  }

  .content-section {
    margin-bottom: 28px;
  }
}
</style>
