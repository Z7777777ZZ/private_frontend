import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: () => {
      const seen = localStorage.getItem('entry_seen')
      return seen ? '/tasks/new' : '/entry'
    }
  },
  {
    path: '/entry',
    name: 'EntryPortal',
    component: () => import('../views/EntryPortal.vue'),
    meta: { layout: 'fullscreen' }
  },
  {
    path: '/tasks/new',
    name: 'TaskNew',
    component: () => import('../views/TaskNew.vue')
  },
  {
    path: '/tasks/monitor/:taskId',
    name: 'TaskMonitor',
    component: () => import('../views/TaskMonitor.vue')
  },
  {
    path: '/tasks/history',
    name: 'TaskHistory',
    component: () => import('../views/TaskHistory.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
