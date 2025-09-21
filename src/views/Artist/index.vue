<template>
  <IonPage>
    <!-- 沉浸式头部，无传统Header -->
    <IonContent :fullscreen="true" class="artist-content">
      <div class="artist-page">
        <!-- 沉浸式艺术家头部 -->
        <div class="artist-hero" :style="{ backgroundImage: `url(${currentArtist?.cover || '/images/artist-bg.jpg'})` }">
          <!-- 背景渐变遮罩 -->
          <div class="hero-overlay"></div>

          <!-- 顶部操作栏 -->
          <div class="top-bar">
            <BackButton color="light" />

            <div class="top-actions">
              <IonButton fill="clear" color="light" @click="shareArtist">
                <IonIcon :icon="shareOutline" />
              </IonButton>
              <IonButton fill="clear" color="light" @click="moreActions">
                <IonIcon :icon="ellipsisVerticalOutline" />
              </IonButton>
            </div>
          </div>

          <!-- 艺术家信息 -->
          <div class="hero-content">
            <div class="artist-avatar-container">
              <div class="artist-avatar">
                <img
                  :src="currentArtist?.cover || ''"
                  :alt="currentArtist?.name"
                  @error="handleImageError"
                />
                <div class="verified-badge" v-if="currentArtist?.isFollowed">
                  <IonIcon :icon="checkmarkCircleOutline" />
                </div>
              </div>
            </div>

            <div class="artist-info">
              <h1 class="artist-title">{{ currentArtist?.name || '加载中...' }}</h1>

              <div class="artist-stats">
                <span>{{ formatNumber(currentArtist?.followers) }}粉丝</span>
                <span class="separator">•</span>
                <span>{{ currentArtist?.songsCount || 0 }}首歌</span>
                <span class="separator">•</span>
                <span>{{ currentArtist?.albumsCount || 0 }}张专辑</span>
              </div>

              <div v-if="currentArtist?.description" class="artist-description">
                <p :class="{ 'description-collapsed': !descriptionExpanded }">
                  {{ currentArtist.description }}
                </p>
                <div v-if="currentArtist.description.length > 100" class="description-toggle" @click="descriptionExpanded = !descriptionExpanded">
                  {{ descriptionExpanded ? '收起' : '展开' }}
                  <IonIcon :icon="descriptionExpanded ? chevronUpOutline : chevronDownOutline" />
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="hero-actions">
            <IonButton
              expand="block"
              class="play-all-button"
              @click="playAll"
              :disabled="!artistSongs.length"
            >
              <IonIcon :icon="play" slot="start" />
              播放全部
            </IonButton>

            <div class="action-row">
              <IonButton
                fill="clear"
                color="light"
                @click="handleFollow"
                :color="currentArtist?.isFollowed ? 'danger' : 'light'"
              >
                <IonIcon :icon="currentArtist?.isFollowed ? heart : heartOutline" />
                {{ currentArtist?.isFollowed ? '已关注' : '关注' }}
              </IonButton>

              <IonButton fill="clear" color="light" @click="shufflePlay">
                <IonIcon :icon="shuffleOutline" />
                随机播放
              </IonButton>

              <IonButton fill="clear" color="light" @click="shareArtist">
                <IonIcon :icon="shareOutline" />
                分享
              </IonButton>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-section">
          <!-- 选项卡 -->
          <div class="section-tabs">
            <IonSegment v-model="selectedTab" @ionChange="handleTabChange">
              <IonSegmentButton value="songs">
                <IonLabel>单曲</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="albums">
                <IonLabel>专辑</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="videos">
                <IonLabel>视频</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <IonSpinner name="circular" />
            <p>加载中...</p>
          </div>

          <!-- 单曲列表 -->
          <div v-else-if="selectedTab === 'songs' && artistSongs.length > 0" class="songs-list">
            <div
              v-for="(song, index) in artistSongs"
              :key="song.id"
              class="song-item"
              :class="{ playing: currentSong?.id === song.id }"
              @click="playSong(song, index)"
            >
              <!-- 歌曲编号/播放状态 -->
              <div class="song-index">
                <span v-if="currentSong?.id !== song.id">{{ index + 1 }}</span>
                <IonIcon v-else :icon="volumeHighOutline" color="primary" />
              </div>

              <!-- 歌曲信息 -->
              <div class="song-main">
                <div class="song-cover">
                  <img
                    :src="song.cover || currentArtist?.cover || '/images/album.jpg'"
                    :alt="song.name"
                    @error="handleImageError"
                  />
                </div>

                <div class="song-info">
                  <h3 class="song-name s-text-truncate">{{ song.name }}</h3>
                  <p class="song-meta s-text-secondary s-text-truncate">
                    {{ song.album?.name }} • {{ formatDuration(song.duration) }}
                    <span v-if="song.playCount"> • {{ formatPlayCount(song.playCount) }}次播放</span>
                  </p>
                </div>
              </div>

              <!-- 歌曲操作 -->
              <div class="song-actions">
                <IonButton
                  fill="clear"
                  size="small"
                  @click.stop="toggleSongLike(song.id)"
                  :color="musicStore.isLiked(song.id) ? 'primary' : 'medium'"
                >
                  <IonIcon :icon="musicStore.isLiked(song.id) ? heart : heartOutline" />
                </IonButton>

                <IonButton fill="clear" size="small" @click.stop="showSongMenu(song)">
                  <IonIcon :icon="ellipsisVerticalOutline" />
                </IonButton>
              </div>
            </div>

            <!-- 无限滚动 -->
            <IonInfiniteScroll 
              @ionInfinite="loadMoreSongs" 
              threshold="100px" 
              :disabled="!hasMoreSongs"
            >
              <IonInfiniteScrollContent
                loading-spinner="bubbles"
                loading-text="加载更多歌曲..."
              >
              </IonInfiniteScrollContent>
            </IonInfiniteScroll>

            <!-- 没有更多提示 -->
            <div v-if="!hasMoreSongs && artistSongs.length > 0" class="no-more">
              已显示全部 {{ artistSongs.length }} 首歌曲
            </div>
          </div>

          <!-- 专辑列表 -->
          <div v-else-if="selectedTab === 'albums'" class="albums-section">
            <div v-if="artistAlbums.length > 0" class="albums-grid">
              <div
                v-for="album in artistAlbums"
                :key="album.id"
                class="album-item"
                @click="goToAlbum(album.id)"
              >
                <div class="album-cover">
                  <img :src="album.cover" :alt="album.name" @error="handleImageError" />
                  <div class="album-overlay">
                    <IonIcon :icon="play" />
                  </div>
                </div>
                <div class="album-info">
                  <h4>{{ album.name }}</h4>
                  <p>{{ album.publishTime }} · {{ album.songsCount }}首</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <IonIcon :icon="albumsOutline" class="empty-icon" />
              <h3>暂无专辑</h3>
              <p>该艺术家暂时没有专辑</p>
            </div>
          </div>

          <!-- 视频列表 -->
          <div v-else-if="selectedTab === 'videos'" class="videos-section">
            <div v-if="artistVideos.length > 0" class="videos-grid">
              <div
                v-for="video in artistVideos"
                :key="video.id"
                class="video-item"
                @click="playVideo(video.id)"
              >
                <div class="video-cover">
                  <img :src="video.cover" :alt="video.name" @error="handleImageError" />
                  <div class="video-overlay">
                    <IonIcon :icon="play" />
                  </div>
                  <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                </div>
                <div class="video-info">
                  <h4>{{ video.name }}</h4>
                  <p>{{ formatNumber(video.playCount) }}次播放 · {{ video.publishTime }}</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <IonIcon :icon="volumeHighOutline" class="empty-icon" />
              <h3>暂无视频</h3>
              <p>该艺术家暂时没有视频</p>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <IonIcon :icon="musicalNotesOutline" class="empty-icon" />
            <h3>暂无内容</h3>
            <p>该艺术家暂时没有相关内容</p>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  actionSheetController,
  toastController
} from '@ionic/vue'
import {
  arrowBackOutline,
  shareOutline,
  ellipsisVerticalOutline,
  play,
  heart,
  heartOutline,
  shuffleOutline,
  checkmarkCircleOutline,
  volumeHighOutline,
  musicalNotesOutline,
  albumsOutline,
  peopleOutline,
  chevronUpOutline,
  chevronDownOutline
} from 'ionicons/icons'
import { useArtistStore } from '@/stores/artist'
import { useMusicStore } from '@/stores/music'
import { formatNumber, formatDuration } from '@/utils/format'
import { useSwipeBack } from '@/composables/useSwipeBack'
import BackButton from '@/components/common/BackButton.vue'

const route = useRoute()
const router = useRouter()
const artistStore = useArtistStore()
const musicStore = useMusicStore()

// 启用侧滑返回
const { goBack } = useSwipeBack()

const selectedTab = ref('songs')
const descriptionExpanded = ref(false)

// 使用 storeToRefs 保持响应性
const { currentArtist, artistSongs, artistAlbums, artistVideos, similarArtists, loading, loadingMore, hasMoreSongs } = storeToRefs(artistStore)
const currentSong = computed(() => musicStore.currentSong)

onMounted(() => {
  const artistId = parseInt(route.params.id as string)
  if (artistId) {
    artistStore.loadArtist(artistId)
    // 根据当前标签页加载对应数据
    if (selectedTab.value === 'albums') {
      artistStore.loadArtistAlbums(artistId)
    } else if (selectedTab.value === 'videos') {
      artistStore.loadArtistVideos(artistId)
    }
  }
})

// formatNumber 和 formatDuration 已从 utils/format 导入

const formatPlayCount = (count?: number) => {
  return formatNumber(count)
}

const shareArtist = () => {
  // TODO: 分享艺术家
  console.log('分享艺术家')
}

const moreActions = () => {
  // TODO: 更多操作
  console.log('更多操作')
}

const handleFollow = async () => {
  if (!currentArtist.value) return

  try {
    if (currentArtist.value.isFollowed) {
      await artistStore.unfollowArtist(currentArtist.value.id)
      showToast('已取消关注')
    } else {
      await artistStore.followArtist(currentArtist.value.id)
      showToast('关注成功')
    }
  } catch (error) {
    showToast('操作失败')
  }
}

const playAll = () => {
  if (artistSongs.value.length > 0) {
    musicStore.setPlaylist(artistSongs.value, 0)
  }
}

const shufflePlay = () => {
  if (artistSongs.value.length > 0) {
    // 随机打乱播放列表
    const shuffled = [...artistSongs.value].sort(() => Math.random() - 0.5)
    musicStore.setPlaylist(shuffled, 0)
    showToast('开始随机播放')
  }
}

const playSong = (song: any, index: number) => {
  musicStore.setPlaylist(artistSongs.value, index)
}

const toggleSongLike = (songId: number) => {
  musicStore.toggleLike(songId)
}

const showSongMenu = async (song: any) => {
  const actionSheet = await actionSheetController.create({
    header: song.name,
    buttons: [
      {
        text: '立即播放',
        icon: play,
        handler: () => {
          const index = artistSongs.value.findIndex(s => s.id === song.id)
          playSong(song, index)
        }
      },
      {
        text: '下一首播放',
        handler: () => {
          // TODO: 添加到播放队列下一首
          showToast('已添加到下一首播放')
        }
      },
      {
        text: '添加到歌单',
        handler: () => {
          // TODO: 显示歌单选择器
          showToast('功能开发中')
        }
      },
      {
        text: '分享',
        handler: () => {
          // TODO: 分享功能
          showToast('功能开发中')
        }
      },
      {
        text: '取消',
        role: 'cancel'
      }
    ]
  })

  await actionSheet.present()
}

const handleTabChange = (event: any) => {
  selectedTab.value = event.detail.value
  const artistId = parseInt(route.params.id as string)

  // 根据标签页加载对应数据
  if (artistId) {
    if (selectedTab.value === 'albums' && artistAlbums.value.length === 0) {
      artistStore.loadArtistAlbums(artistId)
    } else if (selectedTab.value === 'videos' && artistVideos.value.length === 0) {
      artistStore.loadArtistVideos(artistId)
    }
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const goToAlbum = (albumId: number) => {
  router.push({ name: 'Album', params: { id: albumId } })
}

const playVideo = (videoId: number) => {
  // TODO: 播放视频
  console.log('播放视频:', videoId)
}

const showToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom'
  })
  await toast.present()
}

// 加载更多歌曲
const loadMoreSongs = async (event: any) => {
  const artistId = parseInt(route.params.id as string)
  if (artistId && hasMoreSongs.value) {
    await artistStore.loadArtistSongs(artistId, false)
  }
  event.target.complete()
}
</script>

<style scoped>
.artist-content {
  --padding-top: 0 !important;
  --padding-bottom: 120px;
}

.artist-page {
  min-height: 100vh;
}

/* 沉浸式头部区域 */
.artist-hero {
  position: relative;
  min-height: 70vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  color: white;
  padding: var(--ion-safe-area-top) 20px 20px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(168, 230, 207, 0.2) 0%,
    rgba(45, 90, 61, 0.4) 50%,
    rgba(26, 46, 35, 0.8) 100%
  );
  backdrop-filter: blur(8px);
}

/* 顶部操作栏 */
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  --background: rgba(0, 0, 0, 0.3);
  --border-radius: 50%;
  width: 44px;
  height: 44px;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.top-actions ion-button {
  --background: rgba(0, 0, 0, 0.3);
  --border-radius: 50%;
  width: 44px;
  height: 44px;
}

/* 英雄内容区域 */
.hero-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 30px;
}

.artist-avatar-container {
  margin-bottom: 24px;
}

.artist-avatar {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

.artist-avatar:active {
  transform: scale(0.98);
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: var(--ion-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 艺术家信息 */
.artist-info {
  max-width: 100%;
}

.artist-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 16px 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.artist-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.separator {
  opacity: 0.6;
}

.artist-description {
  max-width: 320px;
  text-align: center;
}

.artist-description p {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.artist-description .description-collapsed {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.description-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  transition: all 0.2s ease;
  align-self: center;
}

.description-toggle:hover {
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

.description-toggle ion-icon {
  font-size: 14px;
}

/* 英雄操作按钮 */
.hero-actions {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.play-all-button {
  --background: var(--s-primary);
  --color: white;
  --border-radius: 25px;
  height: 50px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 20px rgba(168, 230, 207, 0.4);
}

.action-row {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.action-row ion-button {
  --background: rgba(0, 0, 0, 0.3);
  --color: white;
  --border-radius: 20px;
  backdrop-filter: blur(10px);
  font-size: 12px;
  flex-direction: column;
  height: auto;
  padding: 12px 16px;
}

/* 内容区域 */
.content-section {
  background: var(--ion-background-color);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 20px;
  position: relative;
  z-index: 5;
  margin-top: -20px;
}

.section-tabs {
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.loading-container p {
  margin-top: 16px;
  color: var(--ion-color-medium);
}

/* 歌曲列表 */
.songs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: var(--ion-color-light-shade);
  transform: translateX(4px);
}

.song-item.playing {
  background: rgba(var(--ion-color-primary-rgb), 0.1);
  border: 1px solid var(--ion-color-primary);
}

.song-item.playing .song-name {
  color: var(--ion-color-primary);
  font-weight: 600;
}

.song-index {
  width: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-right: 12px;
}

.song-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--ion-color-dark);
}

.song-meta {
  font-size: 13px;
  margin: 0;
  color: var(--ion-color-medium);
}

.song-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* 专辑网格 */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 16px;
}

.album-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.album-item:active {
  transform: scale(0.98);
}

.album-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.album-item:hover .album-overlay {
  opacity: 1;
}

.album-overlay ion-icon {
  font-size: 32px;
  color: white;
}

.album-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-info p {
  margin: 0;
  font-size: 12px;
  color: var(--ion-color-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 视频网格 */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 16px;
}

.video-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.video-item:active {
  transform: scale(0.98);
}

.video-cover {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.video-item:hover .video-overlay {
  opacity: 1;
}

.video-overlay ion-icon {
  font-size: 24px;
  color: white;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-info p {
  margin: 0;
  font-size: 12px;
  color: var(--ion-color-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 空状态和开发中状态 */
.empty-state,
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.empty-icon,
.coming-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state h3,
.coming-soon h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--ion-color-dark);
}

.empty-state p,
.coming-soon p {
  margin: 0;
  color: var(--ion-color-medium);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .artist-hero {
    min-height: 60vh;
    padding: var(--ion-safe-area-top) 16px 16px;
  }

  .artist-avatar {
    width: 150px;
    height: 150px;
  }

  .artist-title {
    font-size: 28px;
  }

  .artist-stats {
    font-size: 14px;
    flex-wrap: wrap;
    gap: 6px;
  }

  .action-row {
    flex-wrap: wrap;
    gap: 12px;
  }

  .action-row ion-button {
    flex: 1;
    min-width: 80px;
  }

  .content-section {
    padding: 20px 16px 16px;
    margin-top: -16px;
  }
}

/* 适配安全区域 */
@supports (padding: max(0px)) {
  .artist-hero {
    padding-top: max(var(--ion-safe-area-top), 20px);
  }
}
</style>
