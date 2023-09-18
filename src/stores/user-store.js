import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: { id: null, role: null, subscription: null },
    charts: { transactions: 0, pie: {}, bar: {} },
    subscription: null,
    subscriptions: [],
  }),
  getters: {
    getUser: (state) => state.user,
  },
  actions: {
    clearUser (data) {
      return new Promise((resolve) => {
        this.user = { subscription: null, role: null };
        this.subscription = null;
        this.subscriptions = [];
        resolve(true);
      });
    },
    setUser (data) {
      this.user = {
        ...this.user,
        ...data,
      };
      if (data.subscription) {
        this.subscription = data.subscription;
        if (!this.subscriptions.find((e) => e.id === data.subscription.id)) {
          this.subscriptions.push(data.subscription);
        }
      }
    },
    addSubscription (data) {
      if (this.subscriptions.find(e => e.id == data.id)) {
        this.subscriptions = this.subscriptions.map((sub) => {
          if (sub.id == data.id) {
            sub = data;
          }
          return sub;
        });
      } else {
        this.subscriptions.unshift(data)
      }
    }
  },
});
