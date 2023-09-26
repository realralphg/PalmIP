<template>
  <CustomDialog
    square
    maximized
    persistent
    :model-value="showMapLayers"
    card-class="flex justify-center items-center"
    card-section-class="q-pa-none full-width h-100"
    card-section-height="100%"
    @show="$emit('update:modelValue', true)"
    @hide="$emit('update:modelValue', false)"
  >
    <MapLayers
      height="100%"
      v-model="locationData"
      :zoom="17"
      :address="{ title: addressHint, ...location }"
    >
      <div
        class="flex no-wrap justify-start bg-white text-dark tf-rounded-tr-3 q-pa-md"
      >
        <q-btn
          dense
          unelevated
          rounded
          color="negative"
          icon="close"
          @click="showMapLayers = false"
        />
        <q-inner-loading :showing="loading">
          <q-spinner-tail color="primary" />
          <p class="text-primary">{{ hintInfo }}</p>
        </q-inner-loading>
      </div>
    </MapLayers>
  </CustomDialog>
</template>

<script>
import MapLayers from "./MapLayers.vue";
import CustomDialog from "components/CustomDialog.vue";

export default {
  components: { CustomDialog, MapLayers },
  name: "MapViewer",
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Boolean,
    },
    location: {
      type: Object,
      default: () => ({}),
    },
    id: {
      type: String,
    },
    addressHint: {
      type: String,
      default: "Your item is here",
    },
    hint: {
      type: String,
      default: "Fetching map data...",
    },
    errorMessage: {
      type: String,
    },
    error: {
      type: Boolean,
      default: false,
    },
    square: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    locationData() {
      return this.buildLocation(this.location);
    },
  },
  watch: {
    modelValue(e) {
      this.showMapLayers = e;
    },
  },
  data() {
    return {
      hintInfo: this.hint,
      showMapLayers: this.modelValue,
      loading: false,
    };
  },
  methods: {
    buildLocation(loc) {
      return {
        lat: loc.lat || loc.location.lat,
        lng: loc.lng || loc.lon || loc.location.lng || loc.location.lon,
        lon: loc.lon || loc.lng || loc.location.log || loc.location.lng,
      };
    },
  },
};
</script>

<style>
.lctn-p {
  height: auto;
}
.h-100 {
  height: calc(100% - 50px);
}
</style>
