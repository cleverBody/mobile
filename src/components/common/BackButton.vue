<template>
  <IonButton
    fill="clear"
    class="back-button-unified"
    :color="color"
    :size="size"
    @click="handleBack"
  >
    <IonIcon :icon="chevronBackOutline" />
  </IonButton>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue'
import { chevronBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'

defineProps<{
  color?: string
  size?: 'small' | 'default' | 'large'
}>()

const router = useRouter()

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.back-button-unified {
  --background: transparent;
  --border-radius: 50%;
  --color: var(--s-text-primary);
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  width: auto;
  height: auto;
  min-width: 44px;
  min-height: 44px;
  transition: all 0.2s ease;
}

/* Light color override for hero sections */
.back-button-unified.ion-color-light {
  --background: transparent;
  --color: white;
}

.back-button-unified:hover {
  transform: scale(1.1);
  --background: rgba(0, 0, 0, 0.1);
}

.back-button-unified.ion-color-light:hover {
  --background: rgba(255, 255, 255, 0.1);
}

.back-button-unified:active {
  transform: scale(0.95);
}

.back-button-unified ion-icon {
  font-size: 28px;
  font-weight: bold;
}

/* Dark mode adaptation */
@media (prefers-color-scheme: dark) {
  .back-button-unified {
    --color: var(--ion-color-light);
  }
  
  .back-button-unified.ion-color-light {
    --color: white;
  }
  
  .back-button-unified:hover {
    --background: rgba(255, 255, 255, 0.1);
  }
}
</style>