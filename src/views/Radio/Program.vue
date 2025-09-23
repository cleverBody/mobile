<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton />
        </IonButtons>
        <IonTitle>节目详情</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="program-page">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <IonSpinner></IonSpinner>
          <p>加载中...</p>
        </div>

        <!-- 节目信息 -->
        <div v-else-if="currentProgram" class="program-content">
          <div class="program-header">
            <div class="program-cover">
              <img
                :src="currentProgram.picUrl"
                :alt="currentProgram.name"
                @error="handleImageError"
              />
              <div class="play-button" @click="playProgram">
                <IonIcon :icon="play" />
              </div>
            </div>
            
            <div class="program-info">
              <h1 class="program-name">{{ currentProgram.name }}</h1>
              <p class="program-desc">{{ currentProgram.description }}</p>
              
              <div class="program-meta">
                <span class="program-duration">{{ formatDuration(currentProgram.duration) }}</span>
                <span class="program-date">{{ formatDate(currentProgram.createTime) }}</span>
                <span v-if="currentProgram.playCount" class="program-plays">
                  {{ formatCount(currentProgram.playCount) }}次播放
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
          <IonIcon :icon="albumsOutline" />
          <p>节目不存在</p>
        </div>
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
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import {
  play,
  albumsOutline
} from 'ionicons/icons'
import { useRoute } from 'vue-router'
import { useRadioStore } from '@/stores/radio'
import { useMusicStore } from '@/stores/music'

const route = useRoute()
const radioStore = useRadioStore()
const musicStore = useMusicStore()

// 计算属性
const programId = computed(() => Number(route.params.id))
const { currentProgram, loading } = radioStore

// 方法
const playProgram = async () => {
  if (!currentProgram.value) return
  
  // 转换为音乐格式播放
  const song = {
    id: currentProgram.value.id,
    name: currentProgram.value.name,
    artists: [{ id: 0, name: '电台节目' }],
    album: { id: 0, name: '播客电台' },
    cover: currentProgram.value.picUrl,
    duration: currentProgram.value.duration,
    url: currentProgram.value.url
  }
  
  await musicStore.setCurrentSong(song)
  await musicStore.setPlaylist([song], 0)
}

const formatCount = (count?: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const formatDuration = (duration?: number) => {
  if (!duration) return '00:00'
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/album.jpg'
}

// 生命周期
onMounted(() => {
  radioStore.loadProgramDetail(programId.value)
})
</script>

<style scoped>
.program-page {
  padding: 20px;
  padding-bottom: 120px;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-container p,
.empty-container p {
  margin: 12px 0;
  color: var(--ion-color-step-600);
}

.empty-container ion-icon {
  font-size: 64px;
  color: var(--ion-color-step-400);
  margin-bottom: 16px;
}

.program-header {
  text-align: center;
}

.program-cover {
  position: relative;
  width: 240px;
  height: 240px;
  margin: 0 auto 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.program-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--ion-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.play-button:active {
  transform: translate(-50%, -50%) scale(0.95);
}

.program-name {
  font-size: 22px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: var(--ion-color-step-800);
  line-height: 1.3;
}

.program-desc {
  font-size: 14px;
  color: var(--ion-color-step-600);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.program-meta {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: var(--ion-color-step-500);
}

.program-duration {
  font-weight: 500;
  color: var(--ion-color-primary);
}

@media (max-width: 480px) {
  .program-cover {
    width: 200px;
    height: 200px;
  }
  
  .program-name {
    font-size: 20px;
  }
  
  .program-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>