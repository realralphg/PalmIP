<template>
  <q-page padding class="q-px-xl">
    <div class="column items-center q-gutter-sm">
      <q-avatar size="100px">
        <q-img si :src="user.avatar" />
      </q-avatar>
      <div class="text-h6 text-weight-bold">
        <q-item-label>{{ user.fullname }}</q-item-label>
      </div>
      <div class="flex items-center justify-center q-gutter-x-sm">
        <q-item-label class="justify-center flex">
          <q-icon name="local_mall" color="grey-8" class="q-mr-xs" />
          {{ helpers.intStr(user.market_count) }}
        </q-item-label>
        <q-separator vertical />
        <q-item-label class="justify-center flex">
          <q-icon name="work" color="grey-8" class="q-mr-xs" />
          <span class="text-capitalize">
            {{ user.type }}
          </span>
        </q-item-label>
        <q-separator vertical />
        <q-item-label class="justify-center flex">
          <q-icon name="phone" color="grey-8" class="q-mr-xs" />
          {{ user.phone }}
        </q-item-label>
      </div>
      <div class="column full-width">
        <div class="row q-col-gutter-md">
          <div class="col-md-8 col-12">
            <q-card
              flat
              bordered
              class="full-width q-pa-md"
              style="min-height: 500px"
            >
              <q-inner-loading :showing="loading" />
              <q-card-section v-if="user.about">
                <q-item-label class="text-weight-bold">About</q-item-label>
                <q-item-label>{{ user.about }}</q-item-label>
              </q-card-section>
              <q-separator v-if="user.about && user.phone" />
              <q-card-section v-if="user.phone">
                <q-item-label class="text-weight-bold"
                  >Phone Number</q-item-label
                >
                <q-item-label>{{ user.phone }}</q-item-label>
              </q-card-section>
              <q-separator v-if="user.phone && user.email" />
              <q-card-section v-if="user.email">
                <q-item-label class="text-weight-bold"
                  >Email Address</q-item-label
                >
                <q-item-label>{{ user.email }}</q-item-label>
              </q-card-section>
              <q-separator v-if="user.email && user.address" />
              <q-card-section v-if="user.address">
                <q-item-label class="text-weight-bold">Address</q-item-label>
                <q-item-label>
                  {{ [user.address, user.city, user.state].join(", ") }}
                </q-item-label>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-4 col-12">
            <q-card flat bordered class="full-width q-pa-md">
              <q-card-section>
                <q-item-label class="text-weight-bold">
                  Market Items ({{ helpers.intStr(user.market_count) }})
                </q-item-label>
                <q-scroll-area style="height: 420px">
                  <q-inner-loading :showing="loadingMarket" />
                  <q-list>
                    <q-item
                      class="q-pl-none"
                      :key="item.id"
                      v-for="item in marketItems"
                      v-intersection="
                        (e) => onIntersectMarket(e, i === users.length - 1, i)
                      "
                    >
                      <q-item-section avatar>
                        <q-avatar rounded>
                          <img :src="item.image_url" />
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="text-weight-bold">
                          {{ item.product_name }}
                        </q-item-label>
                        <q-item-label caption class="">
                          {{ helpers.trunc(item.address, 35) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-scroll-area>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { usePagination } from "@alova/scene-vue";
import { alova, useRequest } from "src/boot/alova";
import helpers from "src/plugins/helpers";
import { useRoute } from "vue-router";

const route = useRoute();

const { data: user, loading } = useRequest(
  alova.Get(`users/${route.params.user}`, {
    transformData: (data) => data.data,
  }),
  {
    initialData: { market_count: 0 },
  },
);

const {
  loading: loadingMarket,
  page: marketPage,
  data: marketItems,
  isLastPage: isLastItem,
} = usePagination(
  (page, limit) =>
    alova.Get(`marketplace`, {
      params: {
        page,
        limit,
        user_id: route.params.user,
      },
      localCache: {
        mode: "placeholder",
        expire: 3.6e6,
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
  },
);

const onIntersectMarket = ({ isIntersecting }, isLast) => {
  if (isLast && isIntersecting && !isLastItem.value) {
    marketPage.value++;
  }
};
</script>
