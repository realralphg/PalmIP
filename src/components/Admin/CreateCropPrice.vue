<template>
  <CustomDialog
    :title="`${price.id ? 'Update' : 'Create'} Crop Price: ${form.item}`"
    @before-hide="reset"
    v-model="toggle"
  >
    <q-form
      class="q-col-gutter-md row"
      :style="$q.screen.gt.xs ? 'min-width: 400px' : undefined"
      @submit="1"
    >
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.item"
          label="Item"
          :error="!!errors.item"
          :error-message="errors.item"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          label="Unit"
          hint="E.g: Bags, KG, Tons"
          v-model="form.unit"
          :error="!!errors.unit"
          :error-message="errors.unit"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.available_qty"
          :label="`Available Quantity (${form.unit})`"
          :error="!!errors.available_qty"
          :error-message="errors.available_qty"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.price"
          :label="`Price per ${helpers.singularize(form.unit)} (${
            boot.settings.currency_symbol
          })`"
          :error="!!errors.price"
          :error-message="errors.price"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          readonly
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.icon"
          label="Icon"
          :error="!!errors.icon"
          :error-message="errors.icon"
        >
          <template #prepend>
            <q-icon color="primary" :name="form.icon" />
          </template>
          <q-popup-proxy v-model="iconData.showIconPicker">
            <QIconPicker
              tooltips
              text-color="primary"
              color="blue-1"
              icon-set="fontawesome-v5"
              :class="['pop-up', $q.screen.name]"
              v-model="form.icon"
              v-model:model-pagination="iconData.pagination"
            />
          </q-popup-proxy>
        </q-input>
      </div>
    </q-form>
    <template #actions>
      <q-btn
        color="primary"
        :label="`${price.id ? 'Update' : 'Create'} Crop Price`"
        :loading="loading"
        @click="create"
      />
    </template>
  </CustomDialog>
</template>

<script setup>
import { alova } from "src/boot/alova";
import { useForm } from "@alova/scene-vue";
import { computed, ref, watch, watchEffect } from "vue";
import QIconPicker from "src/components/QIconPicker";
import CustomDialog from "../CustomDialog.vue";
import helpers from "src/plugins/helpers";
import { useBootstrapStore } from "src/stores/bootstrap";
import "@quasar/quasar-ui-qiconpicker/src/index.sass";

const emit = defineEmits(["update:modelValue", "update:item", "created"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  data: {
    type: Object,
    default: () => ({
      item: "",
      icon: "info",
      unit: "Bags",
      price: 0,
      available_qty: 0,
    }),
  },
});

const boot = useBootstrapStore();
const errors = computed(() => error.value?.errors || {});
const toggle = ref(props.modelValue);
const price = ref(props.data);

const open = (i) => {
  price.value = i || props.data;
  toggle.value = true;
};

const iconData = ref({
  showIconPicker: false,
  pagination: {
    itemsPerPage: 60,
    page: 0,
  },
});

const {
  form,
  error,
  reset,
  loading,
  send: create,
  onSuccess,
} = useForm(
  (fd) =>
    alova.Post(`admin/prices${price.value.id ? "/" + price.value.id : ""}`, {
      ...fd,
      _method: price.value.id ? "PUT" : "POST",
    }),
  {
    initialForm: {
      item: price.value.item,
      icon: price.value.icon || "info",
      unit: price.value.unit,
      price: price.value.price,
      available_qty: price.value.available_qty,
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  // Notify the user
  helpers.notify(data.message, "success");
  if (price.value.id) {
    emit("update:item", data.data);
  } else {
    emit("created", data.data);
  }
  price.value = data.data;
});

watchEffect(() => {
  emit("update:modelValue", toggle.value);
});

watch(price, (i) => {
  form.value = {
    item: i.item,
    icon: i.icon || "info",
    unit: i.unit,
    price: i.price,
    available_qty: i.available_qty,
  };
});
defineExpose({ open });
</script>

<style scoped lang="scss">
.pop-up {
  height: 300px;
  min-width: 500px;
  &.sm,
  &.xs {
    min-width: 200px;
  }
}
</style>
