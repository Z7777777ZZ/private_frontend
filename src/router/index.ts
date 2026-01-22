import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/tasks/new'
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
