<template>
  <IonPage>
    <IonContent :fullscreen="true">
      <div class="profile-page">
        <!-- 未登录状态 -->
        <div v-if="!userStore.isLoggedIn" class="profile-content">
          <!-- 登录提示卡片 -->
          <div class="login-card">
            <div class="login-info">
              <IonAvatar class="login-avatar">
                <IonIcon :icon="personCircleOutline" />
              </IonAvatar>
              <div class="login-details">
                <h2 class="login-title">未登录</h2>
                <p class="login-desc">登录后享受完整功能</p>
              </div>
              <IonButton fill="outline" @click="openLogin">
                登录
              </IonButton>
            </div>
          </div>

          <!-- 快速访问（未登录状态） -->
          <div class="quick-access">
            <div class="access-item" @click="handleLoginRequired('我喜欢的音乐')">
              <div class="access-icon liked">
                <IonIcon :icon="heart" />
              </div>
              <div class="access-info">
                <h3>我喜欢的音乐</h3>
                <p class="s-text-secondary">登录后查看</p>
              </div>
              <IonIcon :icon="lockClosedOutline" class="access-lock" />
            </div>

            <div class="access-item" @click="handleLoginRequired('最近播放')">
              <div class="access-icon recent">
                <IonIcon :icon="timeOutline" />
              </div>
              <div class="access-info">
                <h3>最近播放</h3>
                <p class="s-text-secondary">登录后查看</p>
              </div>
              <IonIcon :icon="lockClosedOutline" class="access-lock" />
            </div>

            <div class="access-item" @click="goToDownloads">
              <div class="access-icon downloads">
                <IonIcon :icon="cloudDownloadOutline" />
              </div>
              <div class="access-info">
                <h3>下载管理</h3>
                <p class="s-text-secondary">本地下载文件</p>
              </div>
              <IonIcon :icon="chevronForwardOutline" class="access-arrow" />
            </div>
          </div>

          <!-- 功能菜单（未登录状态） -->
          <section class="content-section">
            <div class="section-header">
              <h2 class="section-title">我的歌单</h2>
            </div>

            <div class="empty-state">
              <IonIcon :icon="musicalNotesOutline" class="empty-icon" />
              <p>登录后查看和创建歌单</p>
              <IonButton fill="outline" @click="openLogin">立即登录</IonButton>
            </div>
          </section>

          <!-- 设置入口 -->
          <section class="content-section">
            <div class="section-header">
              <h2 class="section-title">设置</h2>
            </div>

            <div class="settings-list">
              <div class="setting-item" @click="goToSettings">
                <div class="setting-icon">
                  <IonIcon :icon="settingsOutline" />
                </div>
                <div class="setting-info">
                  <h3>应用设置</h3>
                  <p class="s-text-secondary">播放、外观、通知等设置</p>
                </div>
                <IonIcon :icon="chevronForwardOutline" class="setting-arrow" />
              </div>

              <div class="setting-item" @click="goToAbout">
                <div class="setting-icon">
                  <IonIcon :icon="informationCircleOutline" />
                </div>
                <div class="setting-info">
                  <h3>关于应用</h3>
                  <p class="s-text-secondary">版本信息和开源许可</p>
                </div>
                <IonIcon :icon="chevronForwardOutline" class="setting-arrow" />
              </div>

              <div class="setting-item" @click="openLogin">
                <div class="setting-icon login">
                  <IonIcon :icon="logInOutline" />
                </div>
                <div class="setting-info">
                  <h3>登录账号</h3>
                  <p class="s-text-secondary">享受完整功能体验</p>
                </div>
                <IonIcon :icon="chevronForwardOutline" class="setting-arrow" />
              </div>
            </div>
          </section>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="profile-content">
          <!-- 用户信息卡片 -->
          <div class="user-card">
            <div class="user-info">
              <IonAvatar class="user-avatar-large">
                <img
                  :src="userStore.userProfile?.avatar || ''"
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
              <IonButton fill="clear" size="small" @click="openProfile">
                <IonIcon :icon="chevronForwardOutline" />
              </IonButton>
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

            <div class="access-item" @click="goToDownloads">
              <div class="access-icon downloads">
                <IonIcon :icon="cloudDownloadOutline" />
              </div>
              <div class="access-info">
                <h3>下载管理</h3>
                <p class="s-text-secondary">{{ downloadedCount }}首歌曲</p>
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

            <div v-if="loading" class="loading-container">
              <IonSpinner></IonSpinner>
              <p>加载中...</p>
            </div>

            <div v-else-if="profileStore.createdPlaylists.length > 0" class="playlist-grid">
              <div
                v-for="playlist in profileStore.createdPlaylists"
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
                <p class="playlist-count s-text-secondary">{{ playlist.trackCount }}首歌曲</p>
                <IonButton fill="clear" size="small" @click.stop="moreActions(playlist)">
                  <IonIcon :icon="ellipsisVerticalOutline" />
                </IonButton>
              </div>
            </div>

            <div v-else class="empty-state">
              <IonIcon :icon="musicalNotesOutline" class="empty-icon" />
              <p>还没有创建歌单</p>
              <IonButton fill="outline" @click="createPlaylist">创建歌单</IonButton>
            </div>
          </section>

          <!-- 设置入口 -->
          <section class="content-section">
            <div class="section-header">
              <h2 class="section-title">设置</h2>
            </div>

            <div class="settings-list">
              <div class="setting-item" @click="goToSettings">
                <div class="setting-icon">
                  <IonIcon :icon="settingsOutline" />
                </div>
                <div class="setting-info">
                  <h3>应用设置</h3>
                  <p class="s-text-secondary">播放、外观、通知等设置</p>
                </div>
                <IonIcon :icon="chevronForwardOutline" class="setting-arrow" />
              </div>

              <div class="setting-item" @click="goToAbout">
                <div class="setting-icon">
                  <IonIcon :icon="informationCircleOutline" />
                </div>
                <div class="setting-info">
                  <h3>关于应用</h3>
                  <p class="s-text-secondary">版本信息和开源许可</p>
                </div>
                <IonIcon :icon="chevronForwardOutline" class="setting-arrow" />
              </div>

              <div class="setting-item logout-item" @click="logout">
                <div class="setting-icon logout">
                  <IonIcon :icon="logOutOutline" />
                </div>
                <div class="setting-info">
                  <h3>退出登录</h3>
                </div>
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
  IonContent,
  IonButton,
  IonIcon,
  IonAvatar,
  IonChip,
  IonLabel,
  IonSpinner,
  alertController
} from '@ionic/vue'
import {
  personCircleOutline,
  heart,
  timeOutline,
  cloudDownloadOutline,
  chevronForwardOutline,
  addOutline,
  ellipsisVerticalOutline,
  starOutline,
  musicalNotesOutline,
  settingsOutline,
  informationCircleOutline,
  logOutOutline,
  logInOutline,
  lockClosedOutline,
  play
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const userStore = useUserStore()
const profileStore = useProfileStore()

// 响应式状态
const loading = ref(false)

// 计算属性
const likedSongsCount = computed(() => profileStore.likedSongsCount)
const recentPlayedCount = computed(() => profileStore.recentPlayedCount)
const downloadedCount = computed(() => profileStore.downloadedCount)

// 方法
const openLogin = () => {
  router.push('/login')
}

const handleLoginRequired = async (featureName: string) => {
  const alert = await alertController.create({
    header: '需要登录',
    message: `使用"${featureName}"功能需要先登录账号`,
    buttons: [
      {
        text: '取消',
        role: 'cancel'
      },
      {
        text: '去登录',
        handler: () => {
          openLogin()
        }
      }
    ]
  })
  await alert.present()
}

const openProfile = () => {
  router.push('/user-profile')
}

const goToLikedSongs = () => {
  router.push('/liked-songs')
}

const goToRecentPlayed = () => {
  router.push('/recent-played')
}

const goToDownloads = () => {
  router.push('/downloads')
}

const createPlaylist = () => {
  // TODO: 打开创建歌单弹窗
  console.log('创建歌单')
}

const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`)
}

const moreActions = (item: any) => {
  // TODO: 打开更多操作菜单
  console.log('更多操作', item)
}

const goToSettings = () => {
  router.push('/settings')
}

const goToAbout = () => {
  router.push('/about')
}

const logout = async () => {
  const alert = await alertController.create({
    header: '退出登录',
    message: '确定要退出当前账号吗？',
    buttons: [
      {
        text: '取消',
        role: 'cancel'
      },
      {
        text: '确定',
        handler: () => {
          userStore.logout()
        }
      }
    ]
  })
  await alert.present()
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

// 生命周期
onMounted(() => {
  if (userStore.isLoggedIn) {
    profileStore.loadProfileData()
  }
})
</script>

<style scoped>
.profile-page {
  padding: 16px;
  padding-bottom: 120px;
  min-height: 100vh;
  background: var(--s-background);
}

.login-card {
  background: var(--s-surface);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--s-shadow-light);
}

.login-info {
  display: flex;
  align-items: center;
}

.login-avatar {
  width: 60px;
  height: 60px;
  margin-right: 16px;
  background: var(--s-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-avatar ion-icon {
  font-size: 32px;
  color: var(--s-text-secondary);
}

.login-details {
  flex: 1;
}

.login-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: bold;
  color: var(--s-text-primary);
}

.login-desc {
  margin: 0;
  font-size: 14px;
  color: var(--s-text-secondary);
}

.access-lock {
  color: var(--s-text-tertiary);
  font-size: 18px;
}

.setting-icon.login {
  background: var(--s-primary);
}

.user-card {
  background: var(--s-surface);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--s-shadow-light);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  margin-right: 16px;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: var(--s-text-primary);
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
  box-shadow: 0 2px 8px var(--s-shadow-light);
}

.access-item:hover {
  background: var(--s-surface-elevated);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--s-shadow);
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
.access-icon.downloads { background: linear-gradient(135deg, #a8edea, #fed6e3); }

.access-info {
  flex: 1;
}

.access-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--s-text-primary);
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
  padding: 0 2px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--s-text-primary);
  letter-spacing: -0.3px;
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

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.playlist-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px;
  border-radius: 16px;
  background: var(--s-surface);
  box-shadow: 0 2px 8px var(--s-shadow-light);
  position: relative;
}

.playlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--s-shadow);
  background: var(--s-surface-elevated);
}

.playlist-cover {
  aspect-ratio: 1;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: var(--s-border);
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
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

.playlist-card:hover .play-button {
  opacity: 1;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--s-text-primary);
}

.playlist-count {
  font-size: 12px;
  margin: 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--s-surface);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px var(--s-shadow-light);
}

.setting-item:hover {
  background: var(--s-surface-elevated);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--s-shadow);
}

.setting-item.logout-item {
  border: 1px solid var(--ion-color-danger);
}

.setting-item.logout-item:hover {
  background: var(--ion-color-danger-tint);
}

.setting-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--s-primary);
  color: white;
  font-size: 18px;
  margin-right: 16px;
}

.setting-icon.logout {
  background: var(--ion-color-danger);
}

.setting-info {
  flex: 1;
}

.setting-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--s-text-primary);
}

.setting-info p {
  margin: 0;
  font-size: 14px;
}

.setting-arrow {
  color: var(--s-text-secondary);
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
  .user-badges {
    flex-wrap: wrap;
  }

  .playlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>
