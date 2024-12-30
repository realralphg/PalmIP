<template>
  <q-page>
    <q-card class="q-mt-sm no-shadow" bordered>
      <TitleSection
        separator
        icon="coronavirus"
        title="Disease Outbreaks Management"
      >
        <template #button>
          <q-btn
            label="Create New"
            color="primary"
            @click="
              $refs.createDiseaseOutbreakRef.open({
                name: '',
                active: 1,
                reported_at: date.formatDate(new Date(), 'YYYY-MM-DD'),
              })
            "
          />
        </template>
      </TitleSection>

      <q-card-section class="q-pa-none q-ma-none">
        <q-table
          row-key="id"
          class="no-shadow no-border"
          rows-per-page-label="Items per page"
          :rows="disease_outbreaks"
          :columns="sales_column"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-name="props">
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
                @click="$refs.createDiseaseOutbreakRef.open(props.row)"
              />
              <ContentRemover
                round
                class="q-ml-sm"
                base-url="admin/disease/outbreaks"
                :id="props.value"
                :list="disease_outbreaks"
                @deleted="(e, l) => (disease_outbreaks = l)"
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
    <CreateDiseaseOutbreak
      ref="createDiseaseOutbreakRef"
      @created="(e) => disease_outbreaks.unshift(e)"
      @update:item="
        (e) => {
          disease_outbreaks = disease_outbreaks.map((x) => {
            x.id == e.id && (x = e);
            return x;
          });
        }
      "
    />
  </q-page>
</template>

<script setup>
import { usePagination } from "alova/client";
import { alova } from "src/boot/alova";
import TitleSection from "src/components/TitleSection.vue";
import CreateDiseaseOutbreak from "src/components/Admin/CreateDiseaseOutbreak.vue";
import ContentRemover from "src/components/Admin/ContentRemover.vue";
import helpers from "src/plugins/helpers";
import { date } from "quasar";
import { ref } from "vue";

const createDiseaseOutbreakRef = ref();
const sales_column = [
  {
    name: "name",
    label: "Name",
    field: "name",
    sortable: true,
    align: "left",
  },
  {
    name: "description",
    label: "Description",
    field: (e) => helpers.trunc(e.description || "", 20),
    sortable: true,
    align: "left",
  },
  {
    name: "reported_at",
    label: "Reported At",
    field: (e) => date.formatDate(e.reported_at, "Do MMM, YYYY"),
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
  data: disease_outbreaks,
  onSuccess,
  send: loadItems,
} = usePagination(
  () =>
    alova.Get(`admin/disease/outbreaks`, {
      params: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
      },
      cacheFor: {
        mode: "memory",
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
