import { alova } from "../boot/alova.js";
import { defineStore } from "pinia";
import { useBootstrapStore } from "./bootstrap";
import { useUserStore } from "./user-store";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    roles: [],
    redirect: null,
    permissions: [],
  }),
  getters: {
    isLoggedIn (state) {
      return state.token !== null;
    },
  },
  actions: {
    setToken (token, type = "token") {
      this[type] = token;
    },
    setLoginData (data) {
      ['roles', 'permissions'].map(key => {
        if (data[key]) {
          this[key] = data[key]
        }
      });
    },
    clearAuth () {
      return new Promise((resolve) => {
        this.token = null;
        this.roles = [];
        this.permissions = [];
        resolve(true);
      });
    },
    redirectTo (route) {
      this.redirect = route;
    },
    async logOut () {
      return alova
        .Post("/logout", {}, {
          transformData: data => data,
        }).send()
        .then(() => {
          this.roles = [];
          this.permissions = [];
          this.token = null;
          useUserStore().clearUser();
          useBootstrapStore().app = {
            roles: [],
            permissions: [],
            privilege_map: {},
          };
          useBootstrapStore().setLostPage(null);
          return true;
        })
        .catch(({ data }) => {
          if (data.status === 401) {
            this.token = null;
            useUserStore().clearUser();
            return true;
          }
        });
    },
  },
});
