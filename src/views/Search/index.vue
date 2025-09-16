<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton @click="goBack">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonSearchbar
          v-model="searchQuery"
          placeholder="搜索歌曲、歌手、专辑"
          :debounce="300"
          @ionInput="handleSearch"
          @ionClear="clearSearch"
          show-clear-button="focus"
        />
      </IonToolbar>
    </IonHeader>
    
    <IonContent :fullscreen="true">
      <div class="search-page">
        <!-- 搜索建议 -->
        <div v-if="!searchQuery && searchSuggestions.length > 0" class="search-suggestions">
          <h3 class="suggestions-title">热门搜索</h3>
          <div class="suggestions-grid">
            <IonChip 
              v-for="suggestion in searchSuggestions" 
              :key="suggestion"
              @click="searchKeyword(suggestion)"
              outline
            >
              <IonLabel>{{ suggestion }}</IonLabel>
            </IonChip>
          </div>
        </div>
        
        <!-- 搜索历史 -->
        <div v-if="!searchQuery && searchHistory.length > 0" class="search-history">
          <div class="history-header">
            <h3 class="history-title">搜索历史</h3>
            <IonButton fill="clear" size="small" @click="clearHistory">
              <IonIcon :icon="trashOutline" />
              清空
            </IonButton>
          </div>
          <div class="history-list">
            <div 
              v-for="(item, index) in searchHistory" 
              :key="index"
              class="history-item"
              @click="searchKeyword(item)"
            >
              <IonIcon :icon="timeOutline" />
              <span>{{ item }}</span>
              <IonButton 
                fill="clear" 
                size="small" 
                @click.stop="removeHistoryItem(index)"
              >
                <IonIcon :icon="closeOutline" />
              </IonButton>
            </div>
          </div>
        </div>
        
        <!-- 搜索结果 -->
        <div v-if="searchQuery" class="search-results">
          <!-- 搜索状态 -->
          <div v-if="searching" class="search-loading">
            <IonSpinner name="circular" />
            <p>搜索中...</p>
          </div>
          
          <!-- 无结果 -->
          <div v-else-if="!hasResults" class="no-results">
            <IonIcon :icon="searchOutline" class="no-results-icon" />
            <h3>未找到相关结果</h3>
            <p>尝试更换关键词或检查拼写</p>
          </div>
          
          <!-- 结果标签页 -->
          <div v-else class="results-content">
            <IonSegment v-model="activeTab" @ionChange="handleTabChange">
              <IonSegmentButton value="songs">
                <IonLabel>歌曲 ({{ searchResults.songs.length }})</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="artists">
                <IonLabel>歌手 ({{ searchResults.artists.length }})</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="albums">
                <IonLabel>专辑 ({{ searchResults.albums.length }})</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="playlists">
                <IonLabel>歌单 ({{ searchResults.playlists.length }})</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            
            <!-- 歌曲结果 -->
            <div v-if="activeTab === 'songs'" class="results-section">
              <div class="songs-list">
                <div 
                  v-for="(song, index) in searchResults.songs" 
                  :key="song.id"
                  class="song-item"
                  @click="playSong(song, index)"
                >
                  <div class="song-cover">
                    <img 
                      :src="song.cover" 
                      :alt="song.name"
                      @error="handleImageError"
                    />
                    <div class="play-overlay">
                      <IonIcon :icon="play" />
                    </div>
                  </div>
                  <div class="song-info">
                    <h3 class="song-name s-text-truncate">{{ song.name }}</h3>
                    <p class="song-artist s-text-secondary s-text-truncate">
                      {{ song.artists?.map(a => a.name).join(', ') }}
                    </p>
                  </div>
                  <div class="song-actions">
                    <IonButton 
                      fill="clear" 
                      size="small"
                      @click.stop="toggleLike(song.id)"
                      :color="musicStore.isLiked(song.id) ? 'primary' : 'medium'"
                    >
                      <IonIcon :icon="musicStore.isLiked(song.id) ? heart : heartOutline" />
                    </IonButton>
                    <IonButton fill="clear" size="small" @click.stop="moreSongActions(song)">
                      <IonIcon :icon="ellipsisVerticalOutline" />
                    </IonButton>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 歌手结果 -->
            <div v-if="activeTab === 'artists'" class="results-section">
              <div class="artists-grid">
                <div 
                  v-for="artist in searchResults.artists" 
                  :key="artist.id"
                  class="artist-card"
                  @click="goToArtist(artist.id)"
                >
                  <div class="artist-avatar">
                    <img 
                      :src="artist.cover" 
                      :alt="artist.name"
                      @error="handleImageError"
                    />
                  </div>
                  <h3 class="artist-name s-text-truncate">{{ artist.name }}</h3>
                  <p class="artist-followers s-text-secondary">{{ formatFollowers(artist.followers) }}关注</p>
                </div>
              </div>
            </div>
            
            <!-- 专辑结果 -->
            <div v-if="activeTab === 'albums'" class="results-section">
              <div class="albums-grid">
                <div 
                  v-for="album in searchResults.albums" 
                  :key="album.id"
                  class="album-card"
                  @click="goToAlbum(album.id)"
                >
                  <div class="album-cover">
                    <img 
                      :src="album.cover" 
                      :alt="album.name"
                      @error="handleImageError"
                    />
                  </div>
                  <h3 class="album-name s-text-truncate">{{ album.name }}</h3>
                  <p class="album-artist s-text-secondary s-text-truncate">{{ album.artist }}</p>
                </div>
              </div>
            </div>
            
            <!-- 歌单结果 -->
            <div v-if="activeTab === 'playlists'" class="results-section">
              <div class="playlists-list">
                <div 
                  v-for="playlist in searchResults.playlists" 
                  :key="playlist.id"
                  class="playlist-item"
                  @click="goToPlaylist(playlist.id)"
                >
                  <div class="playlist-cover">
                    <img 
                      :src="playlist.cover" 
                      :alt="playlist.name"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="playlist-info">
                    <h3 class="playlist-name s-text-truncate">{{ playlist.name }}</h3>
                    <p class="playlist-desc s-text-secondary s-text-truncate">{{ playlist.description }}</p>
                    <p class="playlist-count s-text-secondary">{{ playlist.trackCount }}首歌曲</p>
                  </div>
                  <IonButton fill="clear" size="small">
                    <IonIcon :icon="chevronForwardOutline" />
                  </IonButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonContent,
  IonChip,
  IonLabel,
  IonSpinner,
  IonSegment,
  IonSegmentButton
} from '@ionic/vue'
import {
  arrowBackOutline,
  trashOutline,
  timeOutline,
  closeOutline,
  searchOutline,
  play,
  heart,
  heartOutline,
  ellipsisVerticalOutline,
  chevronForwardOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import { useMusicStore } from '@/stores/music'

const router = useRouter()
const searchStore = useSearchStore()
const musicStore = useMusicStore()

// 响应式状态
const searchQuery = ref('')
const activeTab = ref('songs')
const searching = ref(false)

// 计算属性
const searchSuggestions = computed(() => searchStore.suggestions)
const searchHistory = computed(() => searchStore.history)
const searchResults = computed(() => searchStore.results)
const hasResults = computed(() => {
  const results = searchResults.value
  return results.songs.length > 0 || 
         results.artists.length > 0 || 
         results.albums.length > 0 || 
         results.playlists.length > 0
})

// 方法
const goBack = () => {
  router.back()
}

const handleSearch = async (event: CustomEvent) => {
  const query = event.detail.value.trim()
  if (!query) {
    searchStore.clearResults()
    return
  }
  
  searching.value = true
  try {
    await searchStore.search(query)
    searchStore.addToHistory(query)
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchStore.clearResults()
}

const searchKeyword = (keyword: string) => {
  searchQuery.value = keyword
  handleSearch({ detail: { value: keyword } } as CustomEvent)
}

const clearHistory = () => {
  searchStore.clearHistory()
}

const removeHistoryItem = (index: number) => {
  searchStore.removeHistoryItem(index)
}

const handleTabChange = (event: CustomEvent) => {
  activeTab.value = event.detail.value
}

const playSong = (song: any, index: number) => {
  // 设置搜索结果为播放列表
  const songs = searchResults.value.songs
  musicStore.setPlaylist(songs, index)
}

const toggleLike = (songId: number) => {
  musicStore.toggleLike(songId)
}

const moreSongActions = (song: any) => {
  // TODO: 更多歌曲操作
  console.log('更多操作', song)
}

const goToArtist = (id: number) => {
  router.push(`/artist/${id}`)
}

const goToAlbum = (id: number) => {
  router.push(`/album/${id}`)
}

const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`)
}

const formatFollowers = (count?: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // 图片加载失败时显示默认图片
  if (!target.src.includes('default-cover')) {
    target.src = 'https://p4.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
  }
}

// 生命周期
onMounted(() => {
  searchStore.loadSuggestions()
})
</script>

<style scoped>
.search-page {
  padding: 16px;
  padding-bottom: 120px;
}

.search-suggestions,
.search-history {
  margin-bottom: 24px;
}

.suggestions-title,
.history-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: var(--s-text-primary);
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--s-surface);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.history-item:hover {
  background: var(--s-border);
}

.history-item ion-icon:first-child {
  margin-right: 12px;
  color: var(--s-text-secondary);
}

.history-item span {
  flex: 1;
  font-size: 14px;
}

.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.search-loading p {
  margin-top: 16px;
  color: var(--s-text-secondary);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.no-results-icon {
  font-size: 64px;
  color: var(--s-text-secondary);
  margin-bottom: 16px;
}

.no-results h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.no-results p {
  margin: 0;
  color: var(--s-text-secondary);
}

.results-content {
  margin-top: 16px;
}

.results-content ion-segment {
  margin-bottom: 20px;
}

.results-section {
  min-height: 200px;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--s-surface);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.song-item:hover {
  background: var(--s-border);
}

.song-cover {
  position: relative;
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

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.song-item:hover .play-overlay {
  opacity: 1;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.song-artist {
  font-size: 12px;
  margin: 0;
}

.song-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.artists-grid,
.albums-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.artist-card,
.album-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.artist-card:active,
.album-card:active {
  transform: scale(0.95);
}

.artist-avatar,
.album-cover {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.artist-avatar {
  border-radius: 50%;
}

.artist-avatar img,
.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-name,
.album-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.artist-followers,
.album-artist {
  font-size: 12px;
  margin: 0;
}

.playlists-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--s-surface);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.playlist-item:hover {
  background: var(--s-border);
}

.playlist-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.playlist-desc,
.playlist-count {
  font-size: 12px;
  margin: 0 0 2px 0;
}

@media (max-width: 480px) {
  .artists-grid,
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>