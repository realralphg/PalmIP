import { useAuthStore } from 'src/stores/auth-store';

export default [
  {
    path: '/',
    meta: { prefix: 'auth', requiresAuth: false, requiresGuest: true, },
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
        meta: { requiresAuth: true, requiresGuest: false },
        component: () => import('pages/Auth/LoginPage.vue')
      },
      {
        path: 'logout',
        name: 'logout',
        meta: { requiresAuth: true, requiresGuest: false },
        beforeEnter: async () => {
          const as = useAuthStore();
          await as.logOut();
          return { name: 'login' };
        },
        component: () => import('src/pages/Auth/LoginPage.vue'),
      },
    ]
  },
]
