import {
  authPlugin,
  guestMiddleware,
  roleMiddleware,
} from '@toneflix/vue-auth';

import { authMiddleware } from 'src/data/middlewares';
import { defineBoot } from '@quasar/app-vite/wrappers';
import { readEnv } from 'src/plugins/helpers';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default defineBoot(async ({ app, router }) => {
  const authenticator = authPlugin({
    router,
    baseUrl: readEnv('baseURL'),
    storageKey: 'auth_token',
    storageOptions: {
      persist: true
    },
    endpoints: {
      login: '/login',
      register: '/register',
      forgot: '/forgot-password',
      reset: '/reset-password',
      logout: '/logout',
    },
    setAuthHeaders: ({ token }) => {
      return {
        Authorization: `Bearer ${token}`,
      };
    },
    transformResponse: (data) => ({
      user: data.data,
      token: data.token,
      message: data.message,
      timeout: Number(data.timeout),
    }),
    middlewares: [
      authMiddleware({ name: 'login' }),
      roleMiddleware(
        { name: 'user.account' },
        'admin',
        'role',
        'requiresAdmin',
      ),
      guestMiddleware({ name: 'user.dashboard' }),
    ],
  });

  app.use(authenticator);
});
