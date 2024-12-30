import { computed, toValue } from "vue";

import { defineStore } from "pinia";
import { useAuth } from "@toneflix/vue-auth";

export const useUserStore = defineStore("user", () => {

  /**
   * @type {{user:import('vue').Ref<{
   * id: number;
   * email:string;
   * phone:string;
   * role:string;
   * city:string;
   * country:string;
   * phone_verified_at:string;
   * email_verified_at:string;
   * }}>} user
   */
  const { user } = useAuth();

  const getUser = computed(() => user.value);

  /**
   * @param {typeof user.value|typeof user} data
   */
  const setUser = (data) => {
    return new Promise((resolve) => {
      user.value = Object.assign({}, user.value, toValue(data));
      resolve(true);
    });
  };

  const clearUser = () => {
    return setUser({});
  };

  return {
    user,
    getUser,
    setUser,
    clearUser
  };
}, {
  persist: true,
});
