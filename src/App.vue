<template>
  <IonApp>
    <IonRouterOutlet />
    <MiniPlayer />
  </IonApp>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import MiniPlayer from '@/components/Player/MiniPlayer.vue'

const settingsStore = useSettingsStore()

onMounted(() => {
  // 初始化主题
  settingsStore.initTheme()
})
</script>

<style>
/* 全局样式将在 assets/styles/main.css 中定义 */
</style>