<template>
  <q-dialog v-model="opened" @show="send">
    <q-card style="min-width: 500px">
      <q-toolbar>
        <q-avatar>
          <img src="~/assets/logo-vertical.svg" />
        </q-avatar>

        <q-toolbar-title>
          <span class="text-weight-bold">Disease</span>
          Outbreak
        </q-toolbar-title>

        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section v-if="loading">
        <q-inner-loading showing />
      </q-card-section>

      <q-card-section
        style="max-height: 500px"
        class="scroll"
        v-if="diseases?.length"
      >
        <q-list bordered separator>
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
      </q-card-section>
      <q-card-section v-else-if="!loading">
        <div class="full-width column items-center text-positive q-gutter-sm">
          <q-icon size="2em" name="sentiment_satisfied" />
          No disease outbreaks have been reported lately.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { usePagination } from "@alova/scene-vue";
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
