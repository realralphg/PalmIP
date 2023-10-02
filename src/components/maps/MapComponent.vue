<template>
  <q-card flat bordered class="map-box map-component">
    <q-card-section>
      <div class="map" :id="`map-${cuid}`"></div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref, watchEffect } from "vue";
import L from "leaflet";
import OWM from "src/plugins/owm";
import "src/plugins/owm.css";
import { debounce } from "quasar";

import markerIcon from "src/assets/map-marker.png";
import qSpinnerIcon from "src/assets/q-spinner.js";

const cuid = getCurrentInstance().uid;
const emit = defineEmits(["adjusted"]);
const props = defineProps({
  location: {
    type: Array,
    default: () => [0, 0],
  },
  users: {
    type: Array,
    default: () => [],
  },
  user: {
    type: Object,
    default: () => ({}),
  },
});

// Define OWM_API_KEY key
const OWM_API_KEY = process.env.OWM_API_KEY;
const uniqueUserIds = ref(new Set());

onMounted(() => {
  const map = L.map(`map-${cuid}`, {
    // zoomControl: false,
    // attributionControl: false,
    // doubleClickZoom: false,
    // dragging: false,
    // scrollWheelZoom: false,
    // touchZoom: false,
  }).setView(props.location, 7);

  map.createPane("labels");
  map.getPane("labels").style.zIndex = 650;
  map.getPane("labels").style.pointerEvents = "none";
  const tileLayer = L.tileLayer(
    // "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    // "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png",
    // "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
    "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
    // `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
    {
      maxZoom: 10,
      minZoom: 2,
      // subdomains: "abcd",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  ); //.addTo(map);

  const fontAwesomeIcon = L.divIcon({
    html: qSpinnerIcon,
    iconSize: [20, 20],
    className: "custom-map-marker",
  });

  // Add OWM
  const appId = OWM_API_KEY;
  const Clouds = OWM.clouds({
    appId,
    opacity: 0.5,
    showLegend: true,
  });
  const Weather = OWM.current({
    appId,
    intervall: 15,
    popupFunction: (e) => L.popup().setContent(e.name),
  });
  const Precipitation = OWM.precipitation({
    appId,
    intervall: 15,
    popupFunction: (e) => L.popup().setContent(e.name),
  });

  // Add Tile and OWM Layers to ampp
  L.control
    .layers({ Layers: tileLayer }, { Clouds, Weather, Precipitation })
    .addTo(map);
  tileLayer.addTo(map);

  // Add draggable marker to map
  const marker = L.marker([51.5, -0.09], {
    autoPan: true,
    icon: L.icon({
      iconUrl: markerIcon,
      iconAnchor: [19, 30],
      iconSize: [40, 40],
      popupAnchor: [0, -41],
    }),
  }).addTo(map);

  // Set the marker to the center of the map
  marker.setLatLng(map.getCenter());

  // Initialize Polyline
  const polyline = L.polyline([], {
    color: "white",
    opacity: 1,
    weight: 1,
    interactive: false,
  });

  watchEffect(() => {
    if (props.users?.length) {
      // Add markers and polylines //
      props.users.forEach((usr) => {
        // Get the user ID.
        const userId = usr.id;

        // Check if the user ID is already in the set.
        if (!uniqueUserIds.value.has(userId)) {
          // Add the user ID to the set.
          uniqueUserIds.value.add(userId);

          // Add a marker to the map.
          const marker = L.marker([usr.lat, usr.lng], {
            icon: fontAwesomeIcon,
          }).addTo(map);

          // Add a popup
          if (props.user?.role === "admin") {
            marker.bindPopup(usr.fullname);
          }

          // Add the new user's coordinates to the polyline.
          polyline.addLatLng([usr.lat, usr.lng]);

          // If the polyline has at least two points, add it to the map.
          if (polyline.getLatLngs().length >= 2) {
            polyline.addTo(map);
          }
        }
      });
    }
  });

  // Listen to map events and emit the adjusted event
  [("zoomend", "move")].forEach((ev) =>
    map.on(
      ev,
      debounce(function () {
        const center = map.getCenter();
        const bounds = map.getBounds();

        emit("adjusted", {
          zoom: map.getZoom(),
          center: { lat: center.lat, lng: center.lng },
          bounds: {
            ne: { lat: bounds._northEast.lat, lng: bounds._northEast.lng },
            sw: { lat: bounds._southWest.lat, lng: bounds._southWest.lng },
          },
        });
      }, 600),
    ),
  );
});
</script>

<style lang="scss">
@import "leaflet/dist/leaflet.css";
.map-box.map-component {
  .map {
    z-index: 1;
    height: 480px;
  }

  .leaflet-popup-close-button {
    display: none;
  }
  .marker-color {
    color: rgb(255, 255, 255);
  }
  .leaflet-container {
    height: 400px;
    // width: 600px;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
src/assets/q-spinner.js
