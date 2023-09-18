
export default [
  {
    path: '/',
    meta: { prefix: 'auth', requireAuth: false, requireGuest: true, },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/IndexPage.vue') }
    ]
  },
]
