<template>
  <swiper-container
    :navigation="true"
    :css-mode="true"
    :loop="true"
    :slides-per-view="3"
    :autoplay-delay="4000"
    :autoplay-pause-on-mouse-enter="true"
    :autoplay-disable-on-interaction="true"
  >
    <swiper-slide :key="slide" v-for="slide in 6">
      <q-card flat class="q-ma-md" bordered>
        <q-card-section>
          <div class="text-h6 text-grey-8">Our Changing Planet</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab autem
          impedit nemo laborum quam veniam, fuga velit cumque dolores eaque
          beatae voluptatem voluptatibus, vero voluptas minima suscipit
          consequuntur eos pariatur.
        </q-card-section>
      </q-card>
    </swiper-slide>
  </swiper-container>
</template>

<script setup>
import Swiper from "swiper";

new Swiper("swiper-container", {
  autoplay: {
    delay: 3000,
    reverseDirection: true,
  },
});
</script>

<style scoped lang="scss">
swiper-container {
  width: 100%;
  height: 100%;
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
