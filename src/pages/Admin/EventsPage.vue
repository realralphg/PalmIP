<template>
  <q-page>
    <q-card class="q-mt-sm no-shadow" bordered>
      <TitleSection separator icon="event" title="Events Management">
        <template #button>
          <q-btn
            label="Create New"
            color="primary"
            @click="$refs.createEventRef.open()"
          />
        </template>
      </TitleSection>

      <q-card-section class="q-pa-none q-ma-none">
        <q-table
          row-key="id"
          class="no-shadow no-border"
          rows-per-page-label="Items per page"
          :rows="events"
          :columns="sales_column"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-title="props">
            <q-td :props="props">
              <q-item>
                <q-item-section avatar>
                  <q-avatar rounded>
                    <img :src="props.row.image_url" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ props.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>
          <template v-slot:body-cell-color="props">
            <q-td :props="props" class="text-center">
              <q-chip
                class="text-white text-capitalize"
                :color="props.value"
                :label="props.value"
              ></q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-icon="props">
            <q-td :props="props" class="text-center">
              <q-chip
                class="text-white text-capitalize"
                color="secondary"
                text-color="white"
                :label="props.value"
                :icon="props.value"
                v-if="props.value"
              ></q-chip>
              <q-chip
                v-else
                class="text-white text-capitalize"
                color="grey"
                label="None"
              ></q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-active="props">
            <q-td :props="props" class="text-center">
              <q-chip
                class="text-white text-capitalize"
                :color="props.value ? 'positive' : 'negative'"
                :label="props.value ? 'Active' : 'Disabled'"
              ></q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-left">
              <q-btn
                color="primary"
                label="Edit"
                @click="$refs.createEventRef.open(props.row)"
              />
              <ContentRemover
                round
                class="q-ml-sm"
                base-url="admin/events"
                :id="props.value"
                :list="events"
                @deleted="(e, l) => (events = l)"
              />
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center text-negative q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span> Nothing to show for now. </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <CreateEvent
      ref="createEventRef"
      @created="(e) => events.unshift(e)"
      @update:item="
        (e) => {
          events = events.map((x) => {
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
import CreateEvent from "src/components/Admin/CreateEvent.vue";
import ContentRemover from "src/components/Admin/ContentRemover.vue";
import helpers from "src/plugins/helpers";
import { ref } from "vue";

const createEventRef = ref();
const sales_column = [
  {
    name: "title",
    label: "Title",
    field: "title",
    sortable: true,
    align: "left",
  },
  {
    name: "details",
    label: "Details",
    field: (e) => helpers.trunc(e.details || "", 25),
    sortable: true,
    align: "left",
  },
  {
    name: "color",
    label: "Color",
    field: "color",
    sortable: true,
    align: "left",
  },
  {
    name: "icon",
    label: "Icon",
    field: "icon",
    sortable: true,
    align: "left",
  },
  {
    name: "active",
    label: "Status",
    field: "active",
    sortable: true,
    align: "center",
  },
  {
    name: "date",
    label: "Date",
    field: "date",
    sortable: true,
    align: "center",
  },
  {
    name: "days",
    label: "Days",
    field: "days",
    sortable: true,
    align: "center",
  },
  {
    name: "actions",
    label: "Actions",
    field: "id",
    sortable: false,
    align: "right",
  },
];

const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 30,
  // rowsNumber: xx if getting data from a server
});
const {
  loading,
  data: events,
  onSuccess,
  send: loadItems,
} = usePagination(
  () =>
    alova.Get(`admin/events`, {
      params: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
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

onSuccess(({ data }) => {
  pagination.value.page = data.meta.current_page;
  pagination.value.rowsNumber = data.meta.total;
  pagination.value.rowsPerPage = data.meta.per_page;
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
