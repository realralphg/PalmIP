
export default [
  {
    path: '/user',
    meta: { prefix: 'user', requireAuth: true, requireGuest: false, },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'market',
        name: 'user.market',
        component: () => import('pages/User/MarketPage.vue')
      },
      {
        path: 'profile',
        name: 'user.profile',
        component: () => import('pages/User/ProfilePage.vue')
      },
      {
        path: '/profile/:user',
        name: 'profile',
        component: () => import('pages/UserProfilePage.vue')
      },
      {
        path: 'dashboard',
        name: 'user.dashboard',
        component: () => import('pages/User/DashboardPage.vue')
      },
      {
        path: 'events/calendar',
        name: 'events.calendar',
        component: () => import('pages/User/EventCalendarPage.vue')
      },
      {
        path: 'crop/price',
        name: 'crop.price',
        component: () => import('pages/User/CropPricePage.vue')
      }
    ]
  },
]
