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
          <IonTabButton tab="home" href="/tabs/home" class="tab-button">
            <IonIcon :icon="homeOutline" class="tab-icon" />
            <IonLabel class="tab-label">首页</IonLabel>
          </IonTabButton>

          <IonTabButton tab="discover" href="/tabs/discover" class="tab-button">
            <IonIcon :icon="compassOutline" class="tab-icon" />
            <IonLabel class="tab-label">发现</IonLabel>
          </IonTabButton>

          <IonTabButton tab="radio" href="/tabs/radio" class="tab-button">
            <IonIcon :icon="radioOutline" class="tab-icon" />
            <IonLabel class="tab-label">电台</IonLabel>
          </IonTabButton>

          <IonTabButton tab="collection" href="/tabs/collection" class="tab-button">
            <IonIcon :icon="starOutline" class="tab-icon" />
            <IonLabel class="tab-label">收藏</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/tabs/profile" class="tab-button">
            <IonIcon :icon="personOutline" class="tab-icon" />
            <IonLabel class="tab-label">我的</IonLabel>
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
  home,
  homeOutline,
  compass,
  compassOutline,
  radio,
  radioOutline,
  star,
  starOutline,
  person,
  personOutline
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
  padding-bottom: calc(140px + var(--ion-safe-area-bottom));
}

.tab-bar {
  --background: var(--s-surface);
  --border: 1px solid var(--s-border-light);
  --color-selected: var(--s-primary);
  height: calc(70px + var(--ion-safe-area-bottom));
  padding-bottom: var(--ion-safe-area-bottom);
  backdrop-filter: blur(20px);
  box-shadow: 0 -2px 20px var(--s-shadow-light);
  border-top: 1px solid var(--s-border-light);
}

.tab-button {
  --color: var(--s-text-tertiary);
  --color-selected: var(--s-primary);
  --padding-top: 10px;
  --padding-bottom: 10px;
  min-height: 60px;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button:hover {
  --color: var(--s-text-secondary);
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 3px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button.tab-selected .tab-icon {
  transform: scale(1.1);
  color: var(--s-primary);
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-top: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  flex-shrink: 0;
  max-width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button.tab-selected .tab-label {
  color: var(--s-primary);
  font-weight: 600;
}

/* 确保文字不被截断的额外样式 */
ion-tab-button {
  overflow: visible !important;
}

ion-label {
  overflow: visible !important;
  white-space: nowrap !important;
  text-overflow: unset !important;
}

/* 调整小屏幕显示 */
@media (max-width: 375px) {
  .tab-label {
    font-size: 11px;
  }

  .tab-icon {
    font-size: 20px;
  }
}
</style>
