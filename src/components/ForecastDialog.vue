<template>
  <q-dialog v-model="opened">
    <q-card style="min-width: 500px">
      <q-toolbar class="q-pa-sm">
        <div
          style="
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 50%;
          "
          class="bg-green q-mr-sm row items-center justify-center"
        >
          <img
            style="width: 40px; height: 40px; object-fit: contain"
            src="~/assets/palm_logo.png"
          />
        </div>

        <q-toolbar-title
          ><span class="text-weight-bold">Weather</span>
          Information</q-toolbar-title
        >

        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section v-if="data.forecast?.forecastday">
        <q-list bordered separator>
          <q-item :key="cast.date" v-for="cast in data.forecast.forecastday">
            <q-item-section avatar>
              <q-icon :name="`img:${cast.day.condition.icon}`" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-grey-7">
                {{ cast.date }}
              </q-item-label>
              <q-item-label>{{ cast.day.condition.text }} </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="flex no-wrap">
                <span class="text-weight-bold">{{ cast.day.avgtemp_c }}</span>
                ° Celsius
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section v-else-if="!loading">
        <div class="full-width column items-center text-positive q-gutter-sm">
          <q-icon size="2em" name="sentiment_satisfied" />
          No forecast information available.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { alova, useRequest } from "src/boot/alova";
import { useUserStore } from "stores/user-store";
import { ref, computed } from "vue";

const userStore = useUserStore();
const user = computed({
  get: () => userStore.user,
  set: (u) => userStore.setUser(u),
});

// Define WEATHER_API_KEY key
const WAPI_KEY = process.env.WEATHER_API_KEY;
// Request Weather info
const { data } = useRequest(
  () => {
    const instance = alova.Get(
      `https://api.weatherapi.com/v1/forecast.json?q=${user.value.city}&days=14&key=${WAPI_KEY}`,
      {
        localCache: {
          mode: "placeholder",
          expire: 20000,
        },
      },
    );
    !instance.meta ? (instance.meta = {}) : null;
    instance.baseURL = "";
    instance.meta.noAuth = true;
    return instance;
  },
  {
    initialData: [
      {
        current: { temp_c: 0 },
        forecast: { forecastday: [] },
      },
    ],
  },
);

const opened = ref(false);
const toggle = () => {
  opened.value = !opened.value;
};

defineExpose({ toggle });
</script>
