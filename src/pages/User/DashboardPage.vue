<template>
  <q-page>
    <div class="q-pa-md">
      <StatsCards :items="stats" />
      <div class="row q-col-gutter-md q-my-sm justify-center">
        <div class="col-12 col-sm-6">
          <MainSlider />
        </div>
        <div class="col-12 col-sm-6">
          <MapComponent />
        </div>
      </div>
    </div>
    <div class="q-pa-md bg-white q-mt-md">
      <h5 class="text-center text-weight-bold q-my-xs">Anouncements</h5>
      <AnouncementSlider />
    </div>
  </q-page>
</template>

<script setup>
import AnouncementSlider from "src/components/AnouncementSlider.vue";
import MainSlider from "src/components/MainSlider.vue";
import MapComponent from "src/components/MapComponent.vue";
import StatsCards from "src/components/StatsCards.vue";
import { ref } from "vue";

const stats = ref([
  {
    icon: "person",
    color: "red",
    name: "input_provider",
    label: "Input Provider",
    count: 1300,
  },
  {
    icon: "people",
    color: "blue",
    name: "farmers",
    label: "Farmers",
    count: 2000,
  },
  {
    icon: "precision_manufacturing",
    color: "green",
    name: "processsor",
    label: "Processsors",
    count: 500,
  },
  {
    icon: "storefront",
    color: "orange",
    name: "marketer",
    label: "Marketers",
    count: 300,
  },
  {
    icon: "agriculture",
    color: "teal",
    name: "transporter",
    label: "Transporters",
    count: 120,
  },
  {
    icon: "flight_takeoff",
    color: "amber",
    name: "offtaker",
    label: "Offtakers",
    count: 10,
  },
  {
    icon: "biotech",
    color: "purple",
    name: "researcher",
    label: "Researchers",
    count: 50,
  },
  {
    sup: "° Celsius",
    icon: "cloud",
    color: "brown",
    name: "researcher",
    label: "Weather Info",
    count: 50,
  },
]);
</script>
