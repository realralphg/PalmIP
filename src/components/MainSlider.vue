<template>
  <swiper-container
    loop="true"
    css-mode="true"
    navigation="true"
    :centered-slides="true"
    :autoplay-delay="5000"
    :autoplay-pause-on-mouse-enter="true"
    :autoplay-disable-on-interaction="true"
  >
    <swiper-slide :key="slide" v-for="slide in 6">
      <q-img height="500px" :src="`/slides/slide-${slide}.jpg`" />
    </swiper-slide>
  </swiper-container>
</template>

<script setup></script>

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
