<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>测试页面</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div style="padding: 20px;">
        <h1>发现页面功能测试</h1>
        
        <div style="margin: 20px 0;">
          <h2>导航测试</h2>
          <ion-button @click="testNavigation('/discover/playlist-square')" expand="block" fill="outline">
            歌单广场
          </ion-button>
          <ion-button @click="testNavigation('/discover/rankings')" expand="block" fill="outline">
            排行榜
          </ion-button>
          <ion-button @click="testNavigation('/discover/artists')" expand="block" fill="outline">
            歌手分类
          </ion-button>
          <ion-button @click="testNavigation('/discover/new-music')" expand="block" fill="outline">
            最新音乐
          </ion-button>
        </div>
        
        <div style="margin: 20px 0;">
          <h2>API测试</h2>
          <ion-button @click="testAPI" expand="block" color="primary">
            测试API调用
          </ion-button>
          <div v-if="apiResult" style="margin-top: 10px; padding: 10px; background: #f0f0f0; border-radius: 8px;">
            <pre>{{ apiResult }}</pre>
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <h2>Store测试</h2>
          <ion-button @click="testStore" expand="block" color="secondary">
            测试Store状态
          </ion-button>
          <div v-if="storeResult" style="margin-top: 10px; padding: 10px; background: #f0f0f0; border-radius: 8px;">
            <pre>{{ storeResult }}</pre>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton
} from '@ionic/vue'
import { useDiscoverStore } from '@/stores/discover'
import { recommendApi } from '@/api/discover'

const router = useRouter()
const discoverStore = useDiscoverStore()
const apiResult = ref('')
const storeResult = ref('')

const testNavigation = (path: string) => {
  try {
    router.push(path)
  } catch (error) {
    console.error('导航错误:', error)
    alert(`导航到 ${path} 失败: ${error}`)
  }
}

const testAPI = async () => {
  try {
    apiResult.value = '正在测试API...'
    const result = await recommendApi.getRecommendPlaylists(5)
    apiResult.value = JSON.stringify(result, null, 2)
  } catch (error) {
    apiResult.value = `API错误: ${error}`
    console.error('API测试失败:', error)
  }
}

const testStore = async () => {
  try {
    storeResult.value = '正在测试Store...'
    await discoverStore.loadDiscoverData()
    storeResult.value = JSON.stringify({
      hotPlaylists: discoverStore.hotPlaylists.length,
      recommendedArtists: discoverStore.recommendedArtists.length,
      topRankings: discoverStore.topRankings.length,
      loading: discoverStore.loading,
      error: discoverStore.error
    }, null, 2)
  } catch (error) {
    storeResult.value = `Store错误: ${error}`
    console.error('Store测试失败:', error)
  }
}
</script>
</template>
