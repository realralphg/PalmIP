import { createAlova, invalidateCache, useRequest } from 'alova';

import GlobalFetch from 'alova/GlobalFetch';
import VueHook from 'alova/vue';
import { axiosRequestAdapter } from "@alova/adapter-axios";
import { boot } from 'quasar/wrappers'
import helpers from 'src/plugins/helpers';
import { readEnv } from 'src/plugins/processor';
import { useAuthStore } from 'src/stores/auth-store';
import { useUserStore } from 'src/stores/user-store';

/**
 *
 * @param {Response|import('axios').AxiosResponse} response
 * @param {Method<any, any, any, any, import('alova/GlobalFetch').FetchRequestInit, Response, Headers>} method
 */
const responded = async (response, method, useAxios = false) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  let json
  if (useAxios === true) {
    json = await response.data
  } else {
    json = await response.json();
  }

  return new Promise((resolve, reject) => {
    if (typeof json.response !== 'undefined' && !json.data) {
      json.data = json.response;
      if (Array.isArray(json.data) && json.data.length === 0) {
        json.data = {};
      }
      delete json.response;
    }

    if (response.status === 401) {
      userStore.clearUser().then(() => {
        authStore.clearAuth().then(() => {
          authStore.redirectTo({ name: "login" });
        });
      });
      reject(json);
    } else if (response.status >= 400) {
      const message = json.message || response.statusText || 'Unknown error';
      if (![422, 401, 403].includes(response.status)) {
        helpers.notify({ message, status: json.status || 'error' });
      }
      reject(json);
    } else {
      if (json.token || json.data?.token) {
        authStore.token = json.token || json.data.token;
        method.config.headers.Authorization = 'Bearer ' + json.token || json.data.token;
      }
      resolve(json);
    }
  });
}
// 1. Create an alova instance
const alova = createAlova({
  statesHook: VueHook,
  baseURL: readEnv('baseURL'),
  requestAdapter: GlobalFetch(),
  responded: response => response.json(),
  beforeRequest (method) {
    const authStore = useAuthStore();
    // Set header
    method.config.headers = {
      ...method.config.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Access-Control-Allow-Credentials': 'true'
    };

    if (!method.meta?.noContentType) {
      method.config.headers['Content-Type'] = 'application/json; charset=utf-8'
    }

    // Check valid token and Set header
    if (authStore.token && !method.meta?.noAuth) {
      method.config.headers.Authorization = 'Bearer ' + authStore.token
    }
  },
});

// 2. Create an alova instance for axios
const axios = createAlova({
  statesHook: VueHook,
  baseURL: readEnv('baseURL'),
  requestAdapter: axiosRequestAdapter(),
  responded: response => response.json(),
  beforeRequest (method) {
    const authStore = useAuthStore();
    // Set header
    method.config.headers = {
      ...method.config.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Access-Control-Allow-Credentials': 'true'
    };

    if (!method.meta?.noContentType) {
      method.config.headers['Content-Type'] = 'application/json; charset=utf-8'
    }

    // Check valid token and Set header
    if (authStore.token && !method.meta?.noAuth) {
      method.config.headers.Authorization = 'Bearer ' + authStore.token
    }
  },
  responded: {
    onSuccess (response, method) {
      return responded(response, method, true);
    },
    /**
     *
     * @param {AxiosError} err
     * @param {Method<any, any, any, any, import('alova/GlobalFetch').FetchRequestInit, Response, Headers>} method
     * @returns
     */
    onError (err, method) {
      const authStore = useAuthStore();
      const userStore = useUserStore();
      const response = err.response

      if (response.status === 401) {
        userStore.clearUser().then(() => {
          authStore.clearAuth().then(() => {
            authStore.redirectTo({ name: "login" });
          });
        });
      } else if (response.status >= 400) {
        const message = response.data.message || response.statusText || 'Unknown error';
        if (![422, 401, 403].includes(response.status)) {
          helpers.notify({ message, status: response.data.status || 'error' });
        }
      }

      return new Promise(async (resolve, reject) => {
        reject(response.data)
      });
    }
  }
});

export default boot(async ({ app, router }) => {
  app.config.globalProperties.$alova = alova

  router.beforeResolve(async (to, from) => {
    const authStore = useAuthStore();
    if (authStore.redirect && to.name !== authStore.redirect.name && authStore.redirect !== authStore.redirect) {
      router.push(authStore.redirect);
      authStore.redirect = null;
    }
  });
})

export { alova, axios, useRequest, invalidateCache }
