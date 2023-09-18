
export default [
  {
    path: '/user',
    meta: { prefix: 'user', requireAuth: true, requireGuest: false, },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'user.dashboard',
        component: () => import('pages/User/DashboardPage.vue')
      },
      {
        path: 'market',
        name: 'user.market',
        component: () => import('pages/User/MarketPage.vue')
      }
    ]
  },
]
