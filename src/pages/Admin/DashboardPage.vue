<template>
  <q-page>
    <div class="q-pa-md">
      <StatsCards :items="stats" />
      <div class="row q-col-gutter-md q-my-sm justify-center">
        <div class="col-12 col-sm-6">
          <MainSlider />
        </div>
        <div class="col-12 col-sm-6">
          <MapComponent
            :user="user"
            :users="locationUsers"
            :location="(user.location || '9.21290,7.48805').split(',')"
            @adjusted="getOverviewLocations({ bounds: $event.bounds })"
          />
        </div>
      </div>
    </div>
    <div class="q-pa-md bg-white q-mt-md">
      <h5 class="text-center text-weight-bold q-my-xs">
        Announcements
        <q-btn
          rounded
          label="Create New"
          color="primary"
          @click="$refs.createAnnouncementRef.open()"
        />
      </h5>
      <AnnouncementSlider
        editable
        @edit="$refs.createAnnouncementRef.open($event)"
      />
    </div>
    <UsersDialog :type="usersType" ref="usersDialogRef" />
    <ForecastDialog ref="forecastDialogRef" />
    <DiseaseDialog ref="diseaseDialogRef" />
    <SoilRequirementDialog ref="soilRequirementDialogRef" />
    <!-- ======= -->
    <CreateAnnouncement ref="createAnnouncementRef" />
  </q-page>
</template>

<script setup>
import { alova, axios, useRequest } from "src/boot/alova";
import CreateAnnouncement from "src/components/Admin/CreateAnnouncement.vue";
import AnnouncementSlider from "src/components/AnnouncementSlider.vue";
import ForecastDialog from "src/components/ForecastDialog.vue";
import MapComponent from "src/components/maps/MapComponent.vue";
import MainSlider from "src/components/MainSlider.vue";
import StatsCards from "src/components/StatsCards.vue";
import { computed, onBeforeUnmount, ref } from "vue";
import { useUserStore } from "stores/user-store";
import DiseaseDialog from "src/components/DiseaseDialog.vue";
import helpers from "src/plugins/helpers";
import SoilRequirementDialog from "src/components/SoilRequirementDialog.vue";
import UsersDialog from "src/components/UsersDialog.vue";

const usersType = ref("farmer");
const usersDialogRef = ref();
const forecastDialogRef = ref();
const diseaseDialogRef = ref();
const soilRequirementDialogRef = ref();
const createAnnouncementRef = ref();

const userStore = useUserStore();
const user = computed({
  get: () => userStore.user,
  set: (u) => userStore.setUser(u),
});

// Define WEATHER_API_KEY key
const WAPI_KEY = process.env.WEATHER_API_KEY;
// Request Weather info
const { data: weather, send: checkWeather } = useRequest(
  () => {
    const instance = alova.Get(
      `https://api.weatherapi.com/v1/current.json?q=${user.value.city}&key=${WAPI_KEY}`,
      {
        localCache: {
          mode: "placeholder",
          expire: 3.6e6,
        },
      },
    );
    !instance.meta ? (instance.meta = {}) : null;
    instance.baseURL = "";
    instance.meta.noAuth = true;
    return instance;
  },
  {
    initialData: {
      current: { temp_c: 0 },
    },
  },
);

const weatherInterval = setInterval(() => {
  checkWeather();
}, 3.6e6);

const { data: dashboard } = useRequest(
  alova.Get(`overview`, {
    params: { user_id: user.value.id },
    localCache: {
      mode: "placeholder",
      expire: 3.6e6,
    },
    transformData: (data) => data.data,
  }),
  {
    initialData: {
      stats: {},
    },
  },
);

// Load the locations
const { data: locationUsers, send: getOverviewLocations } = useRequest(
  (params) =>
    axios.Get(`overview/locations`, {
      params: params,
      localCache: {
        mode: "placeholder",
        expire: 3.6e6,
      },
      transformData: (data) => data.data,
    }),
  {
    initialData: [],
    immediate: true,
  },
);

const loadUsers = (type = "farmer") => {
  usersType.value = type;
  usersDialogRef.value.toggle();
};

const stats = computed(() => [
  {
    icon: "people",
    color: "blue",
    label: "Farmers",
    count: dashboard.value.stats.farmers || 0,
    click: () => loadUsers("farmer"),
  },
  {
    icon: "precision_manufacturing",
    color: "green",
    label: "Processsors",
    count: dashboard.value.stats.processsors || 0,
    click: () => loadUsers("processsor"),
  },
  {
    icon: "storefront",
    color: "orange",
    label: "Marketers",
    count: dashboard.value.stats.marketers || 0,
    click: () => loadUsers("marketer"),
  },
  {
    icon: "agriculture",
    color: "teal",
    label: "Transporters",
    count: dashboard.value.stats.transporters || 0,
    click: () => loadUsers("transporter"),
  },
  {
    icon: "flight_takeoff",
    color: "amber",
    label: "Offtakers",
    count: dashboard.value.stats.offtakers || 0,
    click: () => loadUsers("offtaker"),
  },
  {
    icon: "biotech",
    color: "purple",
    label: "Researchers",
    count: dashboard.value.stats.researchers || 0,
    click: () => loadUsers("researcher"),
  },
  {
    sup: "° Celsius",
    icon: weather.value.current.condition?.icon
      ? `img:${weather.value.current.condition.icon}`
      : "cloud",
    color: "light-blue",
    label: "Weather Info",
    count: weather.value.current.temp_c,
    tooltip:
      weather.value.current.condition?.text + " (Click for more information)",
    click: () => forecastDialogRef.value.toggle(),
  },
  {
    icon: "coronavirus",
    color: "purple",
    danger: dashboard.value.stats.disease_outbreaks > 0,
    label: "Disease Outbreak",
    count: dashboard.value.stats.disease_outbreaks || 0,
    tooltip: "Click for more information",
    click: () => diseaseDialogRef.value.toggle(),
  },
  {
    icon: "grass",
    color: "brown",
    label: "Soil Requirements",
    count: dashboard.value.stats.soil_requirements || 0,
    tooltip: "Click for more information",
    click: () => soilRequirementDialogRef.value.toggle(),
  },
  ...(dashboard.value.stats.current_prices || []).map((e) => {
    return {
      sup: ` ${e.unit}`,
      icon: e.icon || "fa-solid fa-wheat-awn",
      color: "blue-grey",
      label: `${e.item} (${helpers.money(e.price || 0)}/${helpers.singularize(
        e.unit,
      )})`,
      count: e.available_qty || 0,
    };
  }),
]);

onBeforeUnmount(() => {
  clearInterval(weatherInterval);
});
</script>
