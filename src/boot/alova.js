import { createAlova, invalidateCache } from 'alova';
import { notify, readEnv } from 'src/plugins/helpers';

import { Cookies } from 'quasar';
import VueHook from 'alova/vue';
import { axiosRequestAdapter } from '@alova/adapter-axios';
import { createClientTokenAuthentication } from 'alova/client';
import { defineBoot } from '#q-app/wrappers';
import fetchAdapter from 'alova/fetch';
// import { useAppStore } from 'src/stores/app-store';
import { useAuthStore } from 'src/stores/auth-store';
import { useRequest } from 'alova/client';
import { useUserStore } from 'src/stores/user-store';

function isAxios (useAxios = false) {
  return useAxios === true;
}

const clearAuth = async () => {
  const boot = useAuthStore();

  await boot.clearAuth();

  boot.redirectTo({ name: 'auth.login' });
};

const { onAuthRequired, onResponseRefreshToken } =
  createClientTokenAuthentication({
    refreshToken: {
      isExpired: () => {
        return false;
      },
      handler: clearAuth,
    },
    assignToken: (method) => {
      const boot = useAuthStore();
      method.config.headers.Authorization = 'Bearer ' + boot.token;
    },
    login (response, method) {
      method.promise?.then((data) => {
        const boot = useUserStore();
        const auth = useAuthStore();
        auth.setToken(data.token);
        boot.setUser(data.data);
      });
    },
    async logout () {
      await useAuthStore().clearAuth();
    },
  });

const {
  onAuthRequired: onAuthRequiredAxios,
  onResponseRefreshToken: onResponseRefreshTokenAxios,
} = createClientTokenAuthentication(
  {
    refreshToken: {
      isExpired: () => {
        return false;
      },
      handler: clearAuth,
    },
    assignToken: (method) => {
      const boot = useAuthStore();
      method.config.headers.Authorization = 'Bearer ' + boot.token;
    },
  },
);

/**
 * @param {import("axios").AxiosResponse} response
 * @param {import("alova").Method} method
 */
const responded = async (
  response,
  method,
  useAxios = false,
) => {
  const json = (isAxios(useAxios, response)
    ? await response.data
    : await response.clone().json());

  return new Promise((resolve, abort) => {
    if (response.status >= 400) {
      const message = (json.message ||
        response.statusText ||
        'Unknown error');
      if (response.status === 401) {
        clearAuth();
      } else if (response.status === 403) {
        // useAppStore().setError({ code: 403, message });
      } else if (!json.silent) {
        notify(message, json.status || 'error');
      }

      if (json.errors) {
        json.errors = Object.assign(
          {},
          ...Object.keys(json.errors).map((e) => {
            return {
              [e]: Array.isArray(json?.errors?.[e])
                ? json.errors[e][0]
                : json.errors?.[e],
            };
          }),
        );
      }
      abort(json);
    } else {
      resolve(json);
    }
  });
};

const beforeRequest = (
  method,
  withCredentials,
  cookies,
) => {
  // Set headers
  method.config.headers['Access-Control-Allow-Credentials'] = 'true';
  method.config.headers['X-Requested-With'] = 'XMLHttpRequest';
  method.config.headers['Accept'] = 'application/json';

  if (withCredentials) {
    method.config.headers.withCredentials = 'true';
  }

  if (cookies && cookies.get('token')) {
    method.config.headers.Authorization = 'Bearer ' + cookies.get('token');
  }

  const noContentType =
    !method.meta?.noContentType &&
    method.config.headers['Content-Type'] !== 'multipart/form-data';
  if (noContentType) {
    method.config.headers['Content-Type'] = 'application/json; charset=utf-8';
  }
};

// 1. Create an alova instance
const alova = createAlova({
  baseURL: readEnv('baseURL'),
  responded: onResponseRefreshToken(responded),
  statesHook: VueHook,
  requestAdapter: fetchAdapter(),
  // Enable cache logger in the development environment
  cacheLogger: process.env.NODE_ENV === 'development',
});

// 2. Create an alova instance for axios
const axios = createAlova({
  baseURL: readEnv('baseURL'),
  statesHook: VueHook,
  requestAdapter: axiosRequestAdapter(),
  responded: onResponseRefreshTokenAxios({
    onSuccess (response, method) {
      return responded(response, method, true);
    },
    /**
     *
     */
    onError (err) {
      const response = err.response;
      if (!response) {
        return;
      }

      if (response.status >= 400) {
        const message =
          response.data.message || response.status_text || 'Unknown error';
        if (response.status === 401) {
          clearAuth();
        } else if (response.status === 403) {
          // useAppStore().setError({ code: 403, message });
        } else if (!response.data.silent) {
          notify(message, response.data.status || 'error');
        }
      }
      if (response.data?.errors) {
        response.data.errors = Object.assign(
          {},
          ...Object.keys(response.data.errors).map((e) => {
            return {
              [e]: Array.isArray(response.data.errors?.[e])
                ? response.data.errors[e][0]
                : response.data.errors?.[e],
            };
          }),
        );
      }

      return new Promise((resolve, reject) => {
        reject(response.data);
      });
    },
  }),
  // Enable cache logger in the development environment
  cacheLogger: process.env.NODE_ENV === 'development',
});

export default defineBoot(async ({ app, router }) => {
  app.config.globalProperties.$alova = alova

  alova.options.beforeRequest = onAuthRequired((method) => {
    return beforeRequest(method, false, Cookies);
  });

  axios.options.beforeRequest = onAuthRequiredAxios((method) => {
    return beforeRequest(method, true, Cookies);
  });

  router.beforeResolve(async (to) => {
    const authStore = useAuthStore();
    if (authStore.redirect && to.name !== authStore.redirect.name) {
      router.push(authStore.redirect);
      authStore.redirect = null;
    }
  });
})

export { alova, axios, useRequest, invalidateCache }
