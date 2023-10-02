<template>
  <q-page>
    <q-card class="q-mt-sm no-shadow" bordered>
      <TitleSection separator icon="groups" title="Users Management" />

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
          :rows="users"
          :columns="columns"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-item class="q-pl-none">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="props.row.avatar" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ props.row.fullname }}
                    {{ props.row.id == user.id ? " (You)" : "" }}
                  </q-item-label>
                  <q-item-label>
                    {{ helpers.trunc(props.row.address, 30) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>
          <template v-slot:body-cell-role="props">
            <q-td :props="props" class="text-left">
              <q-chip
                class="text-white text-capitalize"
                :color="props.value == 'admin' ? 'red' : 'primary'"
                :label="props.value"
              ></q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-left">
              <div class="full-width flex no-wrap justify-end">
                <q-btn
                  color="primary"
                  label="Edit"
                  @click="$refs.createUserRef.open(props.row)"
                />
                <ContentRemover
                  class="q-ml-sm"
                  base-url="admin/users"
                  confirmation="Are you sure you want to delete this user?"
                  :id="props.value"
                  :list="users"
                  v-if="props.row.id !== user.id"
                  @deleted="(e, l) => (users = l)"
                />
                <div class="q-pl-xl" v-if="props.row.id === user.id"></div>
              </div>
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center text-negative q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>
                {{
                  search
                    ? `No users found for search: "${search}".`
                    : "There are no user."
                }}
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <CreateUser
      ref="createUserRef"
      @created="(e) => users.unshift(e)"
      @update:item="
        (e) => {
          users = users.map((x) => {
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
import CreateUser from "src/components/Admin/CreateUser.vue";
import helpers from "src/plugins/helpers";
import { computed, ref } from "vue";
import ContentRemover from "src/components/Admin/ContentRemover.vue";
import { useUserStore } from "src/stores/user-store";

const columns = [
  {
    name: "name",
    label: "Name",
    field: "name",
    sortable: true,
    align: "left",
  },
  {
    name: "email",
    label: "Email",
    field: "email",
    sortable: true,
    align: "left",
  },
  {
    name: "phone",
    label: "Phone",
    field: "phone",
    sortable: true,
    align: "left",
  },
  {
    name: "type",
    label: "Type",
    field: "type",
    sortable: true,
    align: "left",
    classes: "text-bold text-capitalize",
  },
  {
    name: "role",
    label: "Role",
    field: "role",
    sortable: true,
    align: "left",
    classes: "text-bold text-capitalize",
  },
  {
    name: "actions",
    label: "Actions",
    field: "id",
    sortable: false,
    align: "right",
  },
];

const userStore = useUserStore();
const user = computed(() => userStore.user);

const search = ref("");
const searching = ref(false);
const createUserRef = ref(null);

const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 30,
  // rowsNumber: xx if getting data from a server
});
const {
  loading,
  data: users,
  onSuccess,
  onError,
  send: loadItems,
} = usePagination(
  () =>
    alova.Get(`admin/users`, {
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
