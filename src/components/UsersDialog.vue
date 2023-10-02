<template>
  <q-dialog v-model="opened" @show="send">
    <q-card style="min-width: 500px">
      <q-toolbar class="q-pa-sm">
        <div
          style="
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 50%;
          "
          class="bg-green q-mr-sm row items-center justify-center"
        >
          <img
            style="width: 40px; height: 40px; object-fit: contain"
            src="~/assets/palm_logo.png"
          />
        </div>

        <q-toolbar-title>
          <span class="text-weight-bold">Users</span>
          |
          <span class="text-capitalize">{{ helpers.pluralize(type) }}</span>
        </q-toolbar-title>

        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section v-if="loading">
        <q-inner-loading showing />
      </q-card-section>

      <q-card-section
        style="max-height: 500px"
        class="scroll"
        v-if="users?.length"
      >
        <q-list bordered separator>
          <q-item
            clickable
            v-ripple
            :key="user.id"
            :to="{ name: 'profile', params: { user: user.username } }"
            v-for="(user, i) in users"
            v-intersection="(e) => onIntersect(e, i === users.length - 1, i)"
          >
            <q-item-section avatar>
              <q-avatar>
                <img :src="user.avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ user.fullname }}
              </q-item-label>
              <q-item-label>
                {{ helpers.trunc(user.address, 30) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section v-else-if="!loading">
        <div class="full-width column items-center text-positive q-gutter-sm">
          <q-icon size="2em" name="sentiment_satisfied" />
          No user outbreaks have been reported lately.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { usePagination } from "@alova/scene-vue";
import { alova } from "src/boot/alova";
import helpers from "src/plugins/helpers";
import { ref } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "farmer",
  },
});

const {
  send,
  page,
  loading,
  data: users,
  isLastPage,
} = usePagination(
  (page, limit) =>
    alova.Get(`users`, {
      params: {
        page,
        limit,
        type: props.type,
      },
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

const onIntersect = ({ isIntersecting }, isLast) => {
  if (isLast && isIntersecting && !isLastPage.value) {
    page.value++;
  }
};

defineExpose({ toggle });
</script>
