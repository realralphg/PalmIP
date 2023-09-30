<template>
  <div class="column full-width">
    <q-select
      use-input
      fill-input
      hide-selected
      hide-dropdown-icon
      ref="searchDropdownRef"
      class="search-location"
      input-debounce="0"
      option-value="value"
      option-label="label"
      v-bind="$attrs"
      :hide-bottom-space="hideBottomSpace"
      :placeholder="placeholder"
      :id="id"
      :name="name"
      :square="square"
      :label="label"
      :autocomplete="
        typeof autocomplete === 'boolean' ? String(autocomplete) : autocomplete
      "
      :bottom-slots="bottomSlots"
      :outlined="outlined"
      :color="color"
      :rounded="rounded"
      :filled="filled"
      :dense="dense"
      :hint="hintInfo"
      :loading="loading"
      :options="searchResults"
      :error="error"
      :error-message="errorMessage"
      v-model="searchQuery"
      @filter="updateQuery"
      @keyup.enter="search"
      @focus="searchResults = []"
      @update:model-value="updateLocation"
    >
      <template #no-option v-if="done && searchQuery">
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </template>
      <template #append>
        <q-btn flat dense rounded icon="search" @click="search" />
      </template>
      <template #prepend>
        <t-dropdown
          flat
          dense
          rounded
          icon="person_pin"
          :links="[
            {
              label: 'Current Location',
              icon: 'person_pin',
              click: () => enableGeolocation(),
            },
            {
              label: 'Pick on Map',
              icon: 'add_location_alt',
              click: () => (showMapLayers = true),
            },
          ]"
        />
      </template>
    </q-select>

    <div
      class="flex justify-center full-width"
      v-if="findingLocation && !searchQuery"
    >
      <q-linear-progress
        dark
        indeterminate
        color="primary"
        stripe
        size="20px"
        class="q-mt-sm"
      >
        <div class="absolute-full flex flex-center">
          <q-badge
            color="white"
            text-color="accent"
            label="Please wait... We're searching for your location!"
          />
        </div>
      </q-linear-progress>
    </div>
  </div>
  <CustomDialog
    square
    maximized
    persistent
    v-model="showMapLayers"
    card-class="flex justify-center items-center"
    card-section-class="q-pa-none full-width h-100"
    card-section-height="100%"
  >
    <MapLayers
      draggable
      height="100%"
      v-model="location"
      @update:model-value="searchReversed"
    >
      <div
        class="flex no-wrap justify-start bg-white text-dark tf-rounded-t-3 q-pa-md tf-w-300"
      >
        <span>
          {{
            searchQuery ||
            "Click on any area of the map or drag the marker around to set location."
          }}
        </span>
        <div class="q-ml-xs" v-if="searchQuery && !loading">
          <q-btn
            dense
            unelevated
            color="primary"
            label="Accept"
            @click="(showMapLayers = false), emit('accept:location', location)"
          />
        </div>
        <q-inner-loading :showing="loading">
          <q-spinner-tail color="primary" />
          <p class="text-primary">{{ hintInfo }}</p>
        </q-inner-loading>
      </div>
    </MapLayers>
  </CustomDialog>
  <CustomDialog
    square
    maximized
    persistent
    v-model="permissionDialog"
    card-class="flex justify-center items-center"
    card-section-class="q-pa-none tf-w-400 q-py-md"
    :title="false"
  >
    <div class="column justify-between items-center q-gutter-xl">
      <q-img width="400px" src="~/assets/map.svg" />

      <h4 class="text-h4 tf-font-anton">Enable Geolocation</h4>

      <p class="text-center">
        By enabling geolocation, you make finding your location for
        {{ type_name }} delivery a lot easier.
      </p>

      <q-btn
        no-caps
        rounded
        unelevated
        color="brown-2"
        :label="nativeSettingsBtn ? 'Open Settings' : 'Enable Geolocation'"
        @click="
          () => (nativeSettingsBtn ? nativeSettings() : enableGeolocation())
        "
      />
      <q-btn
        flat
        dense
        no-caps
        color="negative"
        label="Not Now"
        @click="
          () => {
            permissionDialog = false;
          }
        "
      />
    </div>
  </CustomDialog>
</template>

<script setup>
import { Geolocation } from "@capacitor/geolocation";
import { OpenNativeSettings } from "@awesome-cordova-plugins/open-native-settings";
import MapLayers from "./MapLayers.vue";
import TDropdown from "components/TDropdown.vue";
import CustomDialog from "components/CustomDialog.vue";
import { useBootstrapStore } from "stores/bootstrap";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import helpers from "src/plugins/helpers";
import { useQuasar } from "quasar";
import { useUserStore } from "src/stores/user-store";
import { alova, useRequest } from "src/boot/alova";

const emit = defineEmits([
  "update:modelValue",
  "update:location",
  "accept:location",
]);
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Search for a location",
  },
  label: {
    type: String,
    default: "Precise location",
  },
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  autocomplete: {
    type: [String, Boolean],
  },
  type_name: {
    type: String,
    default: "service",
  },
  hint: {
    type: String,
    default: "We recommend choosing a precise location.",
  },
  errorMessage: {
    type: String,
  },
  error: {
    type: Boolean,
  },
  dense: {
    type: Boolean,
  },
  square: {
    type: Boolean,
  },
  outlined: {
    type: Boolean,
  },
  rounded: {
    type: Boolean,
  },
  filled: {
    type: Boolean,
  },
  hideBottomSpace: {
    type: Boolean,
  },
  color: {
    type: String,
    default: "primary",
  },
  bottomSlots: {
    type: Boolean,
  },
  clearSearch: {
    type: Boolean,
  },
});

const boot = useBootstrapStore();
const user = computed({
  get: () => useUserStore().user,
  set: (u) => useUserStore().setUser(u),
});

const $q = useQuasar();
const done = ref(false);
const geoId = ref(null);
const loading = ref(false);
const hintInfo = ref(props.hint);
const searchResults = ref([]);
const showMapLayers = ref(false);
const findingLocation = ref(false);
const permissionDialog = ref(false);
const searchDropdownRef = ref();
const nativeSettingsBtn = ref(false);

const searchQuery = ref(
  props.modelValue || boot.app.geolocation?.value || null,
);

const userLocation = computed(() => ({
  lat: (user.value.location || "").split(",")?.[0],
  lng: (user.value.location || "").split(",")?.[1],
}));
const location = computed({
  get: () => ({
    lat: 9.054585,
    lng: 7.440351,
    // value: "",
    ...userLocation.value,
    ...boot.app.geolocation,
  }),
  set: (v) => (boot.app.geolocation = v),
});

onBeforeUnmount(() => {
  if (geoId.value) {
    Geolocation.clearWatch({ id: geoId.value });
  }
});

onMounted(() => {
  emit("update:location", location.value);
});

watch(
  searchQuery,
  (val) => {
    emit("update:modelValue", val && typeof val === "object" ? val.value : val);
  },
  {
    immediate: true,
  },
);

// Do a reverse search
const {
  loading: loadingReverse,
  send: searchReversed,
  onSuccess: onReversed,
} = useRequest(
  (data) => {
    const a = alova.Get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat: data.lat,
        lon: data.lng,
        format: "json",
      },
    });

    if (!a.meta) a.meta = {};
    a.meta.noAuth = true;
    a.baseURL = "";
    return a;
  },
  {
    immediate: false,
  },
);

// Handle reverse search success
onReversed(({ data }) => {
  searchQuery.value = data.display_name;
  searchResults.value = [
    {
      address: data.address,
      label: data.display_name,
      value: data.display_name,
      lat: data.lat,
      lng: data.lon,
    },
  ];
  boot.app.geolocation = searchResults.value[0];
  hintInfo.value = props.hint; //data.licence
  emit("update:location", boot.app.geolocation);
});

// Watch and set reverse search status
watch(loadingReverse, (i) => {
  loading.value = i;
  done.value = !i;
  if (i) {
    hintInfo.value = "Fetching Location Data...";
  }
});

// Do a normal search
const {
  loading: searching,
  send: doSearch,
  onSuccess: onSearch,
} = useRequest(
  (q) => {
    const a = alova.Get("https://nominatim.openstreetmap.org/search", {
      params: {
        q,
        format: "json",
        addressdetails: 1,
      },
    });

    if (!a.meta) a.meta = {};
    a.meta.noAuth = true;
    a.baseURL = "";
    return a;
  },
  {
    immediate: false,
  },
);

onSearch(({ data }) => {
  searchResults.value = data?.map((item) => {
    return {
      address: item.address,
      label: item.display_name,
      value: item.display_name,
      lat: item.lat,
      lng: item.lon,
    };
  });
  searchDropdownRef.value.showPopup();
});

// Watch and set normal search status
watch(searching, (i) => {
  loading.value = i;
  done.value = !i;
  if (i) {
    hintInfo.value = "Searching...";
  }
});

// Initiate the search
const search = () => {
  doSearch(
    typeof searchQuery.value === "object"
      ? searchQuery.value.value || searchQuery.value.label
      : searchQuery.value,
  );
};

const updateQuery = (val, update) => {
  update(() => {
    searchQuery.value = val;
  });
};

const updateLocation = (val) => {
  searchQuery.value = val;
  searchResults.value = [];
  location.value = val;
  boot.app.geolocation = val;
  emit("update:modelValue", null);
  emit("update:location", val);
  emit("accept:location", val);
};

const getCurrentPosition = () => {
  let fails = 0;
  findingLocation.value = true;
  if (props.clearSearch) {
    searchQuery.value = null;
  }
  geoId.value = Geolocation.watchPosition(
    { enableHighAccuracy: true, timeout: 4000 },
    (position) => {
      if (position) {
        findingLocation.value = false;
        searchReversed({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } else {
        helpers.notify(
          "Your precise location could not be determined.",
          "error",
        );
        fails++;
        if (fails >= 1) {
          findingLocation.value = false;
          Geolocation.clearWatch({ id: geoId.value });
        }
      }

      emit("update:location", location.value);
      emit("accept:location", location.value);
    },
  ).catch((err) => {
    findingLocation.value = false;
    helpers.notify(err.message, "error");
  });
};

const enableGeolocation = () => {
  if ($q.platform.is.capacitor) {
    Geolocation.checkPermissions()
      .then((res) => {
        if (res.granted) {
          getCurrentPosition();
          permissionDialog.value = false;
        } else {
          Geolocation.requestPermissions().then((res) => {
            if (res.granted) {
              getCurrentPosition();
              permissionDialog.value = false;
            } else {
              nativeSettingsBtn.value = true;
            }
          });
        }
      })
      .catch(() => {
        nativeSettingsBtn.value = true;
        helpers.notify(
          "We were unable to obtain geolocation permission for your device.",
          "error",
        );
      });
  } else {
    getCurrentPosition();
  }
};

const nativeSettings = () => {
  OpenNativeSettings.open("location");
};
</script>

<style>
.lctn-p {
  height: auto;
}
.h-100 {
  height: calc(100% - 50px);
}
.search-location {
  width: 100%;
}
</style>
