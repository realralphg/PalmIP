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

export const reboot = (app, done) => {
  return new Promise((resolve, reject) => {
    const bootStore = useBootstrapStore();
    alova
      .Get("init", {
        cacheFor: {
          mode: 'memory',
          expire: 4.32e4, // 12 Hours
        }
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
      .Get("account", {
        cacheFor: false,
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

export const roleRoute = (user, router, validated) => {
  if (['admin'].includes(user.role)) {
    return router.replace({ name: user.role === 'admin' ? 'admin.dashboard' : 'user.dashboard' })
  } else if (validated) {
    return router.replace({ name: 'user.dashboard' })
  }
}

/**
 *
 * @param {import("vue-router").RouteLocationNormalized} to
 * @param {import("vue-router").Router} router
 * @returns
 */
export const authValidator = (to, router) => {
  // Initialize the auth store
  const { token } = useAuthStore();
  // Initialize the bootstrap store
  const { settings } = useBootstrapStore();
  // Initialize the user store
  const { user } = useUserStore();

  // Check if user is logged in when requesting a page that requires authentication
  if (!token && (to.meta.requiresAuth || to.meta.requiresAdmin)) {
    // Redirect to Login if login required
    router.push({ name: 'login' });
  } else if (token) {
    // Set variables: User needs to be verified
    const unverified =
      (!user.email_verified_at && settings?.verify_email) || (!user.phone_verified_at && settings?.verify_phone);

    // Set variables: User is verified
    const verified = !unverified && !to.meta.requireVerification;

    // Redirect to the appropriate dashboard based on user role and verification status
    if (to.meta.requiresGuest) {
      return roleRoute(user, router, verified || !unverified);
    } else if (!to.meta.requireVerification && !verified && to.name !== 'logout') {
      if (!user.email_verified_at && settings.verify_email) {
        return router.push({ name: 'account.verify', params: { type: 'email' } });
      } else if (!user.phone_verified_at && settings.verify_phone) {
        return router.push({ name: 'account.verify', params: { type: 'phone' } });
      }
    } else if (to.meta.requiresAdmin && user.role !== 'admin') {
      return router.replace({ name: 'user.dashboard' });
    }
  }
}
