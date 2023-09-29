<template>
  <q-page>
    <q-card class="q-mt-sm no-shadow" bordered>
      <TitleSection separator title="Market Place" />

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
                placeholder="Search by name, price or quantity"
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
          :rows="sales_data"
          :columns="sales_column"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-grade="props">
            <q-td :props="props" class="text-left">
              <q-chip
                color="primary"
                class="text-white text-capitalize"
                :label="props.row.grade"
              ></q-chip>
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center text-negative q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>
                {{
                  search
                    ? `No results found for search: "${search}".`
                    : "Nothing to show for now."
                }}
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { usePagination } from "@alova/scene-vue";
import { alova } from "src/boot/alova";
import TitleSection from "src/components/TitleSection.vue";
import helpers from "src/plugins/helpers";
import { ref } from "vue";

const sales_column = [
  {
    name: "item",
    label: "Item",
    field: "item",
    sortable: true,
    align: "left",
  },
  {
    name: "price",
    label: "Price",
    field: (e) =>
      `${helpers.money(e.price || 0)}/${helpers.singularize(e.unit)}`,
    sortable: true,
    align: "left",
    classes: "text-bold",
  },
  {
    name: "available_qty",
    label: "Available Qty",
    field: (e) => `${parseInt(e.available_qty).toLocaleString()} ${e.unit}`,
    sortable: true,
    align: "right",
  },
];

const search = ref("");
const searching = ref(false);
const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 30,
  // rowsNumber: xx if getting data from a server
});
const {
  loading,
  data: sales_data,
  onSuccess,
  onError,
  send: loadItems,
} = usePagination(
  () =>
    alova.Get(`prices`, {
      params: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
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
