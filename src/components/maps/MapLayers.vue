<template>
  <div :style="{ height, width }">
    <div class="map" :id="`map-${cuid}`" v-if="loaded"></div>
    <div v-else class="full-height column justify-center items-center">
      <div
        class="tf-sm-h-280 tf-sm-w-280 tf-h-500 tf-w-500 bg-red-1 tf-rounded-full column justify-center items-center q-gutter-md"
      >
        <q-img
          :width="$q.screen.lt.md ? '140px' : '240px'"
          src="assets/map.svg"
        />

        <h4 class="tf-text-6 tf-font-anton">Not Found</h4>

        <p class="text-center q-pa-md">
          We could not find this location on the map.
        </p>
      </div>
    </div>
    <div class="slot">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import { getCurrentInstance, nextTick, ref } from "vue";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";

export default {
  name: "MapLayers",
  emits: ["update:modelValue"],
  props: {
    height: {
      type: String,
      default: "300px",
    },
    width: {
      type: String,
    },
    maxZoom: {
      type: Number,
      default: 20,
    },
    zoom: {
      type: Number,
      default: 13,
    },
    draggable: {
      type: Boolean,
    },
    modelValue: {
      type: Object,
      default: () => ({
        lat: 9.054585,
        lng: 7.440351,
      }),
    },
    address: {
      type: Object,
    },
  },
  setup(props, { emit }) {
    const cuid = getCurrentInstance().uid;

    const position = ref(props.modelValue);

    if (!props.modelValue) {
      return { position, loaded: false };
    }
    nextTick(() => {
      const map = L.map(`map-${cuid}`)
        .setMaxZoom(props.maxZoom)
        .setView([position.value.lat, position.value.lng], props.zoom);
      L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        maxZoom: props.maxZoom,
        attribution: `Map data &copy; ${new Date().getFullYear()} <a href="https://www.google.com/maps">Google</a>`,
      }).addTo(map);

      // Add draggable marker to map
      const marker = L.marker([51.5, -0.09], {
        draggable: props.draggable,
        autoPan: true,
      }).addTo(map);

      // Set the marker to the center of the map
      marker.setLatLng(map.getCenter());

      if (props.address) {
        marker
          .bindPopup(
            `<span class="text-weight-bold">${props.address.title}</span>: <br> ${props.address.address}}`,
          )
          .openPopup();
      }

      // Set the marker icon
      marker.setIcon(
        L.icon({
          iconUrl,
          iconRetinaUrl,
          iconAnchor: [12.5, 41],
          popupAnchor: [0, -41],
          shadowUrl,
        }),
      );

      // Add event listener to marker
      marker.on("dragend", function () {
        position.value = {
          lat: marker.getLatLng().lat,
          lng: marker.getLatLng().lng,
        };
        emit("update:modelValue", position.value);
      });

      // Add click event listener to map
      map.on("click", function (e) {
        marker.setLatLng(e.latlng);
        position.value = {
          lat: marker.getLatLng().lat,
          lng: marker.getLatLng().lng,
        };
        emit("update:modelValue", position.value);
      });
    });

    return {
      cuid,
      loaded: true,
      position,
    };
  },
};
</script>
<style scoped>
@import "leaflet/dist/leaflet.css";
.map {
  height: 100%;
}
.slot {
  z-index: 10000;
  position: absolute;
  bottom: 0;
}
</style>
