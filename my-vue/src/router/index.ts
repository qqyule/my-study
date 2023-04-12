import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { config } from '@/config'
import type { Router } from '@/types'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/layout/index.vue')
  }
]

const router = createRouter({
  history: config.app.router.mode == 'history' ? createWebHistory() : createWebHashHistory(),
  routes
}) as Router

export { router }
