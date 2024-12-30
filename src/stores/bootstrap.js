import { computed, ref } from "vue";

import { defineStore } from "pinia";

export const useBootstrapStore = defineStore("bootstrap", () => {
  const lost_page = ref(null)
  const settings = ref({ referral_bonus: 0, currency_symbol: "₦", verify_email: false, verify_phone: false })
  /** @type {import('vue').Ref<{id:number;item:string;unit:string;price:number;available_qty:number}[]>} */
  const products = ref([])
  const website = ref({})
  const booted = ref(null)
  const charts = ref({})
  const app = ref({ paymentInitData: null, geolocation: {} })
  const meta = ref({
    reboots: 0,
  })

  const runtime = computed(() => {
    return ((dt2, dt1) => {
      var diff = (dt2.getTime() - dt1.getTime()) / 1000;
      diff /= 60;
      return Math.abs(Math.round(diff));
    })(new Date(), new Date(booted.value));
  })

  const isBooted = computed(() => {
    return runtime.value <= 720
  })

  /**
   *
   * @param {{products:typeof products.value,settings:typeof settings.value}|{}} data
   */
  const boot = (data = {}) => {
    if (data.settings) {
      settings.value = data.settings;
    }

    if (data.products) {
      products.value = data.products;
    }

    booted.value = new Date().toString();

    if (meta.value.reboots === null) {
      meta.value.reboots = 0;
    } else {
      meta.value.reboots++;
    }
  }

  const setSettings = (_settings) => {
    settings.value = _settings;
  }

  return {
    lost_page,
    settings,
    products,
    website,
    booted,
    charts,
    app,
    meta,

    runtime,
    isBooted,

    setSettings,
    boot,
  };
}, {
  persist: true,
});
