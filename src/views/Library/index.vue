<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>我的音乐</IonTitle>
        <IonButtons slot="end" v-if="userStore.isLoggedIn">
          <IonButton @click="openProfile">
            <IonAvatar class="user-avatar">
              <img
                :src="userStore.userProfile?.avatar || '/images/default-avatar.jpg'"
                :alt="userStore.userProfile?.nickname"
                @error="handleAvatarError"
              />
            </IonAvatar>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="library-page">
        <!-- 未登录状态 -->
        <div v-if="!userStore.isLoggedIn" class="login-prompt">
          <div class="login-content">
            <IonIcon :icon="personCircleOutline" class="login-icon" />
            <h2>登录发现更多精彩</h2>
            <p class="login-desc">登录后可同步歌单、收藏音乐</p>
            <IonButton expand="block" @click="openLogin">
              立即登录
            </IonButton>
          </div>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="library-content">
          <!-- 用户信息卡片 -->
          <div class="user-card">
            <div class="user-info">
              <IonAvatar class="user-avatar-large">
                <img
                  :src="userStore.userProfile?.avatar || '/images/default-avatar.jpg'"
                  :alt="userStore.userProfile?.nickname"
                  @error="handleAvatarError"
                />
              </IonAvatar>
              <div class="user-details">
                <h2 class="user-name">{{ userStore.userProfile?.nickname }}</h2>
                <div class="user-badges">
                  <IonChip v-if="userStore.userProfile?.vipType" color="warning" outline>
                    <IonIcon :icon="starOutline" />
                    <IonLabel>VIP</IonLabel>
                  </IonChip>
                  <IonChip color="primary" outline>
                    <IonLabel>Lv.{{ userStore.userProfile?.level || 1 }}</IonLabel>
                  </IonChip>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速访问 -->
          <div class="quick-access">
            <div class="access-item" @click="goToLikedSongs">
              <div class="access-icon liked">
                <IonIcon :icon="heart" />
              </div>
              <div class="access-info">
                <h3>我喜欢的音乐</h3>
                <p class="s-text-secondary">{{ likedSongsCount }}首歌曲</p>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="access-arrow" />
            </div>

            <div class="access-item" @click="goToRecentPlayed">
              <div class="access-icon recent">
                <IonIcon :icon="timeOutline" />
              </div>
              <div class="access-info">
                <h3>最近播放</h3>
                <p class="s-text-secondary">{{ recentPlayedCount }}首歌曲</p>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="access-arrow" />
            </div>

            <div class="access-item" @click="goToMyCloud">
              <div class="access-icon cloud">
                <IonIcon :icon="cloudOutline" />
              </div>
              <div class="access-info">
                <h3>我的云盘</h3>
                <p class="s-text-secondary">{{ cloudSongsCount }}首歌曲</p>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="access-arrow" />
            </div>
          </div>

          <!-- 创建的歌单 -->
          <section class="content-section">
            <div class="section-header">
              <h2 class="section-title">创建的歌单</h2>
              <IonButton fill="clear" size="small" @click="createPlaylist">
                <IonIcon :icon="addOutline" />
                新建
              </IonButton>
            </div>

            <div class="playlist-list">
              <div
                v-for="playlist in createdPlaylists"
                :key="playlist.id"
                class="playlist-item"
                @click="goToPlaylist(playlist.id)"
              >
                <div class="playlist-cover">
                  <img
                    :src="playlist.cover"
                    :alt="playlist.name"
                    @error="handleImageError"
                  />
                </div>
                <div class="playlist-info">
                  <h3 class="playlist-name s-text-truncate">{{ playlist.name }}</h3>
                  <p class="playlist-count s-text-secondary">{{ playlist.trackCount }}首歌曲</p>
                </div>
                <IonButton fill="clear" size="small" @click.stop="moreActions(playlist)">
                  <IonIcon :icon="ellipsisVerticalOutline" />
                </IonButton>
              </div>
            </div>
          </section>

          <!-- 收藏的歌单 -->
          <section class="content-section">
            <div class="section-header">
              <h2 class="section-title">收藏的歌单</h2>
            </div>

            <div class="playlist-list">
              <div
                v-for="playlist in collectedPlaylists"
                :key="playlist.id"
                class="playlist-item"
                @click="goToPlaylist(playlist.id)"
              >
                <div class="playlist-cover">
                  <img
                    :src="playlist.cover"
                    :alt="playlist.name"
                    @error="handleImageError"
                  />
                </div>
                <div class="playlist-info">
                  <h3 class="playlist-name s-text-truncate">{{ playlist.name }}</h3>
                  <p class="playlist-creator s-text-secondary">by {{ playlist.creator }}</p>
                </div>
                <IonButton fill="clear" size="small" @click.stop="moreActions(playlist)">
                  <IonIcon :icon="ellipsisVerticalOutline" />
                </IonButton>
              </div>
            </div>
          </section>

          <!-- 收藏的专辑/歌手 -->
          <section class="content-section">
            <div class="section-header">
              <h2 class="section-title">我的收藏</h2>
            </div>

            <div class="collection-tabs">
              <IonSegment v-model="activeTab" @ionChange="handleTabChange">
                <IonSegmentButton value="albums">
                  <IonLabel>专辑</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="artists">
                  <IonLabel>歌手</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>

            <!-- 专辑列表 -->
            <div v-if="activeTab === 'albums'" class="collection-grid">
              <div
                v-for="album in collectedAlbums"
                :key="album.id"
                class="collection-item"
                @click="goToAlbum(album.id)"
              >
                <div class="collection-cover">
                  <img
                    :src="album.cover"
                    :alt="album.name"
                    @error="handleImageError"
                  />
                </div>
                <h3 class="collection-name s-text-truncate">{{ album.name }}</h3>
                <p class="collection-artist s-text-secondary s-text-truncate">{{ album.artist }}</p>
              </div>
            </div>

            <!-- 歌手列表 -->
            <div v-if="activeTab === 'artists'" class="collection-grid">
              <div
                v-for="artist in collectedArtists"
                :key="artist.id"
                class="collection-item"
                @click="goToArtist(artist.id)"
              >
                <div class="collection-cover artist-cover">
                  <img
                    :src="artist.cover"
                    :alt="artist.name"
                    @error="handleImageError"
                  />
                </div>
                <h3 class="collection-name s-text-truncate">{{ artist.name }}</h3>
                <p class="collection-followers s-text-secondary">{{ formatFollowers(artist.followers) }}关注</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonAvatar,
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton
} from '@ionic/vue'
import {
  personCircleOutline,
  heart,
  timeOutline,
  cloudOutline,
  chevronForwardOutline,
  addOutline,
  ellipsisVerticalOutline,
  starOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLibraryStore } from '@/stores/library'

const router = useRouter()
const userStore = useUserStore()
const libraryStore = useLibraryStore()

// 响应式状态
const activeTab = ref('albums')

// 计算属性
const likedSongsCount = computed(() => libraryStore.likedSongsCount)
const recentPlayedCount = computed(() => libraryStore.recentPlayedCount)
const cloudSongsCount = computed(() => libraryStore.cloudSongsCount)
const createdPlaylists = computed(() => libraryStore.createdPlaylists)
const collectedPlaylists = computed(() => libraryStore.collectedPlaylists)
const collectedAlbums = computed(() => libraryStore.collectedAlbums)
const collectedArtists = computed(() => libraryStore.collectedArtists)

// 方法
const openLogin = () => {
  router.push('/login')
}

const openProfile = () => {
  router.push('/profile')
}

const goToLikedSongs = () => {
  router.push('/liked-songs')
}

const goToRecentPlayed = () => {
  router.push('/recent-played')
}

const goToMyCloud = () => {
  router.push('/my-cloud')
}

const createPlaylist = () => {
  // TODO: 打开创建歌单弹窗
  console.log('创建歌单')
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

const moreActions = (item: any) => {
  // TODO: 打开更多操作菜单
  console.log('更多操作', item)
}

const handleTabChange = (event: CustomEvent) => {
  activeTab.value = event.detail.value
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

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/default-avatar.jpg'
}

// 生命周期
onMounted(() => {
  if (userStore.isLoggedIn) {
    libraryStore.loadLibraryData()
  }
})
</script>

<style scoped>
.library-page {
  padding: 16px;
  padding-bottom: 120px;
}

.login-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.login-content {
  text-align: center;
  padding: 32px;
}

.login-icon {
  font-size: 80px;
  color: var(--s-text-secondary);
  margin-bottom: 16px;
}

.login-content h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.login-desc {
  margin: 0 0 24px 0;
  color: var(--s-text-secondary);
}

.user-card {
  background: var(--s-surface);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar,
.user-avatar-large {
  width: 60px;
  height: 60px;
  margin-right: 16px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  margin-right: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
}

.user-badges {
  display: flex;
  gap: 8px;
}

.quick-access {
  margin-bottom: 32px;
}

.access-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--s-surface);
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.access-item:hover {
  background: var(--s-border);
}

.access-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-right: 16px;
}

.access-icon.liked { background: linear-gradient(135deg, #ff6b6b, #ff8e8e); }
.access-icon.recent { background: linear-gradient(135deg, #4ecdc4, #6dd5ed); }
.access-icon.cloud { background: linear-gradient(135deg, #a8edea, #fed6e3); }

.access-info {
  flex: 1;
}

.access-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
}

.access-info p {
  margin: 0;
  font-size: 14px;
}

.access-arrow {
  color: var(--s-text-secondary);
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

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--s-surface);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-item:hover {
  background: var(--s-border);
}

.playlist-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.playlist-count,
.playlist-creator {
  font-size: 12px;
  margin: 0;
}

.collection-tabs {
  margin-bottom: 16px;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.collection-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.collection-item:active {
  transform: scale(0.95);
}

.collection-cover {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.collection-cover.artist-cover {
  border-radius: 50%;
}

.collection-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.collection-artist,
.collection-followers {
  font-size: 12px;
  margin: 0;
}

@media (max-width: 480px) {
  .collection-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .user-badges {
    flex-wrap: wrap;
  }
}
</style>
