<template>
  <CustomDialog
    :title="`${event.id ? 'Update' : 'Create'} Event: ${form.title}`"
    v-model="toggle"
  >
    <q-form class="q-col-gutter-md row" @submit="1" style="min-width: 400px">
      <div class="col-12 flex justify-center">
        <TUploader
          v-model="image"
          label="SLide Image"
          accept=".jpg,.png,.jpeg"
          width="200px"
          :preview="event.image_url"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.title"
          label="Title"
          :error="!!errors.title"
          :error-message="errors.title"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="textarea"
          v-model="form.details"
          label="Event Info"
          :error="!!errors.details"
          :error-message="errors.details"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.icon"
          label="Icon"
          hint="Use Font Awesome 5 or Material Design Icons"
          :error="!!errors.icon"
          :error-message="errors.icon"
        />
      </div>
      <div class="col-12">
        <q-select
          filled
          lazy-rules
          emit-value
          map-options
          hide-bottom-space
          v-model="form.color"
          label="Label Color"
          :options="[
            'red',
            'green',
            'blue',
            'orange',
            'teal',
            'primary',
            'secondary',
            'info',
            'black',
            'grey',
          ]"
          :error="!!errors.color"
          :error-message="errors.color"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="number"
          v-model="form.days"
          label="Days"
          :error="!!errors.days"
          :error-message="errors.days"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.date"
          label="Date"
          :error="!!errors.date"
          :error-message="errors.date"
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
                  v-model="form.date"
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
        :label="`${event.id ? 'Update' : 'Create'} Event`"
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
import TUploader from "../TUploader.vue";
import { date } from "quasar";

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
const event = defineModel("data", {
  type: Object,
  default: () => ({
    date: date.formatDate(new Date(), "YYYY-MM-DD"),
    title: "",
    active: 1,
  }),
});

const open = (i) => {
  event.value = i ?? event.value;
  event.value.date = date.formatDate(event.value.date, "YYYY-MM-DD");
  toggle.value = true;
};

const {
  form,
  error,
  loading,
  send: create,
  onSuccess,
} = useForm(
  (fd) => {
    const a = axios.Post(
      `admin/events${event.value.id ? "/" + event.value.id : ""}`,
      {
        ...fd,
        image: image.value,
        _method: event.value.id ? "PUT" : "POST",
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
      image: null,
      days: event.value.days,
      date: date.formatDate(event.value.date, "YYYY-MM-DD"),
      icon: event.value.icon,
      title: event.value.title,
      color: event.value.color,
      details: event.value.details,
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  // Notify the user
  helpers.notify(data.message, "success");
  if (event.value.id) {
    emit("update:item", data.data);
  } else {
    emit("created", data.data);
  }
  event.value = data.data;
});

watchEffect(() => {
  emit("update:modelValue", toggle.value);
});

watch(event, (i) => {
  form.value = {
    image: null,
    days: i.days,
    date: date.formatDate(i.date, "YYYY-MM-DD"),
    icon: i.icon,
    title: i.title,
    color: i.color,
    details: i.details,
    active: i.active ? 1 : 0,
  };
});
defineExpose({ open });
</script>
