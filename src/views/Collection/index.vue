<template>
  <IonPage>
    <IonContent :fullscreen="true">
      <div class="collection-page">
        <!-- 头部标题 -->
        <div class="welcome-header">
          <h1 class="greeting">我的收藏</h1>
          <p class="subtitle s-text-secondary">珍藏的音乐时光</p>
        </div>

        <!-- 收藏统计 -->
        <div class="stats-container">
          <div class="stats-grid">
            <div class="stat-item" @click="switchTab('playlists')">
              <div class="stat-icon playlists">
                <IonIcon :icon="musicalNotesOutline" />
              </div>
              <div class="stat-info">
                <span class="stat-number">{{ collectionStore.playlistsCount }}</span>
                <span class="stat-label">歌单</span>
              </div>
            </div>

            <div class="stat-item" @click="switchTab('albums')">
              <div class="stat-icon albums">
                <IonIcon :icon="albumsOutline" />
              </div>
              <div class="stat-info">
                <span class="stat-number">{{ collectionStore.albumsCount }}</span>
                <span class="stat-label">专辑</span>
              </div>
            </div>

            <div class="stat-item" @click="switchTab('artists')">
              <div class="stat-icon artists">
                <IonIcon :icon="micOutline" />
              </div>
              <div class="stat-info">
                <span class="stat-number">{{ collectionStore.artistsCount }}</span>
                <span class="stat-label">歌手</span>
              </div>
            </div>

            <div class="stat-item" @click="switchTab('videos')">
              <div class="stat-icon videos">
                <IonIcon :icon="videocamOutline" />
              </div>
              <div class="stat-info">
                <span class="stat-number">{{ collectionStore.videosCount }}</span>
                <span class="stat-label">视频</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 标签页切换 -->
        <div class="tabs-container">
          <IonSegment v-model="activeTab" @ionChange="handleTabChange">
            <IonSegmentButton value="playlists">
              <IonLabel>歌单</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="albums">
              <IonLabel>专辑</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="artists">
              <IonLabel>歌手</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="videos">
              <IonLabel>视频</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <!-- 内容区域 -->
        <div class="content-area">
          <!-- 收藏的歌单 -->
          <div v-if="activeTab === 'playlists'" class="content-section">
            <div v-if="loading" class="loading-container">
              <IonSpinner></IonSpinner>
              <p>加载中...</p>
            </div>

            <div v-else-if="collectionStore.collectedPlaylists.length > 0" class="playlist-grid">
              <div
                v-for="playlist in collectionStore.collectedPlaylists"
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
                <p class="playlist-creator s-text-secondary s-text-truncate">by {{ playlist.creator }}</p>
              </div>
            </div>

            <div v-else class="empty-state">
              <IonIcon :icon="musicalNotesOutline" class="empty-icon" />
              <p>还没有收藏歌单</p>
              <IonButton fill="outline" @click="goToDiscover">去发现</IonButton>
            </div>
          </div>

          <!-- 收藏的专辑 -->
          <div v-if="activeTab === 'albums'" class="content-section">
            <div v-if="loading" class="loading-container">
              <IonSpinner></IonSpinner>
              <p>加载中...</p>
            </div>

            <div v-else-if="collectionStore.collectedAlbums.length > 0" class="album-grid">
              <div
                v-for="album in collectionStore.collectedAlbums"
                :key="album.id"
                class="album-card"
                @click="goToAlbum(album.id)"
              >
                <div
                  class="album-cover"
                  :style="{backgroundImage: `url(${album.cover})`}"
                >
                  <div class="play-button">
                    <IonIcon :icon="play" />
                  </div>
                </div>
                <h3 class="album-name s-text-truncate">{{ album.name }}</h3>
                <p class="album-artist s-text-secondary s-text-truncate">{{ album.artist }}</p>
              </div>
            </div>

            <div v-else class="empty-state">
              <IonIcon :icon="albumsOutline" class="empty-icon" />
              <p>还没有收藏专辑</p>
              <IonButton fill="outline" @click="goToDiscover">去发现</IonButton>
            </div>
          </div>

          <!-- 收藏的歌手 -->
          <div v-if="activeTab === 'artists'" class="content-section">
            <div v-if="loading" class="loading-container">
              <IonSpinner></IonSpinner>
              <p>加载中...</p>
            </div>

            <div v-else-if="collectionStore.collectedArtists.length > 0" class="artist-grid">
              <div
                v-for="artist in collectionStore.collectedArtists"
                :key="artist.id"
                class="artist-card"
                @click="goToArtist(artist.id)"
              >
                <div
                  class="artist-avatar"
                  :style="{backgroundImage: `url(${artist.cover})`}"
                ></div>
                <h3 class="artist-name s-text-truncate">{{ artist.name }}</h3>
                <p class="artist-followers s-text-secondary">{{ formatFollowers(artist.followers) }}关注</p>
              </div>
            </div>

            <div v-else class="empty-state">
              <IonIcon :icon="micOutline" class="empty-icon" />
              <p>还没有收藏歌手</p>
              <IonButton fill="outline" @click="goToDiscover">去发现</IonButton>
            </div>
          </div>

          <!-- 收藏的视频 -->
          <div v-if="activeTab === 'videos'" class="content-section">
            <div v-if="loading" class="loading-container">
              <IonSpinner></IonSpinner>
              <p>加载中...</p>
            </div>

            <div v-else-if="collectionStore.collectedVideos.length > 0" class="video-grid">
              <div
                v-for="video in collectionStore.collectedVideos"
                :key="video.id"
                class="video-card"
                @click="goToVideo(video.id)"
              >
                <div
                  class="video-cover"
                  :style="{backgroundImage: `url(${video.cover})`}"
                >
                  <div class="play-button">
                    <IonIcon :icon="playCircleOutline" />
                  </div>
                  <div class="video-duration">{{ video.duration }}</div>
                </div>
                <h3 class="video-name s-text-truncate">{{ video.name }}</h3>
                <p class="video-artist s-text-secondary s-text-truncate">{{ video.artist }}</p>
              </div>
            </div>

            <div v-else class="empty-state">
              <IonIcon :icon="videocamOutline" class="empty-icon" />
              <p>还没有收藏视频</p>
              <IonButton fill="outline" @click="goToDiscover">去发现</IonButton>
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/vue'
import {
  musicalNotesOutline,
  albumsOutline,
  micOutline,
  videocamOutline,
  play,
  playCircleOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useCollectionStore } from '@/stores/collection'

const router = useRouter()
const collectionStore = useCollectionStore()

// 响应式状态
const activeTab = ref('playlists')
const loading = ref(false)

// 方法
const handleTabChange = (event: CustomEvent) => {
  activeTab.value = event.detail.value
}

const switchTab = (tab: string) => {
  activeTab.value = tab
}

const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`)
}

const goToAlbum = (id: number) => {
  router.push(`/album/${id}`)
}

const goToArtist = (id: number) => {
  router.push({ name: 'Artist', query: { id: id.toString() } })
}

const goToVideo = (id: number) => {
  router.push(`/video/${id}`)
}

const goToDiscover = () => {
  router.push('/tabs/discover')
}

const formatFollowers = (count?: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

// 生命周期
onMounted(() => {
  collectionStore.loadCollectionData()
})
</script>

<style scoped>
.collection-page {
  padding: 16px;
  padding-bottom: 120px;
  min-height: 100vh;
  background: var(--s-background);
}

.welcome-header {
  margin-bottom: 24px;
  text-align: left;
}

.greeting {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--s-text-primary);
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.7;
}

.stats-container {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--s-surface);
  border-radius: 16px;
  box-shadow: 0 2px 8px var(--s-shadow-light);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--s-shadow);
  background: var(--s-surface-elevated);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
  color: white;
}

.stat-icon.playlists { background: linear-gradient(135deg, #667eea, #764ba2); }
.stat-icon.albums { background: linear-gradient(135deg, #f093fb, #f5576c); }
.stat-icon.artists { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.stat-icon.videos { background: linear-gradient(135deg, #43e97b, #38f9d7); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: var(--s-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: var(--s-text-secondary);
  margin-top: 2px;
}

.tabs-container {
  margin-bottom: 20px;
}

.content-area {
  flex: 1;
}

.content-section {
  margin-bottom: 32px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--s-text-secondary);
}

.loading-container p {
  margin-top: 12px;
  font-size: 14px;
}

.playlist-grid,
.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.playlist-card,
.album-card,
.video-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px;
  border-radius: 16px;
  background: var(--s-surface);
  box-shadow: 0 2px 8px var(--s-shadow-light);
}

.artist-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 6px;
  border-radius: 12px;
  background: var(--s-surface);
  box-shadow: 0 2px 8px var(--s-shadow-light);
  text-align: center;
}

.playlist-card:hover,
.album-card:hover,
.artist-card:hover,
.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--s-shadow);
  background: var(--s-surface-elevated);
}

.playlist-cover,
.album-cover,
.video-cover {
  aspect-ratio: 1;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: var(--s-border);
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
}

.artist-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: var(--s-border);
  margin: 0 auto 8px auto;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  color: var(--s-text-primary);
  font-size: 18px;
}

.playlist-card:hover .play-button,
.album-card:hover .play-button,
.video-card:hover .play-button {
  opacity: 1;
}

.video-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.playlist-name,
.album-name,
.artist-name,
.video-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--s-text-primary);
}

.playlist-creator,
.album-artist,
.artist-followers,
.video-artist {
  font-size: 12px;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--s-text-tertiary);
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0 0 20px 0;
  color: var(--s-text-secondary);
  font-size: 16px;
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .artist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
