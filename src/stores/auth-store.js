import { computed, ref } from "vue";

import { defineStore } from "pinia";
import { useAuth } from "@toneflix/vue-auth";
import { useBootstrapStore } from "./bootstrap";

export const useAuthStore = defineStore("auth", () => {
  const { token, isAuthenticated, logout } = useAuth();

  /** @type {import('vue').Ref<string[]>} roles */
  const roles = ref([]);

  /** @type {import('vue').Ref<string|null>} redirect */
  const redirect = ref([]);

  /** @type {import('vue').Ref<string[]>} permissions */
  const permissions = ref([]);

  const isLoggedIn = computed(() => token.value !== null && isAuthenticated.value);

  const logOut = async () => {
    const state = await logout()
    roles.value = [];
    permissions.value = [];
    useBootstrapStore().app = {
      roles: [],
      permissions: [],
      geolocation: {},
      privilege_map: {},
      paymentInitData: null,
    };

    return state
  }

  /**
   * @param {string} _token
   * @param {'token'} type */
  const setToken = (_token, type = "token") => {
    if (type === 'token') {
      token.value = _token
    }
  }

  /** @param {{roles:string[],permissions:string[]}} data */
  const setLoginData = (data) => {
    if (data.roles) {
      roles.value = data.roles
    }
    if (data.permissions) {
      permissions.value = data.permissions
    }
  }

  const clearAuth = async () => {
    await logOut();
    token.value = null;
    roles.value = [];
    permissions.value = [];
    isAuthenticated.value = false
  }

  const redirectTo = (route) => {
    redirect.value = route;
  }

  return {
    token,
    roles,
    redirect,
    permissions,

    logOut,
    setToken,
    clearAuth,
    redirectTo,
    setLoginData,

    isLoggedIn,
    isAuthenticated,
  }
}, {
  persist: true,
});
