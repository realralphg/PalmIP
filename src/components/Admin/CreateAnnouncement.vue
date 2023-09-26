<template>
  <CustomDialog
    :title="`${announcement.id ? 'Update' : 'Create'} Announcement: ${
      form.title
    }`"
    @before-hide="reset"
    v-model="toggle"
  >
    <q-form class="q-col-gutter-md row" @submit="1" style="min-width: 400px">
      <div class="col-12 flex justify-center">
        <TUploader
          v-model="image"
          label="Featured Image"
          accept=".jpg,.png,.jpeg"
          width="170px"
          :preview="announcement.image_url"
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
          v-model="form.content"
          label="Message"
          :error="!!errors.content"
          :error-message="errors.content"
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
        :label="`${announcement.id ? 'Update' : 'Create'} Announcement`"
        :loading="loading"
        @click="create"
      />
    </template>
  </CustomDialog>
</template>

<script setup>
import { axios } from "src/boot/alova";
import { useForm } from "@alova/scene-vue";
import { computed, ref, watch, watchEffect } from "vue";
import CustomDialog from "../CustomDialog.vue";
import helpers from "src/plugins/helpers";
import TUploader from "../TUploader.vue";

const emit = defineEmits(["update:modelValue", "update:item", "created"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  data: {
    type: Object,
    default: () => ({
      title: "",
      active: 1,
    }),
  },
});

const image = ref(null);
const errors = computed(() => error.value?.errors || {});
const toggle = ref(props.modelValue);
const announcement = ref(props.data);

const open = (i) => {
  announcement.value = i || props.data;
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
      `admin/announcements${
        announcement.value.id ? "/" + announcement.value.id : ""
      }`,
      {
        ...fd,
        image: image.value,
        _method: announcement.value.id ? "PUT" : "POST",
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
      title: announcement.value.title,
      active: announcement.value.active,
      content: announcement.value.content,
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  // Notify the user
  helpers.notify(data.message, "success");
  if (announcement.value.id) {
    emit("update:item", data.data);
  } else {
    emit("created", data.data);
  }
  announcement.value = data.data;
});

watchEffect(() => {
  emit("update:modelValue", toggle.value);
});

watch(announcement, (i) => {
  form.value = {
    image: null,
    title: i.title,
    active: i.active ? 1 : 0,
    content: i.content,
  };
});
defineExpose({ open });
</script>
