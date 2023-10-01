<template>
  <swiper-container
    :loop="true"
    :css-mode="true"
    :navigation="true"
    :centered-slides="true"
    :autoplay-delay="5000"
    :autoplay-pause-on-mouse-enter="true"
    :autoplay-disable-on-interaction="true"
  >
    <swiper-slide :key="slide.id" v-for="slide in data">
      <div
        class="relative full-width q-pa-md"
        :style="{
          height: '400px',
          backgroundSize: 'cover',
          backgroundImage: `url(${slide.image_url})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
        }"
      >
        <div
          class="absolute-top-left full-width column justify-center items-center q-px-md full-height"
        >
          <q-spinner
            size="xl"
            color="primary"
            class="q-ma-sm"
            v-if="!slide.loaded"
          />
          <h3
            class="text-h3 text-weight-bold text-left text-grey-4 q-my-xs"
            v-html="helpers.nlText(slide.title, 5)"
          ></h3>
          <h4 class="text-h4 text-weight-bold text-left text-white q-my-xs">
            {{ slide.line1 }}
          </h4>
          <h6 class="text-h6 text-white text-weight-bold text-left q-my-xs">
            {{ slide.line2 }}
          </h6>
          <img
            :src="slide.image_url"
            style="height: 0px; width: 0px"
            v-if="!slide.loaded"
            @load="slide.loaded = true"
          />
        </div>
      </div>
    </swiper-slide>
  </swiper-container>
</template>

<script setup>
import { alova, useRequest } from "src/boot/alova";
import helpers from "src/plugins/helpers";

const { data } = useRequest(
  alova.Get(`slides`, {
    localCache: {
      mode: "placeholder",
      expire: 3.6e6,
    },
    transformData: (data) => data.data,
  }),
  {
    initialData: [],
  },
);
</script>

<style scoped lang="scss">
swiper-container {
  width: 100%;
  height: 100%;

  &::part(pagination) {
    .swiper-button-prev {
      background-color: red;
    }
  }
  &::part(button-next),
  &::part(button-prev) {
    &:hover {
      background-color: rgba(28, 27, 27, 0.515);
    }
    color: rgba(0, 0, 0, 0);
    height: 100%;
    top: 0;
    bottom: 0;
    position: absolute;
    margin-top: 0;
    width: 50px;
  }
  &::part(button-next) {
    right: 0;
    [viewBox] {
      display: none !important;
    }
  }
  &::part(button-prev) {
    left: 0;
  }
}
swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
