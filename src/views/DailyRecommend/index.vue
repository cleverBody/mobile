<template>
  <IonPage>
    <!-- 沉浸式头部 -->
    <IonContent :fullscreen="true" class="daily-content">
      <div class="daily-page">
        <!-- 沉浸式头部 -->
        <div class="daily-hero">
          <!-- 背景渐变 -->
          <div class="hero-overlay"></div>

          <!-- 顶部操作栏 -->
          <div class="top-bar">
            <BackButton color="light" />

            <div class="top-actions">
              <IonButton fill="clear" color="light" @click="refresh">
                <IonIcon :icon="refreshOutline" />
              </IonButton>
              <IonButton fill="clear" color="light" @click="moreActions">
                <IonIcon :icon="ellipsisVerticalOutline" />
              </IonButton>
            </div>
          </div>

          <!-- 头部内容 -->
          <div class="hero-content">
            <div class="daily-icon">
              <IonIcon :icon="calendarOutline" />
              <span class="date">{{ currentDate }}</span>
            </div>

            <div class="daily-info">
              <h1 class="daily-title">每日推荐</h1>
              <p class="daily-subtitle">根据你的音乐品味精心挑选</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="hero-actions">
            <IonButton
              expand="block"
              class="play-all-button"
              @click="playAll"
              :disabled="!allSongs.length"
            >
              <IonIcon :icon="play" slot="start" />
              播放全部 ({{ allSongs.length }})
            </IonButton>
          </div>
        </div>

        <!-- 歌曲列表区域 -->
        <div class="content-section">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <IonSpinner name="circular" />
            <p>正在为你精选音乐...</p>
          </div>

          <!-- 歌曲列表 -->
          <div v-else-if="allSongs.length > 0" class="songs-list">
            <!-- 每日推荐标题 -->
            <div v-if="dailySongs.length > 0" class="section-title">
              <h2>每日推荐 ({{ dailySongs.length }})</h2>
            </div>

            <!-- 每日推荐歌曲 -->
            <div
              v-for="(song, index) in dailySongs"
              :key="`daily-${song.id}`"
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
                    :src="song.cover || '/images/album.jpg'"
                    :alt="song.name"
                    @error="handleImageError"
                  />
                </div>

                <div class="song-info">
                  <h3 class="song-name s-text-truncate">{{ song.name }}</h3>
                  <p class="song-meta s-text-secondary s-text-truncate">
                    {{ song.artists?.map(a => a.name).join(', ') }}
                    <span v-if="song.album"> - {{ song.album.name }}</span>
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

            <!-- 推荐歌曲标题 -->
            <div v-if="recommendSongs.length > 0" class="section-title">
              <h2>为你推荐 ({{ recommendSongs.length }})</h2>
              <p class="section-subtitle">基于你的音乐品味推荐</p>
            </div>

            <!-- 推荐歌曲 -->
            <div
              v-for="(song, index) in recommendSongs"
              :key="`recommend-${song.id}`"
              class="song-item"
              :class="{ playing: currentSong?.id === song.id }"
              @click="playSong(song, dailySongs.length + index)"
            >
              <!-- 歌曲编号/播放状态 -->
              <div class="song-index">
                <span v-if="currentSong?.id !== song.id">{{ dailySongs.length + index + 1 }}</span>
                <IonIcon v-else :icon="volumeHighOutline" color="primary" />
              </div>

              <!-- 歌曲信息 -->
              <div class="song-main">
                <div class="song-cover">
                  <img
                    :src="song.cover || '/images/album.jpg'"
                    :alt="song.name"
                    @error="handleImageError"
                  />
                </div>

                <div class="song-info">
                  <h3 class="song-name s-text-truncate">{{ song.name }}</h3>
                  <p class="song-meta s-text-secondary s-text-truncate">
                    {{ song.artists?.map(a => a.name).join(', ') }}
                    <span v-if="song.album"> - {{ song.album.name }}</span>
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
          </div>

          <!-- 无限滚动 -->
          <IonInfiniteScroll
            v-if="allSongs.length > 0 && hasMoreRecommend"
            @ionInfinite="loadMoreRecommend"
            threshold="100px"
          >
            <IonInfiniteScrollContent loading-text="加载更多推荐...">
            </IonInfiniteScrollContent>
          </IonInfiniteScroll>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <IonIcon :icon="musicalNotesOutline" class="empty-icon" />
            <h3>暂无推荐</h3>
            <p>请先登录以获取个性化推荐</p>
            <IonButton @click="goToLogin">立即登录</IonButton>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  actionSheetController,
  toastController
} from '@ionic/vue'
import {
  refreshOutline,
  ellipsisVerticalOutline,
  calendarOutline,
  play,
  heart,
  heartOutline,
  volumeHighOutline,
  musicalNotesOutline
} from 'ionicons/icons'
import { useMusicStore } from '@/stores/music'
import { musicApi, formatSong } from '@/api/music'
import { useSwipeBack } from '@/composables/useSwipeBack'
import BackButton from '@/components/common/BackButton.vue'

const router = useRouter()
const musicStore = useMusicStore()

// 启用侧滑返回
const { goBack } = useSwipeBack()

const dailySongs = ref<any[]>([])
const recommendSongs = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMoreRecommend = ref(true)
const currentSong = computed(() => musicStore.currentSong)
const currentDate = computed(() => new Date().getDate())
const allSongs = computed(() => [...dailySongs.value, ...recommendSongs.value])

onMounted(() => {
  loadDailyRecommend()
})

const loadDailyRecommend = async () => {
  loading.value = true
  try {
    // 尝试获取每日推荐，如果失败则使用测试数据
    try {
      const response = await musicApi.getDailyRecommendSongs()
      dailySongs.value = response.data.dailySongs.map(formatSong)
    } catch (error) {
      console.log('获取每日推荐失败，使用默认歌单')
      // 使用一个默认的推荐歌单
      const playlistResponse = await musicApi.getPlaylistDetail(3778678)
      const songsResponse = await musicApi.getPlaylistTracks(3778678, 30)
      dailySongs.value = songsResponse.songs.map(formatSong)
    }

    // 自动加载第一批推荐歌曲
    await loadMoreRecommendSongs()
  } catch (error) {
    console.error('加载每日推荐失败:', error)
    showToast('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  // 重置推荐歌曲
  recommendSongs.value = []
  hasMoreRecommend.value = true
  loadDailyRecommend()
  showToast('已刷新推荐内容')
}

// 加载更多推荐歌曲
const loadMoreRecommendSongs = async () => {
  if (loadingMore.value || !hasMoreRecommend.value) return

  loadingMore.value = true
  try {
    // 使用个性化推荐API获取更多歌曲
    const response = await musicApi.getPersonalizedPlaylists(10)

    if (response.result && response.result.length > 0) {
      // 随机选择一个推荐歌单
      const randomPlaylist = response.result[Math.floor(Math.random() * response.result.length)]

      // 获取歌单中的歌曲
      const songsResponse = await musicApi.getPlaylistTracks(randomPlaylist.id, 20)
      const newSongs = songsResponse.songs.map(formatSong)

      // 过滤掉已存在的歌曲
      const existingIds = new Set([...dailySongs.value, ...recommendSongs.value].map(s => s.id))
      const filteredSongs = newSongs.filter(song => !existingIds.has(song.id))

      if (filteredSongs.length > 0) {
        recommendSongs.value = [...recommendSongs.value, ...filteredSongs]
      } else {
        // 如果没有新歌曲，尝试另一个歌单
        hasMoreRecommend.value = false
      }
    } else {
      hasMoreRecommend.value = false
    }
  } catch (error) {
    console.error('加载推荐歌曲失败:', error)
    hasMoreRecommend.value = false
  } finally {
    loadingMore.value = false
  }
}

// 无限滚动处理
const loadMoreRecommend = async (ev: any) => {
  await loadMoreRecommendSongs()
  ev.target.complete()
}

const moreActions = () => {
  // TODO: 更多操作
  console.log('更多操作')
}

const playAll = () => {
  if (allSongs.value.length > 0) {
    musicStore.setPlaylist(allSongs.value, 0)
  }
}

const playSong = (song: any, index: number) => {
  musicStore.setPlaylist(allSongs.value, index)
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
          const index = dailySongs.value.findIndex(s => s.id === song.id)
          playSong(song, index)
        }
      },
      {
        text: '下一首播放',
        handler: () => {
          showToast('已添加到下一首播放')
        }
      },
      {
        text: '添加到歌单',
        handler: () => {
          showToast('功能开发中')
        }
      },
      {
        text: '分享',
        handler: () => {
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

const goToLogin = () => {
  router.push('/login')
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}

const showToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom'
  })
  await toast.present()
}
</script>

<style scoped>
.daily-content {
  --padding-top: 0 !important;
  --padding-bottom: 120px;
}

.daily-page {
  min-height: 100vh;
}

/* 沉浸式头部区域 */
.daily-hero {
  position: relative;
  min-height: 50vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
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

.daily-icon {
  position: relative;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.daily-icon .date {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 14px;
  font-weight: bold;
  background: var(--ion-color-primary);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.daily-info {
  max-width: 100%;
}

.daily-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.daily-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 操作按钮 */
.hero-actions {
  position: relative;
  z-index: 10;
}

.play-all-button {
  --background: rgba(255, 255, 255, 0.95);
  --color: var(--ion-color-primary);
  --border-radius: 25px;
  height: 50px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--ion-color-dark);
}

.empty-state p {
  margin: 0 0 16px 0;
  color: var(--ion-color-medium);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .daily-hero {
    min-height: 45vh;
    padding: var(--ion-safe-area-top) 16px 16px;
  }

  .daily-icon {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .daily-title {
    font-size: 28px;
  }

  .content-section {
    padding: 20px 16px 16px;
    margin-top: -16px;
  }
}

/* 分区标题样式 */
.section-title {
  margin: 24px 0 16px;
  padding: 0 4px;
}

.section-title h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 4px;
}

.section-subtitle {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 0;
}

.section-title:first-child {
  margin-top: 0;
}
</style>
