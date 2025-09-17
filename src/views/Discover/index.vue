<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>发现音乐</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="openSearch">
            <IonIcon :icon="searchOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="discover-page">
        <!-- 搜索栏 -->
        <div class="search-section">
          <div class="search-bar" @click="openSearch">
            <IonIcon :icon="searchOutline" />
            <span class="search-placeholder">搜索歌曲、歌手、专辑</span>
          </div>
        </div>

        <!-- 快速导航 -->
        <div class="quick-nav">
          <div class="nav-grid">
            <div class="nav-item" @click="goToRanking">
              <div class="nav-icon ranking">
                <IonIcon :icon="trophyOutline" />
              </div>
              <span class="nav-label">排行榜</span>
            </div>

            <div class="nav-item" @click="goToPlaylists">
              <div class="nav-icon playlists">
                <IonIcon :icon="albumsOutline" />
              </div>
              <span class="nav-label">歌单广场</span>
            </div>

            <div class="nav-item" @click="goToNewSongs">
              <div class="nav-icon new-songs">
                <IonIcon :icon="sparklesOutline" />
              </div>
              <span class="nav-label">新歌速递</span>
            </div>

            <div class="nav-item" @click="goToArtists">
              <div class="nav-icon artists">
                <IonIcon :icon="peopleOutline" />
              </div>
              <span class="nav-label">歌手分类</span>
            </div>
          </div>
        </div>

        <!-- 热门歌单 -->
        <section class="content-section">
          <div class="section-header">
            <h2 class="section-title">热门歌单</h2>
            <IonButton fill="clear" size="small" @click="goToPlaylists">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>

          <div class="playlist-grid">
            <div
              v-for="playlist in hotPlaylists"
              :key="playlist.id"
              class="playlist-card"
              @click="goToPlaylist(playlist.id)"
            >
              <div class="playlist-cover">
                <img
                  :src="playlist.cover"
                  :alt="playlist.name"
                  @error="handleImageError"
                />
                <div class="play-count">
                  <IonIcon :icon="playOutline" />
                  <span>{{ formatPlayCount(playlist.playCount) }}</span>
                </div>
                <div class="play-button">
                  <IonIcon :icon="play" />
                </div>
              </div>
              <h3 class="playlist-name s-text-truncate">{{ playlist.name }}</h3>
              <p class="playlist-desc s-text-truncate s-text-secondary">{{ playlist.description }}</p>
            </div>
          </div>
        </section>

        <!-- 推荐歌手 -->
        <section class="content-section">
          <div class="section-header">
            <h2 class="section-title">推荐歌手</h2>
            <IonButton fill="clear" size="small" @click="goToArtists">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>

          <div class="artist-grid">
            <div
              v-for="artist in recommendedArtists"
              :key="artist.id"
              class="artist-card"
              @click="goToArtist(artist.id)"
            >
              <div class="artist-avatar">
                <img
                  :src="artist.cover"
                  :alt="artist.name"
                  @error="handleImageError"
                />
              </div>
              <h3 class="artist-name s-text-truncate">{{ artist.name }}</h3>
              <p class="artist-followers s-text-secondary">{{ formatFollowers(artist.followers) }}关注</p>
            </div>
          </div>
        </section>

        <!-- 榜单推荐 -->
        <section class="content-section">
          <div class="section-header">
            <h2 class="section-title">榜单推荐</h2>
            <IonButton fill="clear" size="small" @click="goToRanking">
              更多
              <IonIcon :icon="chevronForwardOutline" />
            </IonButton>
          </div>

          <div class="ranking-list">
            <div
              v-for="(ranking, index) in topRankings"
              :key="ranking.id"
              class="ranking-item"
              @click="goToPlaylist(ranking.id)"
            >
              <div class="ranking-cover">
                <img
                  :src="ranking.cover"
                  :alt="ranking.name"
                  @error="handleImageError"
                />
                <div class="ranking-number">{{ index + 1 }}</div>
              </div>
              <div class="ranking-info">
                <h3 class="ranking-name">{{ ranking.name }}</h3>
                <div class="ranking-songs">
                  <div
                    v-for="(song, songIndex) in ranking.topSongs"
                    :key="song.id"
                    class="song-item"
                  >
                    <span class="song-index">{{ songIndex + 1 }}.</span>
                    <span class="song-name s-text-truncate">{{ song.name }}</span>
                    <span class="song-artist s-text-secondary">{{ song.artist }}</span>
                  </div>
                </div>
              </div>
              <IonButton fill="clear" size="small">
                <IonIcon :icon="playOutline" />
              </IonButton>
            </div>
          </div>
        </section>
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
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/vue'
import {
  searchOutline,
  trophyOutline,
  albumsOutline,
  sparklesOutline,
  peopleOutline,
  chevronForwardOutline,
  play,
  playOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useDiscoverStore } from '@/stores/discover'

const router = useRouter()
const discoverStore = useDiscoverStore()

// 计算属性
const hotPlaylists = computed(() => discoverStore.hotPlaylists)
const recommendedArtists = computed(() => discoverStore.recommendedArtists)
const topRankings = computed(() => discoverStore.topRankings)

// 方法
const openSearch = () => {
  router.push('/search')
}

const goToRanking = () => {
  router.push('/discover/rankings')
}

const goToPlaylists = () => {
  router.push('/discover/playlist-square')
}

const goToNewSongs = () => {
  router.push('/discover/new-music')
}

const goToArtists = () => {
  router.push('/discover/artists')
}

const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`)
}

const goToArtist = (id: number) => {
  router.push(`/artist/${id}`)
}

const formatPlayCount = (count?: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const formatFollowers = (count?: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}

// 生命周期
onMounted(() => {
  discoverStore.loadDiscoverData()
})
</script>

<style scoped>
.discover-page {
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
  background: var(--s-surface);
  border: 1px solid var(--s-border);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-bar:hover {
  background: var(--s-border);
}

.search-bar ion-icon {
  margin-right: 8px;
  color: var(--s-text-secondary);
}

.search-placeholder {
  color: var(--s-text-secondary);
  font-size: 14px;
}

.quick-nav {
  margin-bottom: 32px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 8px;
}

.nav-icon.ranking { background: linear-gradient(135deg, #ff6b6b, #ff8e8e); }
.nav-icon.playlists { background: linear-gradient(135deg, #4ecdc4, #6dd5ed); }
.nav-icon.new-songs { background: linear-gradient(135deg, #a8edea, #fed6e3); }
.nav-icon.artists { background: linear-gradient(135deg, #ffd89b, #19547b); }

.nav-label {
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

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.playlist-card,
.artist-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.playlist-card:active,
.artist-card:active {
  transform: scale(0.95);
}

.playlist-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.artist-avatar {
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 8px;
}

.playlist-cover img,
.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-count {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  color: white;
  font-size: 12px;
}

.play-count ion-icon {
  margin-right: 4px;
  font-size: 14px;
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
.artist-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.playlist-desc,
.artist-followers {
  font-size: 12px;
  margin: 0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--s-surface);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ranking-item:hover {
  background: var(--s-border);
}

.ranking-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.ranking-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ranking-number {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--s-primary);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.ranking-songs {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  gap: 4px;
}

.song-index {
  color: var(--s-text-secondary);
  width: 16px;
  flex-shrink: 0;
}

.song-name {
  flex: 1;
  min-width: 0;
}

.song-artist {
  font-size: 11px;
  margin-left: auto;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .playlist-grid {
    grid-template-columns: 1fr;
  }

  .artist-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .nav-grid {
    gap: 12px;
  }

  .nav-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
