<template>
  <CustomDialog
    :title="`${outbreak.id ? 'Update' : 'Create'} Disease Outbreak: ${
      form.name
    }`"
    @before-hide="reset"
    v-model="toggle"
  >
    <q-form class="q-col-gutter-md row" @submit="1" style="min-width: 400px">
      <div class="col-12 flex justify-center">
        <TUploader
          v-model="image"
          label="SLide Image"
          accept=".jpg,.png,.jpeg"
          width="200px"
          :preview="outbreak.image_url"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.name"
          label="Name"
          :error="!!errors.name"
          :error-message="errors.name"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="textarea"
          v-model="form.description"
          label="Description"
          :error="!!errors.description"
          :error-message="errors.description"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.reported_at"
          label="Reported At"
          :error="!!errors.reported_at"
          :error-message="errors.reported_at"
          @click="show_date_picker = true"
        >
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                class="no-shadow"
                transition-show="scale"
                transition-hide="scale"
                v-model="show_date_picker"
              >
                <q-date
                  v-model="form.reported_at"
                  mask="YYYY-MM-DD"
                  @update:model-value="show_date_picker = false"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <q-checkbox
          v-model="form.active"
          label="Active"
          :true-value="1"
          :false-value="0"
        />
      </div>
    </q-form>
    <template #actions>
      <q-btn
        color="primary"
        :label="`${outbreak.id ? 'Update' : 'Create'} Disease Outbreak`"
        :loading="loading"
        @click="create"
      />
    </template>
  </CustomDialog>
</template>

<script setup>
import { axios } from "src/boot/alova";
import { useForm } from "alova/client";
import { computed, ref, watch, watchEffect } from "vue";
import CustomDialog from "../CustomDialog.vue";
import helpers from "src/plugins/helpers";
import { date } from "quasar";
import TUploader from "../TUploader.vue";

const emit = defineEmits(["update:modelValue", "update:item", "created"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
});

const image = ref(null);
const errors = computed(() => error.value?.errors || {});
const toggle = ref(props.modelValue);
const show_date_picker = ref(false);

const outbreak = defineModel("data", {
  type: Object,
  default: () => ({
    name: "",
    active: 1,
    reported_at: date.formatDate(new Date(), "YYYY-MM-DD"),
  }),
});

const open = (i) => {
  outbreak.value = i ?? outbreak.value;
  outbreak.value.reported_at = date.formatDate(
    outbreak.value.reported_at,
    "YYYY-MM-DD",
  );
  toggle.value = true;
};

const {
  form,
  error,
  reset,
  loading,
  send: create,
  onSuccess,
} = useForm(
  (fd) => {
    const a = axios.Post(
      `admin/disease/outbreaks${
        outbreak.value.id ? "/" + outbreak.value.id : ""
      }`,
      {
        ...fd,
        image: image.value,
        _method: outbreak.value.id ? "PUT" : "POST",
      },
      {
        enableUpload: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    a.meta = {
      noContentType: true,
    };
    return a;
  },
  {
    initialForm: {
      name: outbreak.value.name,
      active: outbreak.value.active,
      description: outbreak.value.description,
      reported_at: date.formatDate(outbreak.value.reported_at, "YYYY-MM-DD"),
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  // Notify the user
  helpers.notify(data.message, "success");
  if (outbreak.value.id) {
    emit("update:item", data.data);
  } else {
    emit("created", data.data);
  }
  outbreak.value = data.data;
});

watchEffect(() => {
  emit("update:modelValue", toggle.value);
});

watch(outbreak, (i) => {
  form.value = {
    name: i.name,
    active: i.active ? 1 : 0,
    description: i.description,
    reported_at: date.formatDate(i.reported_at, "YYYY-MM-DD"),
  };
});
defineExpose({ open });
</script>
