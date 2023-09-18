import { alova } from "src/boot/alova";
import { useAuthStore } from "src/stores/auth-store";
import { useBootstrapStore } from "src/stores/bootstrap";
import { useUserStore } from "src/stores/user-store";

/**
 * Parse an error response object
 *
 * @param { Object } error
 * @returns
 */
export const error = (e, debug = true) => {
  let error = {}
  if ((e.response && e.response.data) || e?.data) {
    error = e.response?.data || e.data;
  } else if (e.response) {
    error = e.response;
  } else if (e.statusText) {
    error = e.statusText;
  }

  if (error.errors && !Array.isArray(error.errors)) {
    error.list = Object.keys(error.errors).map((key) => {
      return {
        [key]: error.errors[key][0],
      };
    });
    // Convert error.list to object
    error.list = Object.assign({}, ...error.list);
  }
  if (
    process.env.DEV &&
    debug === true &&
    process.env.LOG_LEVEL &&
    (process.env.DEBUG === "true" || process.env.DEBUG === true) &&
    typeof console[process.env.LOG_LEVEL] === "function"
  ) {
    if (process.env.NODE_ENV === "development") {
      console[process.env.LOG_LEVEL](error);
    }
  }
  return error;
}

/**
 * @description Read env variables from .env file and modify based on current environment
 * @param { String } env
 * @default "baseURL"
 * @returns { String }
 */
export const readEnv = (env = "baseURL") => {
  if (process.env.PROD || process.env.ENVIRONMENT === "production") {
    // Production
    if (env === "baseURL") {
      return process.env.baseURL;
    } else if (env === "rootURL") {
      return process.env.rootURL;
    } else if (env === "PUSHER_APP_KEY") {
      return process.env.PUSHER_APP_KEY;
    } else if (env === "PUSHER_APP_CLUSTER") {
      return process.env.PUSHER_APP_CLUSTER;
    }
  } else {
    // Development
    if (env === "baseURL") {
      return process.env.dev.baseURL;
    } else if (env === "rootURL") {
      return process.env.dev.rootURL;
    } else if (env === "PUSHER_APP_KEY") {
      return process.env.dev.PUSHER_APP_KEY;
    } else if (env === "PUSHER_APP_CLUSTER") {
      return process.env.dev.PUSHER_APP_CLUSTER;
    }
  }
};

export const reboot = (app, done) => {
  return new Promise((resolve, reject) => {
    const bootStore = useBootstrapStore();
    alova
      .Get("v2/init", {
        localCache: false,
      }).send()
      .then(async ({ data }) => {
        if (data) {
          bootStore.boot(data);
          if (app) {
            app.config.globalProperties.$boot = bootStore;
          }

          refreshUser(app).then((user) => {
            typeof done == 'function' && done(data, user)
            resolve(data, user);
          });
        } else {
          reject(data);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const refreshUser = (app) => {
  return new Promise((resolve, reject) => {
    const authStore = useAuthStore();
    if (!authStore.token) {
      return resolve();
    }

    alova
      .Get("v2/account", {
        localCache: false,
      }).send()
      .then(({ data }) => {
        const userStore = useUserStore();
        if (data) {
          userStore.setUser(data);
          if (app) {
            app.config.globalProperties.$user = userStore.user;
          }

          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 *
 * @param {import("vue-router").RouteLocationNormalized} to
 * @param {import("vue-router").Router} router
 * @returns
 */
export const authValidator = (to, router) => {
  // Initialize the auth store
  const authStore = useAuthStore();
  // Initialize the bootstrap store
  const bootStore = useBootstrapStore();
  // Initialize the user store
  const userStore = useUserStore();

  const user = userStore.user

  // Check if user is logged in when requesting a page that requires authentication
  if (!authStore.token && (to.meta.requireAuth || to.meta.requireAdmin)) {
    // Redirect to Login if login required
    router.push({ name: 'login' });
  } else if (authStore.token) {
    const settings = bootStore.settings;

    // Set variables: User needs to be verified
    const needsVerification =
      (!user.email_verified_at && settings?.verify_email) || (!user.phone_verified_at && settings?.verify_phone);

    // Set variables: User is verified
    const isVerifiedUser = !needsVerification && !to.meta.requireVerification;

    // Redirect to the appropriate dashboard based on user role and verification status
    if (to.meta.requireGuest) {
      if (['admin', 'manager', 'dispatch'].indexOf(user.role)) {
        return router.replace({ name: user.role === 'admin' ? 'admin.dashboard' : 'dispatch.delivery' })
      } else if (isVerifiedUser || !needsVerification) {
        return router.replace({ name: 'dashboard' })
      }
    } else if (!to.meta.requireVerification && !isVerifiedUser && to.name !== 'logout') {
      if (!user.email_verified_at && settings.verify_email) {
        return router.push({ name: 'account.verify', params: { type: 'email' } });
      } else if (!user.phone_verified_at && settings.verify_phone) {
        return router.push({ name: 'account.verify', params: { type: 'phone' } });
      }
    } else if (to.meta.requireAdmin && user.role !== 'admin') {
      return router.replace({ name: 'dashboard' });
    }
  }

  // Perform a graceful login
  if (to.name === 'logout' && authStore.token) {
    authStore.logOut().then(() => {
      router.replace({ name: "login" });
    });
  }
}
