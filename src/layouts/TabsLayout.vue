<template>
  <IonPage>
    <IonContent :fullscreen="true">
      <div class="tabs-layout">
        <!-- 主要内容区域 -->
        <div class="content-area">
          <IonRouterOutlet />
        </div>
        
        <!-- 底部导航栏 -->
        <IonTabBar slot="bottom" class="tab-bar">
          <IonTabButton tab="home" href="/tabs/home">
            <IonIcon :icon="homeOutline" />
            <IonLabel>首页</IonLabel>
          </IonTabButton>
          
          <IonTabButton tab="discover" href="/tabs/discover">
            <IonIcon :icon="searchOutline" />
            <IonLabel>发现</IonLabel>
          </IonTabButton>
          
          <IonTabButton tab="library" href="/tabs/library">
            <IonIcon :icon="libraryOutline" />
            <IonLabel>我的</IonLabel>
          </IonTabButton>
          
          <IonTabButton tab="settings" href="/tabs/settings">
            <IonIcon :icon="settingsOutline" />
            <IonLabel>设置</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet
} from '@ionic/vue'
import {
  homeOutline,
  searchOutline,
  libraryOutline,
  settingsOutline
} from 'ionicons/icons'
</script>

<style scoped>
.tabs-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  overflow: hidden;
  padding-bottom: calc(130px + var(--ion-safe-area-bottom));
}

.tab-bar {
  --background: var(--s-surface);
  --border: 1px solid var(--s-border);
  --color-selected: var(--s-primary);
  height: calc(50px + var(--ion-safe-area-bottom));
  padding-bottom: var(--ion-safe-area-bottom);
}

.tab-bar ion-tab-button {
  --color: var(--s-text-secondary);
  --color-selected: var(--s-primary);
}
</style>