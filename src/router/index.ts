import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import TabsLayout from '@/layouts/TabsLayout.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/tabs/',
    component: TabsLayout,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home/index.vue')
      },
      {
        path: 'discover',
        name: 'Discover',
        component: () => import('@/views/Discover/index.vue')
      },
      {
        path: 'radio',
        name: 'Radio',
        component: () => import('@/views/Radio/index.vue')
      },
      {
        path: 'collection',
        name: 'Collection',
        component: () => import('@/views/Collection/index.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile/index.vue')
      }
    ]
  },
  {
    path: '/player',
    name: 'Player',
    component: () => import('@/views/Player/index.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search/index.vue')
  },
  {
    path: '/playlist/:id',
    name: 'Playlist',
    component: () => import('@/views/Playlist/index.vue')
  },
  {
    path: '/album/:id',
    name: 'Album',
    component: () => import('@/views/Album/index.vue')
  },
  {
    path: '/artist/:id',
    name: 'Artist',
    component: () => import('@/views/Artist/index.vue')
  },
  {
    path: '/daily-recommend',
    name: 'DailyRecommend',
    component: () => import('@/views/DailyRecommend/index.vue')
  },
  {
    path: '/discover/playlist-square',
    name: 'PlaylistSquare',
    component: () => import('@/views/Discover/PlaylistSquare.vue')
  },
  {
    path: '/discover/rankings',
    name: 'Rankings',
    component: () => import('@/views/Discover/Rankings.vue')
  },
  {
    path: '/discover/artists',
    name: 'DiscoverArtists',
    component: () => import('@/views/Discover/Artists.vue')
  },
  {
    path: '/discover/new-music',
    name: 'NewMusic',
    component: () => import('@/views/Discover/NewMusic.vue')
  },
  {
    path: '/radio/category/:id',
    name: 'RadioCategory',
    component: () => import('@/views/Radio/Category.vue')
  },
  {
    path: '/radio/station/:id',
    name: 'RadioStation',
    component: () => import('@/views/Radio/Station.vue')
  },
  {
    path: '/radio/program/:id',
    name: 'RadioProgram',
    component: () => import('@/views/Radio/Program.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings/index.vue')
  },
  {
    path: '/local-music',
    name: 'LocalMusic',
    component: () => import('@/views/LocalMusic/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL as string),
  routes
})

export default router
