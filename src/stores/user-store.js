import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: { id: null, role: null, city: 'Kaduna', country: 'Nigeria' },
  }),
  getters: {
    getUser: (state) => state.user,
  },
  actions: {
    clearUser () {
      return new Promise((resolve) => {
        this.user = { role: null };
        resolve(true);
      });
    },
    setUser (data) {
      this.user = {
        ...this.user,
        ...data,
      };
    },
  },
});
