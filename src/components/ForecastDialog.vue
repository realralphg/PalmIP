<template>
  <custom-dialog
    v-model="opened"
    card-section-height="550px"
    card-styles="min-width: 500px"
    card-class="q-pb-xl"
  >
    <template #title>
      <span class="text-weight-bold">Weather</span>
      Information
    </template>

    <template #top>
      <q-card-section>
        <location-picker
          filled
          clear-search
          label="Location"
          hint="Get forcasts based on your search location."
          class="full-width"
          @accept:location="onPickLocation"
        />
      </q-card-section>
      <q-card-section v-if="!!loading">
        <q-inner-loading showing color="primary" />
      </q-card-section>
    </template>
    <q-list bordered separator v-if="data.forecast?.forecastday">
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
    <template #bottom>
      <q-card-section v-if="!data.forecast?.forecastday && !loading">
        <div class="full-width column items-center text-positive q-gutter-sm">
          <q-icon size="2em" name="sentiment_satisfied" />
          No forecast information available.
        </div>
      </q-card-section>
    </template>
  </custom-dialog>
</template>

<script setup>
import { debounce } from "quasar";
import { alova, useRequest } from "src/boot/alova";
import { useUserStore } from "stores/user-store";
import { ref, computed } from "vue";
import CustomDialog from "./CustomDialog.vue";
import LocationPicker from "./maps/LocationPicker.vue";

const userStore = useUserStore();
const user = computed({
  get: () => userStore.user,
  set: (u) => userStore.setUser(u),
});

// Define WEATHER_API_KEY key
const WAPI_KEY = process.env.WEATHER_API_KEY;
const forecastQuery = ref(user.value.city);

// Request Weather info
const {
  data,
  loading,
  send: requestForecast,
} = useRequest(
  () => {
    const instance = alova.Get(
      `https://api.weatherapi.com/v1/forecast.json?q=${forecastQuery.value}&days=14&key=${WAPI_KEY}`,
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

const onPickLocation = debounce(function (data) {
  forecastQuery.value = [data.lat, data.lng].join(",");
  requestForecast();
}, 1000);

defineExpose({ toggle });
</script>
