<template>
  <CustomDialog
    :title="`${requirement.id ? 'Update' : 'Create'} Soil Requirement: ${
      form.crop
    }`"
    v-model="toggle"
  >
    <q-form class="q-col-gutter-md row" @submit="1" style="min-width: 400px">
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.crop"
          label="Crop"
          :error="!!errors.crop"
          :error-message="errors.crop"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="textarea"
          v-model="form.details"
          label="More Info"
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
          label="Water Requirements"
          v-model="form.water"
          :error="!!errors.water"
          :error-message="errors.water"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          label="Temperature Requirements"
          v-model="form.temperature"
          :error="!!errors.temperature"
          :error-message="errors.temperature"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.period"
          label="Most Suitable Period"
          :error="!!errors.period"
          :error-message="errors.period"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.location"
          hint="Location where this requirement applies to"
          label="Location"
          :error="!!errors.location"
          :error-message="errors.location"
        />
      </div>
    </q-form>
    <template #actions>
      <q-btn
        color="primary"
        :label="`${requirement.id ? 'Update' : 'Create'} Soil Requirement`"
        :loading="loading"
        @click="create"
      />
    </template>
  </CustomDialog>
</template>

<script setup>
import { alova } from "src/boot/alova";
import { useForm } from "alova/client";
import { computed, ref, watch, watchEffect } from "vue";
import CustomDialog from "../CustomDialog.vue";
import helpers from "src/plugins/helpers";

const emit = defineEmits(["update:modelValue", "update:item", "created"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
});

const errors = computed(() => error.value?.errors || {});
const toggle = ref(props.modelValue);
const requirement = defineModel("data", {
  type: Object,
  default: () => ({
    crop: "",
  }),
});

const open = (i) => {
  requirement.value = i ?? requirement.value;
  toggle.value = true;
};

const {
  form,
  error,
  loading,
  send: create,
  onSuccess,
} = useForm(
  (fd) =>
    alova.Post(
      `admin/soil/requirements${
        requirement.value.id ? "/" + requirement.value.id : ""
      }`,
      {
        ...fd,
        _method: requirement.value.id ? "PUT" : "POST",
      },
    ),
  {
    initialForm: {
      crop: requirement.value.crop,
      water: requirement.value.water,
      period: requirement.value.period,
      details: requirement.value.details,
      location: requirement.value.location,
      temperature: requirement.value.temperature,
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  // Notify the user
  helpers.notify(data.message, "success");
  if (requirement.value.id) {
    emit("update:item", data.data);
  } else {
    emit("created", data.data);
  }
  requirement.value = data.data;
});

watchEffect(() => {
  emit("update:modelValue", toggle.value);
});

watch(requirement, (i) => {
  form.value = {
    crop: i.crop,
    water: i.water,
    period: i.period,
    details: i.details,
    location: i.location,
    temperature: i.temperature,
  };
});
defineExpose({ open });
</script>
