<template>
  <q-page>
    <q-card class="q-mt-sm no-shadow" bordered>
      <TitleSection separator title="Market Place Management">
        <template #button>
          <q-btn
            rounded
            label="Create New"
            color="primary"
            @click="$refs.createMarketItemRef.open()"
          />
        </template>
      </TitleSection>

      <q-card-section>
        <q-list class="rounded-here text-grey-5 bg-white">
          <q-item class="items-center full-width">
            <q-item-section>
              <q-input
                rounded
                outlined
                ref="searchRef"
                color="white"
                class="rounded search-input"
                placeholder="Search by reference, handler name or owner name"
                v-model="search"
                @keyup.enter="searching = true"
              >
                <template v-slot:prepend>
                  <q-spinner v-if="!!searching" />
                  <q-btn
                    dense
                    flat
                    rounded
                    size="xs"
                    icon="clear"
                    v-if="search"
                    @click="(search = ''), (searching = true)"
                  />
                  <q-icon name="search" v-else-if="!searching" />
                </template>
                <template v-slot:after>
                  <q-btn
                    flat
                    rounded
                    class="fix"
                    padding="13px"
                    color="primary"
                    icon="arrow_forward"
                    @click="searching = true"
                  />
                </template>
              </q-input>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section class="q-pa-none q-ma-none">
        <q-table
          row-key="id"
          class="no-shadow no-border"
          rows-per-page-label="Items per page"
          :rows="market_items"
          :columns="sales_column"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-item class="q-pl-none">
                <q-item-section avatar>
                  <q-avatar rounded>
                    <img :src="props.row.image_url" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ props.row.product_name }}
                  </q-item-label>
                  <q-item-label caption class="">
                    {{ helpers.trunc(props.row.address, 30) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>
          <template v-slot:body-cell-grade="props">
            <q-td :props="props" class="text-left">
              <q-chip
                color="primary"
                class="text-white text-capitalize"
                :label="props.row.grade"
              ></q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-left">
              <q-btn
                rounded
                color="primary"
                label="Edit"
                @click="$refs.createMarketItemRef.open(props.row)"
              />
              <ContentRemover
                round
                class="q-ml-sm"
                base-url="marketplace"
                :id="props.value"
                :list="market_items"
                @deleted="(e, l) => (market_items = l)"
              />
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center text-negative q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>
                {{
                  search
                    ? `No results found for search: "${search}".`
                    : "You have not created any market place items."
                }}
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <CreateMarketItem
      ref="createMarketItemRef"
      :user="user"
      @created="(e) => market_items.unshift(e)"
      @update:item="
        (e) => {
          market_items = market_items.map((x) => {
            x.id == e.id && (x = e);
            return x;
          });
        }
      "
    />
  </q-page>
</template>

<script setup>
import { usePagination } from "@alova/scene-vue";
import { alova } from "src/boot/alova";
import TitleSection from "src/components/TitleSection.vue";
import CreateMarketItem from "src/components/Admin/CreateMarketItem.vue";
import helpers from "src/plugins/helpers";
import { computed, ref } from "vue";
import ContentRemover from "src/components/Admin/ContentRemover.vue";
import { useUserStore } from "src/stores/user-store";

const sales_column = [
  {
    name: "name",
    label: "Crop",
    field: "product_name",
    sortable: true,
    align: "left",
  },
  {
    name: "address",
    label: "Location",
    field: (e) => helpers.trunc(e.address, 30),
    sortable: true,
    align: "left",
  },
  {
    name: "quantity",
    label: "Quantity",
    field: "qty",
    sortable: true,
    align: "right",
    classes: "text-bold",
  },
  {
    name: "type",
    label: "Type",
    field: "type",
    sortable: true,
    align: "left",
    classes: "text-bold",
  },
  {
    name: "grade",
    label: "Grade",
    field: "grade",
    sortable: true,
    align: "left",
    classes: "text-bold",
  },
  {
    name: "actions",
    label: "Actions",
    field: "id",
    sortable: false,
    align: "right",
  },
];

const search = ref("");
const searching = ref(false);
const createMarketItemRef = ref(null);

const userStore = useUserStore();

const user = computed({
  get: () => userStore.user,
  set: (u) => userStore.setUser(u),
});

const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 30,
});

const {
  loading,
  data: market_items,
  onSuccess,
  onError,
  send: loadItems,
} = usePagination(
  () =>
    alova.Get(`/marketplace`, {
      params: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        user_id: user.value.id,
        search: search.value || undefined,
        [`order[${pagination.value.sortBy}]`]: pagination.value.descending
          ? "desc"
          : "asc",
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
    watchingStates: [searching],
  },
);

onSuccess(({ data }) => {
  searching.value = false;
  pagination.value.page = data.meta.current_page;
  pagination.value.rowsNumber = data.meta.total;
  pagination.value.rowsPerPage = data.meta.per_page;
});

onError(() => {
  searching.value = false;
});

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value.page = page;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  pagination.value.rowsPerPage = rowsPerPage;
  loadItems();
};
</script>
