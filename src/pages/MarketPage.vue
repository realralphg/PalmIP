<template>
  <q-page>
    <q-card class="q-mt-sm no-shadow" bordered>
      <TitleSection separator title="Market Place">
        <template #button>
          <q-btn
            rounded
            label="Manage My Items"
            color="primary"
            :to="{ name: 'user.market' }"
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
          :rows="sales_data"
          :columns="sales_column"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-user_id="props">
            <q-td :props="props">
              <q-item
                class="q-py-none full-height"
                :to="{ name: 'profile', params: { user: props.row.username } }"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="props.row.avatar" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ props.row.name }}
                  </q-item-label>
                  <q-item-label>
                    {{ helpers.trunc(props.row.address, 30) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>
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
    name: "user_id",
    label: "Seller",
    field: "name",
    sortable: false,
    align: "left",
    classes: "q-pa-none important",
  },
  {
    name: "name",
    label: "Crop",
    field: "product_name",
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
    alova.Get(`marketplace`, {
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
