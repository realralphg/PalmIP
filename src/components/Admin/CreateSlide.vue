<template>
  <CustomDialog
    :title="`${slide.id ? 'Update' : 'Create'} Slide: ${form.title || 'New Slide'}`"
    v-model="toggle"
    @before-hide="reset"
  >
    <q-form class="q-col-gutter-md row" @submit="1" style="min-width: 400px">
      <div class="col-12 flex justify-center">
        <TUploader
          v-model="image"
          label="SLide Image"
          accept=".jpg,.png,.jpeg"
          width="200px"
          :preview="slide.image_url"
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
          type="text"
          v-model="form.line1"
          label="Line 1"
          :error="!!errors.line1"
          :error-message="errors.line1"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.line2"
          label="Line 2"
          :error="!!errors.line2"
          :error-message="errors.line2"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.line3"
          label="Line 3"
          :error="!!errors.line3"
          :error-message="errors.line3"
        />
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
        :label="`${slide.id ? 'Update' : 'Create'} Slide`"
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

const emit = defineEmits(["update:modelValue", "update:item", "created"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
});

const image = ref(null);
const errors = computed(() => error.value?.errors || {});
const toggle = ref(props.modelValue);
const slide = defineModel("data", {
  type: Object,
  default: () => ({
    title: "",
    active: 1,
  }),
});

const open = (i) => {
  slide.value = i ?? slide.value;
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
      `admin/slides${slide.value.id ? "/" + slide.value.id : ""}`,
      {
        ...fd,
        image: image.value,
        _method: slide.value.id ? "PUT" : "POST",
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
      title: slide.value.title,
      line1: slide.value.line1,
      line2: slide.value.line2,
      line3: slide.value.line3,
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  // Notify the user
  helpers.notify(data.message, "success");
  if (slide.value.id) {
    emit("update:item", data.data);
  } else {
    emit("created", data.data);
  }
  slide.value = data.data;
});

watchEffect(() => {
  emit("update:modelValue", toggle.value);
});

watch(slide, (i) => {
  form.value = {
    image: null,
    title: i.title,
    line1: i.line1,
    line2: i.line2,
    line3: i.line3,
    active: i.active ? 1 : 0,
  };
});
defineExpose({ open });
</script>
