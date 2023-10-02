<template>
  <CustomDialog
    v-model="opened"
    card-styles="min-width: 500px"
    card-section-height="550px"
    @show="send"
  >
    <template #title>
      <span class="text-weight-bold">Disease</span>
      Outbreak
    </template>

    <template #top>
      <q-card-section v-if="!!loading">
        <q-inner-loading showing color="primary" />
      </q-card-section>
    </template>

    <q-list bordered separator v-if="diseases?.length" class="q-mb-lg">
      <q-item :key="disease.id" v-for="disease in diseases">
        <q-item-section avatar>
          <q-avatar rounded>
            <q-img ratio="1" loading="eager" :src="disease.image_url" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold text-h6 text-grey-7">
            {{ disease.name }}
          </q-item-label>
          <q-item-label>{{ disease.description }} </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label caption>Reported On </q-item-label>
          <q-item-label class="text-weight-bold text-grey-7">
            {{ date.formatDate(disease.reported_at, "Do MMM, YYYY") }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <template #bottom>
      <q-card-section v-if="!diseases?.length && !loading">
        <div class="full-width column items-center text-positive q-gutter-sm">
          <q-icon size="2em" name="sentiment_satisfied" />
          No disease outbreaks have been reported lately.
        </div>
      </q-card-section>
    </template>
  </CustomDialog>
</template>

<script setup>
import { usePagination } from "@alova/scene-vue";
import CustomDialog from "./CustomDialog.vue";
import { date } from "quasar";
import { alova } from "src/boot/alova";
import { ref } from "vue";

const {
  send,
  loading,
  data: diseases,
} = usePagination(
  () =>
    alova.Get(`diseases`, {
      localCache: {
        mode: "placeholder",
        expire: 20000,
      },
    }),
  {
    total: (data) => data.meta.total,
    append: false,
    initialData: {
      meta: { total: 0 },
      data: [],
    },
    initialPageSize: 30,
    immediate: false,
  },
);

const opened = ref(false);
const toggle = () => {
  opened.value = !opened.value;
};

defineExpose({ toggle });
</script>
