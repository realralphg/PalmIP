<template>
  <q-card flat bordered class="map-box">
    <q-card-section>
      <div id="map"></div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { onMounted } from "vue";
import L from "leaflet";

const completedJourneys = [];

onMounted(() => {
  var map = L.map("map", {
    // zoomControl: false,
    // attributionControl: false,
    // doubleClickZoom: false,
    // dragging: false,
    // scrollWheelZoom: false,
    // touchZoom: false,
  }).setView([9.2129022612738, 7.488058478430111], 12);
  map.createPane("labels");
  map.getPane("labels").style.zIndex = 650;
  map.getPane("labels").style.pointerEvents = "none";
  L.tileLayer(
    // "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    // "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png",
    // "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
    "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
    {
      maxZoom: 10,
      minZoom: 2,
      // subdomains: "abcd",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  ).addTo(map);
  const fontAwesomeIcon = L.divIcon({
    html: `<svg class="q-spinner marker-color" stroke="currentColor" width="2em" height="2em" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke-width="3"><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"></animate></circle><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"></animate></circle></g></svg>`,
    iconSize: [20, 20],
    className: "custom-map-marker",
  });

  // Add polylines
  const latlngs = completedJourneys.map((e) => [e.lat, e.lng]);
  L.polyline(latlngs, {
    color: "red",
    opacity: 0.1,
    weight: 1,
    interactive: false,
  }).addTo(map);

  // Add markers
  completedJourneys.forEach((marker) => {
    L.marker([marker.lat, marker.lng], {
      icon: fontAwesomeIcon,
    })
      .addTo(map)
      .bindPopup(marker.name);
  });
});
</script>

<style scoped lang="scss">
@import "leaflet/dist/leaflet.css";
.map-box {
  #map {
    z-index: 1;
    height: 480px;
  }

  .leaflet-popup-close-button {
    display: none;
  }
  .marker-color {
    color: rgb(255, 0, 0);
  }
  .leaflet-container {
    height: 400px;
    // width: 600px;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
