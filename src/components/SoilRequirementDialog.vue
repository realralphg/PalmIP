<template>
  <custom-dialog
    v-model="opened"
    card-styles="min-width: 500px"
    card-section-height="550px"
    @show="send"
  >
    <template #top>
      <q-card-section v-if="!!loading">
        <q-inner-loading showing color="primary" />
      </q-card-section>
    </template>

    <template #title>
      <span class="text-weight-bold">Soil</span>
      Requirements
    </template>

    <template #bottom>
      <q-card-section v-if="!requirements?.length && !loading">
        <div class="full-width column items-center text-info q-gutter-sm">
          <q-icon size="2em" name="sentiment_satisfied" />
          No disease outbreaks have been reported lately.
        </div>
      </q-card-section>
    </template>

    <q-list bordered separator v-if="requirements?.length">
      <q-item :key="requirement.id" v-for="requirement in requirements">
        <q-item-section>
          <q-item-label class="text-weight-bold text-h6 text-grey-7">
            {{ requirement.crop }}
          </q-item-label>
          <q-item-label>{{ requirement.details }} </q-item-label>
          <q-item-label>
            Applies to:
            <span class="text-weight-bold">{{ requirement.location }}</span>
          </q-item-label>
          <q-item-label v-if="requirement.water">
            Water Requirements:
            <span class="text-weight-bold">{{ requirement.water }}</span>
          </q-item-label>
          <q-item-label v-if="requirement.period">
            Suggested Planting Period:
            <span class="text-weight-bold">{{ requirement.period }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label caption>Temperature </q-item-label>
          <q-item-label class="text-weight-bold text-grey-7">
            {{ requirement.temperature }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </custom-dialog>
</template>

<script setup>
import { usePagination } from "@alova/scene-vue";
import { alova } from "src/boot/alova";
import { ref } from "vue";
import CustomDialog from "./CustomDialog.vue";

const {
  send,
  loading,
  data: requirements,
} = usePagination(
  () =>
    alova.Get(`soil/requirements`, {
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
