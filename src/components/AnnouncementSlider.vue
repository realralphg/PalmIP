<template>
  <swiper-container
    class="dash_swiper"
    v-bind="$attrs"
    :loop="true"
    :observer="true"
    :css-mode="true"
    :navigation="true"
    :autoplay-delay="4000"
    :slides-per-view="slidesPerView[$q.screen.name] || 3"
    :update-on-window-resize="true"
    :autoplay-pause-on-mouse-enter="true"
    :autoplay-disable-on-interaction="true"
  >
    <swiper-slide :key="slide.id" v-for="slide in data">
      <q-card flat class="q-ma-md" bordered>
        <q-card-section>
          <div class="text-h6 text-grey-8">{{ slide.title }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="card_section">
          {{ slide.preview }}
        </q-card-section>
        <q-card-actions class="card_actions" align="right">
          <q-btn label="Details" color="green" @click="open(slide)" />
          <q-btn
            icon="edit"
            label="Edit"
            color="info"
            v-if="editable"
            @click="emit('edit', slide)"
          />
          <ContentRemover
            base-url="admin/announcements"
            v-if="editable"
            :id="slide.id"
            :list="data"
            @deleted="(e, l) => (data = l)"
          />
        </q-card-actions>
      </q-card>
    </swiper-slide>
  </swiper-container>
  <q-dialog v-model="readDialogToggle">
    <q-card flat class="q-ma-md" bordered>
      <img :src="announcement.image_url" v-if="announcement.image_url" />
      <q-card-section>
        <div class="text-h6 text-grey-10">{{ announcement.title }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        {{ announcement.content }}
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { alova, useRequest } from "src/boot/alova";
import { ref } from "vue";
import ContentRemover from "./Admin/ContentRemover.vue";

const emit = defineEmits(["edit"]);
defineProps({
  editable: {
    type: Boolean,
  },
});

const slidesPerView = {
  xs: 1,
  sm: 2,
};
const readDialogToggle = ref(false);
const announcement = ref({});

const open = (slide) => {
  announcement.value = slide;
  readDialogToggle.value = true;
};

const { data } = useRequest(
  alova.Get(`announcements`, {
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
