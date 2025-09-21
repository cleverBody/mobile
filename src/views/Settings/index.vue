<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>设置</IonTitle>
        <IonButtons slot="start">
          <IonBackButton default-href="/tabs/profile" />
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="settings-page">
        <!-- 播放设置 -->
        <div class="settings-section">
          <h2 class="section-title">播放设置</h2>

          <IonList>
            <IonItem>
              <IonIcon :icon="volumeHighOutline" slot="start" />
              <IonLabel>
                <h3>音量</h3>
                <p>当前音量: {{ Math.round(playerStore.volume * 100) }}%</p>
              </IonLabel>
              <IonRange
                slot="end"
                :value="playerStore.volume"
                :min="0"
                :max="1"
                :step="0.01"
                @ionInput="handleVolumeChange"
                style="width: 120px"
              />
            </IonItem>

            <IonItem>
              <IonIcon :icon="musicalNotesOutline" slot="start" />
              <IonLabel>
                <h3>音质选择</h3>
                <p>{{ getQualityLabel(settingsStore.audioQuality) }}</p>
              </IonLabel>
              <IonSelect
                slot="end"
                :value="settingsStore.audioQuality"
                @ionChange="handleQualityChange"
                interface="popover"
              >
                <IonSelectOption value="128">标准音质 (128kbps)</IonSelectOption>
                <IonSelectOption value="192">高品质 (192kbps)</IonSelectOption>
                <IonSelectOption value="320">超高品质 (320kbps)</IonSelectOption>
                <IonSelectOption value="lossless">无损音质</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonIcon :icon="shuffleOutline" slot="start" />
              <IonLabel>
                <h3>播放模式</h3>
                <p>{{ getPlayModeLabel(playerStore.playMode) }}</p>
              </IonLabel>
              <IonSelect
                slot="end"
                :value="playerStore.playMode"
                @ionChange="handlePlayModeChange"
                interface="popover"
              >
                <IonSelectOption value="order">顺序播放</IonSelectOption>
                <IonSelectOption value="random">随机播放</IonSelectOption>
                <IonSelectOption value="repeat">单曲循环</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonIcon :icon="timerOutline" slot="start" />
              <IonLabel>
                <h3>淡入淡出</h3>
                <p>播放切换时的音量渐变</p>
              </IonLabel>
              <IonToggle
                slot="end"
                :checked="fadeInOut"
                @ionChange="handleFadeToggle"
              />
            </IonItem>

            <IonItem>
              <IonIcon :icon="lockOpenOutline" slot="start" />
              <IonLabel>
                <h3>音乐解锁</h3>
                <p>在无法正常播放时进行替换，可能会与原曲不符</p>
              </IonLabel>
              <IonToggle
                slot="end"
                :checked="settingsStore.useSongUnlock"
                @ionChange="handleUnlockToggle"
              />
            </IonItem>
          </IonList>
        </div>

        <!-- 外观设置 -->
        <div class="settings-section">
          <h2 class="section-title">外观设置</h2>

          <IonList>
            <IonItem>
              <IonIcon :icon="colorPaletteOutline" slot="start" />
              <IonLabel>
                <h3>主题模式</h3>
                <p>{{ getThemeLabel(settingsStore.theme) }}</p>
              </IonLabel>
              <IonSelect
                slot="end"
                :value="settingsStore.theme"
                @ionChange="handleThemeChange"
                interface="action-sheet"
              >
                <IonSelectOption value="light">浅色模式</IonSelectOption>
                <IonSelectOption value="dark">深色模式</IonSelectOption>
                <IonSelectOption value="auto">跟随系统</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonIcon :icon="brushOutline" slot="start" />
              <IonLabel>
                <h3>封面主题色</h3>
                <p>根据专辑封面自动调整主题颜色</p>
              </IonLabel>
              <IonToggle
                slot="end"
                :checked="dynamicTheme"
                @ionChange="handleDynamicThemeToggle"
              />
            </IonItem>

            <IonItem>
              <IonIcon :icon="textOutline" slot="start" />
              <IonLabel>
                <h3>字体大小</h3>
                <p>{{ getFontSizeLabel(fontSize) }}</p>
              </IonLabel>
              <IonSelect
                slot="end"
                :value="fontSize"
                @ionChange="handleFontSizeChange"
                interface="popover"
              >
                <IonSelectOption value="small">小</IonSelectOption>
                <IonSelectOption value="medium">中</IonSelectOption>
                <IonSelectOption value="large">大</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
        </div>

        <!-- 数据设置 -->
        <div class="settings-section">
          <h2 class="section-title">数据设置</h2>

          <IonList>
            <IonItem>
              <IonIcon :icon="cloudDownloadOutline" slot="start" />
              <IonLabel>
                <h3>自动缓存</h3>
                <p>播放时自动缓存歌曲</p>
              </IonLabel>
              <IonToggle
                slot="end"
                :checked="autoCache"
                @ionChange="handleAutoCacheToggle"
              />
            </IonItem>

            <IonItem>
              <IonIcon :icon="folderOutline" slot="start" />
              <IonLabel>
                <h3>缓存大小</h3>
                <p>已使用 {{ cacheSize }}MB / 限制 {{ maxCacheSize }}MB</p>
              </IonLabel>
              <IonButton slot="end" fill="outline" size="small" @click="clearCache">
                清空缓存
              </IonButton>
            </IonItem>

            <IonItem>
              <IonIcon :icon="wifiOutline" slot="start" />
              <IonLabel>
                <h3>移动网络播放</h3>
                <p>使用移动数据时允许播放</p>
              </IonLabel>
              <IonToggle
                slot="end"
                :checked="mobilePlayback"
                @ionChange="handleMobilePlaybackToggle"
              />
            </IonItem>
          </IonList>
        </div>

        <!-- 通知设置 -->
        <div class="settings-section">
          <h2 class="section-title">通知设置</h2>

          <IonList>
            <IonItem>
              <IonIcon :icon="notificationsOutline" slot="start" />
              <IonLabel>
                <h3>推送通知</h3>
                <p>接收音乐推荐和活动通知</p>
              </IonLabel>
              <IonToggle
                slot="end"
                :checked="pushNotifications"
                @ionChange="handlePushNotificationsToggle"
              />
            </IonItem>

            <IonItem>
              <IonIcon :icon="lockClosedOutline" slot="start" />
              <IonLabel>
                <h3>锁屏控制</h3>
                <p>在锁屏界面显示播放控制</p>
              </IonLabel>
              <IonToggle
                slot="end"
                :checked="lockScreenControl"
                @ionChange="handleLockScreenControlToggle"
              />
            </IonItem>
          </IonList>
        </div>

        <!-- 其他设置 -->
        <div class="settings-section">
          <h2 class="section-title">其他</h2>

          <IonList>
            <IonItem button @click="checkUpdates">
              <IonIcon :icon="downloadOutline" slot="start" />
              <IonLabel>
                <h3>检查更新</h3>
                <p>当前版本: v{{ appVersion }}</p>
              </IonLabel>
              <IonIcon :icon="chevronForwardOutline" slot="end" />
            </IonItem>

            <IonItem button @click="showAbout">
              <IonIcon :icon="informationCircleOutline" slot="start" />
              <IonLabel>
                <h3>关于应用</h3>
                <p>应用信息和开源许可</p>
              </IonLabel>
              <IonIcon :icon="chevronForwardOutline" slot="end" />
            </IonItem>

            <IonItem button @click="showFeedback">
              <IonIcon :icon="chatbubbleOutline" slot="start" />
              <IonLabel>
                <h3>意见反馈</h3>
                <p>帮助我们改进应用</p>
              </IonLabel>
              <IonIcon :icon="chevronForwardOutline" slot="end" />
            </IonItem>

            <IonItem v-if="userStore.isLoggedIn" button @click="logout" class="logout-item">
              <IonIcon :icon="logOutOutline" slot="start" color="danger" />
              <IonLabel color="danger">
                <h3>退出登录</h3>
              </IonLabel>
            </IonItem>
          </IonList>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonRange,
  IonButtons,
  IonBackButton,
  alertController,
  toastController
} from '@ionic/vue'
import {
  volumeHighOutline,
  musicalNotesOutline,
  shuffleOutline,
  timerOutline,
  lockOpenOutline,
  colorPaletteOutline,
  brushOutline,
  textOutline,
  cloudDownloadOutline,
  folderOutline,
  wifiOutline,
  notificationsOutline,
  lockClosedOutline,
  downloadOutline,
  informationCircleOutline,
  chatbubbleOutline,
  logOutOutline,
  chevronForwardOutline
} from 'ionicons/icons'
import { useSettingsStore } from '@/stores/settings'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'

const settingsStore = useSettingsStore()
const playerStore = usePlayerStore()
const userStore = useUserStore()

// 本地设置状态
const fadeInOut = ref(true)
const dynamicTheme = ref(true)
const fontSize = ref('medium')
const autoCache = ref(true)
const cacheSize = ref(125)
const maxCacheSize = ref(500)
const mobilePlayback = ref(false)
const pushNotifications = ref(true)
const lockScreenControl = ref(true)
const appVersion = ref('1.0.0')

// 方法
const handleVolumeChange = (event: CustomEvent) => {
  playerStore.setVolume(event.detail.value)
}

const handleQualityChange = (event: CustomEvent) => {
  settingsStore.audioQuality = event.detail.value
}

const handlePlayModeChange = (event: CustomEvent) => {
  playerStore.playMode = event.detail.value
}

const handleThemeChange = (event: CustomEvent) => {
  settingsStore.setTheme(event.detail.value)
}

const handleFadeToggle = (event: CustomEvent) => {
  fadeInOut.value = event.detail.checked
}

const handleUnlockToggle = (event: CustomEvent) => {
  settingsStore.useSongUnlock = event.detail.checked
}

const handleDynamicThemeToggle = (event: CustomEvent) => {
  dynamicTheme.value = event.detail.checked
}

const handleFontSizeChange = (event: CustomEvent) => {
  fontSize.value = event.detail.value
}

const handleAutoCacheToggle = (event: CustomEvent) => {
  autoCache.value = event.detail.checked
}

const handleMobilePlaybackToggle = (event: CustomEvent) => {
  mobilePlayback.value = event.detail.checked
}

const handlePushNotificationsToggle = (event: CustomEvent) => {
  pushNotifications.value = event.detail.checked
}

const handleLockScreenControlToggle = (event: CustomEvent) => {
  lockScreenControl.value = event.detail.checked
}

const clearCache = async () => {
  const alert = await alertController.create({
    header: '清空缓存',
    message: '确定要清空所有缓存吗？这将删除已下载的音乐文件。',
    buttons: [
      {
        text: '取消',
        role: 'cancel'
      },
      {
        text: '确定',
        handler: async () => {
          // TODO: 清空缓存逻辑
          cacheSize.value = 0
          const toast = await toastController.create({
            message: '缓存已清空',
            duration: 2000,
            position: 'bottom'
          })
          await toast.present()
        }
      }
    ]
  })
  await alert.present()
}

const checkUpdates = async () => {
  const toast = await toastController.create({
    message: '当前已是最新版本',
    duration: 2000,
    position: 'bottom'
  })
  await toast.present()
}

const showAbout = () => {
  // TODO: 打开关于页面
  console.log('显示关于页面')
}

const showFeedback = () => {
  // TODO: 打开反馈页面
  console.log('显示反馈页面')
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

// 获取标签文本的辅助函数
const getQualityLabel = (quality: string) => {
  const labels = {
    '128': '标准音质',
    '192': '高品质',
    '320': '超高品质',
    'lossless': '无损音质'
  }
  return labels[quality as keyof typeof labels] || '标准音质'
}

const getPlayModeLabel = (mode: string) => {
  const labels = {
    'order': '顺序播放',
    'random': '随机播放',
    'repeat': '单曲循环'
  }
  return labels[mode as keyof typeof labels] || '顺序播放'
}

const getThemeLabel = (theme: string) => {
  const labels = {
    'light': '浅色模式',
    'dark': '深色模式',
    'auto': '跟随系统'
  }
  return labels[theme as keyof typeof labels] || '跟随系统'
}

const getFontSizeLabel = (size: string) => {
  const labels = {
    'small': '小',
    'medium': '中',
    'large': '大'
  }
  return labels[size as keyof typeof labels] || '中'
}
</script>

<style scoped>
.settings-page {
  padding-bottom: 120px;
}

.settings-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
  padding: 0 16px;
  color: var(--s-text-primary);
}

.logout-item {
  margin-top: 16px;
}

ion-list {
  background: transparent;
}

ion-item {
  --background: var(--s-surface);
  --border-color: var(--s-border);
  --color: var(--s-text-primary);
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--s-shadow-light);
  transition: all 0.2s ease;
}



ion-item ion-icon[slot="start"] {
  margin-right: 16px;
  color: var(--s-primary);
}

ion-item ion-icon[slot="end"] {
  color: var(--s-text-secondary);
}

ion-label h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--s-text-primary);
}

ion-label p {
  font-size: 14px;
  color: var(--s-text-secondary);
}

ion-range {
  --bar-background: var(--s-border);
  --bar-background-active: var(--s-primary);
  --knob-background: var(--s-primary);
  --knob-size: 20px;
}

ion-toggle {
  --background: var(--s-border);
  --background-checked: var(--s-primary);
  --handle-background: white;
  --handle-background-checked: white;
}

ion-select {
  --placeholder-color: var(--s-text-secondary);
  color: var(--s-text-primary);
}

ion-button {
  --color: var(--s-primary);
  --border-color: var(--s-primary);
  font-size: 12px;
  height: 32px;
}

/* 特殊样式 */
.logout-item ion-icon[slot="start"] {
  color: var(--ion-color-danger);
}

.logout-item ion-label h3 {
  color: var(--ion-color-danger);
}



/* 响应式设计 */
@media (max-width: 480px) {
  .settings-page {
    padding: 8px;
  }

  .section-title {
    padding: 0 8px;
    font-size: 16px;
  }

  ion-item {
    margin-bottom: 6px;
  }

  ion-range {
    width: 100px !important;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  ion-item {
    --background: var(--s-surface-dark);
    --border-color: var(--s-border-dark);
  }

  ion-toggle {
    --handle-background: var(--s-surface);
    --handle-background-checked: var(--s-surface);
  }
}

/* 设置项分组间距 */
.settings-section:not(:last-child) {
  border-bottom: 1px solid var(--s-border-light);
  padding-bottom: 16px;
}

/* 滑块样式优化 */
ion-range::part(bar) {
  border-radius: 4px;
  height: 4px;
}

ion-range::part(bar-active) {
  border-radius: 4px;
}

ion-range::part(knob) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 选择器样式 */
ion-select::part(icon) {
  color: var(--s-text-secondary);
}

/* 按钮样式 */
ion-button[fill="outline"] {
  --border-width: 1px;
  --border-style: solid;
}


</style>
