
export default [
  {
    path: '/',
    meta: { prefix: 'auth', requireAuth: false, requireGuest: true, },
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('pages/Auth/LoginPage.vue')
      },
      {
        name: 'register',
        path: 'register',
        component: () => import('pages/Auth/RegisterPage.vue')
      },
      {
        name: 'logout',
        path: 'logout',
        meta: { requireAuth: true, requireGuest: false },
        component: () => import('pages/Auth/LoginPage.vue')
      },
    ]
  },
]
