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
        path: 'library',
        name: 'Library',
        component: () => import('@/views/Library/index.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings/index.vue')
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
    path: '/artist',
    name: 'Artist',
    component: () => import('@/views/Artist/index.vue'),
    beforeEnter: (to, _, next) => {
      if (!to.query.id) next({ path: '/404' });
      else next();
    }
  },
  {
    path: '/daily-recommend',
    name: 'DailyRecommend',
    component: () => import('@/views/DailyRecommend/index.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL as string),
  routes
})

export default router
