import admin from './admin'
import auth from './auth'
import user from './user'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/', name: 'home',
        meta: { prefix: 'user', requireAuth: true, },
        component: () => import('pages/User/DashboardPage.vue')
      },
      {
        path: 'market',
        name: 'market',
        meta: { prefix: 'user', requireAuth: true, },
        component: () => import('pages/MarketPage.vue')
      },
    ]
  },
  ...auth,
  ...user,
  ...admin,
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
