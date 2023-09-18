import { defineStore } from "pinia";

export const useBootstrapStore = defineStore("bootstrap", {
  state: () => ({
    fruitbay_categories: [],
    configurations: {},
    lost_page: null,
    settings: { referral_bonus: 0, currency_symbol: "₦" },
    website: {},
    booted: null,
    charts: {
      subscriptions: {},
      transactions: 0,
      customers: 0,
      income: 0,
      sales: 0,
      pie: {},
      bar: {},
    },
    plans: [],
    cart: [],
    app: { paymentInitData: null, paymentSuccess: null, storeView: "gridView" },
    meta: {
      reboots: null,
    },
    win_size: {
      width: 0,
      height: 0,
      header: { width: 0, height: 0 },
      footer: { width: 0, height: 0 },
    },
    updates: {
      lastChecked: null,
      available: false,
      upgrade: false,
      version: null,
      link: null,
    },
    error404: {
      message: null,
      current: null,
      isset: false,
    },
  }),
  getters: {
    getPlans (state) {
      return state.plans;
    },
    getSettings (state) {
      return state.settings;
    },
    getLostPage (state) {
      return state.lost_page;
    },
    runtime (state) {
      return ((dt2, dt1) => {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
      })(new Date(), new Date(state.booted));
    },
    getCart: (state) => {
      return state.cart.map(item => {
        item.fees_total = item.fees * item.qty
        return item
      })
    },
    getCartTotal: (state) => state.cart.reduce((acc, item) => {
      return acc += (item.price * item.qty);
    }, 0),
    isBooted () {
      return this.runtime <= 720
    },
  },

  actions: {
    boot ({ settings, plans, configurations, fruitbay_categories }) {
      if (settings) {
        this.settings = settings;
      }
      if (configurations) {
        this.configurations = configurations;
      }
      if (plans) {
        this.plans = plans;
      }
      if (fruitbay_categories) {
        this.fruitbay_categories = fruitbay_categories;
      }
      this.booted = new Date().toString();
      if (this.meta.reboots === null) {
        this.meta.reboots = 0;
      } else {
        this.meta.reboots++;
      }
    },
    setUpdate ({ lastChecked, available, version, link, upgrade = false, clear = false }) {
      if (clear === true) {
        this.updates = {
          lastChecked: null,
          available: false,
          upgrade: false,
          version: null,
          link: null,
        }
      } else {
        this.updates = {
          lastChecked: lastChecked || (new Date).getTime(),
          available: available || false,
          upgrade: upgrade || false,
          version: version || null,
          link: link || null,
        }
      }
    },
    set404 ({ message, msg, previous, current, isset }) {
      this.error404 = {
        message: message || msg || null,
        current: current || null,
        isset: isset || false,
      }
    },
    setLostPage (page) {
      this.lost_page = page;
    },
    setSettings (settings) {
      this.settings = settings;
    },
    setAttr (data, attr) {
      this[attr] = data;
    },
    clearCart () {
      this.cart = [];
    },
    removeFromCart (data, type = null) {
      this.setCart(data, type, false)
    },
    addToCart (data, type = null) {
      this.setCart(data, type, true)
    },
    setQty (data, qty = 1, sub = false) {
      this.cart.map(item => {
        if (data?.id === item.id) {
          item.qty = sub ? Math.floor(data.qty - qty) : Math.floor(data.qty + qty)
        }
        return item
      })
    },
    setCart (data, type = null, add = true) {
      // If data is an array, then let's loop through it and add each item to the cart
      if (Array.isArray(data)) {
        data.forEach((item) => {
          this.setCart(item);
        });
      } else if (typeof data === "object") {
        data = {
          id: data.id,
          qty: 1,
          name: data.name,
          fees: data.fees,
          price: data.price || data.amount,
          image_url: data.image_url,
        }
        // If data is an object, then we are adding to the cart
        // If the item already exists in the cart, then we are updating it
        // If the item does not exist in the cart, then we are adding it
        let item = this.cart.find(
          (item) => item.id === data.id && (type ? item.type === type : true)
        );
        if (add === false) {
          // Remove the item
          item && this.cart.splice(this.cart.indexOf(item), 1);
        } else {
          if (item) {
            // Update the item
            item.qty = data.qty;
          } else {
            // Add the item
            this.cart.push(data);
          }
        }
      }
    },
  },
});
