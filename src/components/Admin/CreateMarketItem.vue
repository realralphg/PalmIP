<template>
  <CustomDialog
    :title="`${item.id ? 'Update' : 'Create'} Marketplace Item: ${form.name}`"
    @before-hide="reset"
    v-model="toggle"
  >
    <q-form class="q-col-gutter-md row" @submit="1" style="min-width: 400px">
      <div class="col-12 flex justify-center">
        <TUploader
          v-model="image"
          label="Featured Image"
          accept=".jpg,.png,.jpeg"
          width="200px"
          :preview="item.image_url"
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
      <div class="col-6">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.type"
          label="Type"
          :error="!!errors.type"
          :error-message="errors.type"
        />
      </div>
      <div class="col-6">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.grade"
          label="Grade"
          :error="!!errors.grade"
          :error-message="errors.grade"
        />
      </div>
      <div class="col-6">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          label="Quantity Unit"
          hint="E.g: Bags, KG, Tons"
          v-model="form.quantity_unit"
          :error="!!errors.quantity_unit"
          :error-message="errors.quantity_unit"
        />
      </div>
      <div class="col-6">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.quantity"
          :label="`Available Quantity (${form.quantity_unit})`"
          :error="!!errors.quantity"
          :error-message="errors.quantity"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.price"
          :label="`Price per ${helpers.singularize(form.quantity_unit)} (${
            boot.settings.currency_symbol
          })`"
          :error="!!errors.price"
          :error-message="errors.price"
        />
      </div>

      <div class="col-12">
        <LocationPicker
          filled
          clear-search
          label="Location"
          hint="Automatically get your location data."
          @update:location="onPickLocation"
          class="full-width"
        />
      </div>
      <div class="col-6">
        <LocalePicker
          required
          filled
          emit-value
          map-options
          hide-bottom-space
          id="form_state"
          type="states"
          label="Choose State *"
          :default-list="[
            {
              name: 'Abuja Federal Capital Territory',
            },
          ]"
          option-label="name"
          option-value="name"
          option-disable="disabled"
          v-model="form.state"
          :parent-data="{ country: locale.country }"
          :options="locales.states"
          :error="!!errors.state"
          :error-message="errors.state"
          @update="Object.assign(locale, $event)"
          @loaded="localeData($event, 'states')"
        />
      </div>
      <div class="col-6">
        <LocalePicker
          required
          filled
          emit-value
          map-options
          hide-bottom-space
          id="form_city"
          type="cities"
          label="Choose City/Town *"
          option-label="name"
          option-value="name"
          option-disable="disabled"
          :parent-data="{
            country: locale.country,
            state: locale.state,
          }"
          v-model="form.city"
          :options="locales.cities"
          :error="!!errors.city"
          :error-message="errors.city"
          @update="Object.assign(locale, $event)"
          @loaded="localeData($event, 'cities')"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.address"
          label="Address"
          :error="!!errors.address"
          :error-message="errors.address"
        />
      </div>
      <div class="col-12">
        <q-checkbox
          v-model="form.active"
          label="Active"
          :true-value="1"
          :false-value="0"
        />
        <q-checkbox
          v-model="form.approved"
          label="Approved"
          icon-set="material-icons"
          :true-value="1"
          :false-value="0"
          v-if="!user"
        />
      </div>
    </q-form>
    <template #actions>
      <div
        class="flex items-center full-width text-primary"
        :class="{
          'justify-between': !!item.id && !!user,
          'justify-end': !item.id || !user,
        }"
      >
        <div clas="q-mr-xl" v-if="user && item.id">
          Your item will need to be reapproved if you submit this update.
        </div>
        <q-btn
          color="primary"
          :label="`${item.id ? 'Update' : 'Create'} Item`"
          :loading="loading"
          @click="create"
        />
      </div>
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
import { useBootstrapStore } from "src/stores/bootstrap";
import LocationPicker from "../maps/LocationPicker.vue";
import LocalePicker from "../LocalePicker.vue";

const emit = defineEmits(["update:modelValue", "update:item", "created"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  user: {
    type: Object,
  },
  data: {
    type: Object,
    default: () => ({
      name: "",
      grade: "A",
      price: 0.0,
      active: 1,
      approved: 1,
      quantity: 1,
      quantity_unit: "KG",
    }),
  },
});

const boot = useBootstrapStore();
const image = ref(null);
const errors = computed(() => error.value?.errors || {});
const toggle = ref(props.modelValue);
const item = ref(props.data);

const open = (i) => {
  item.value = i || props.data;
  toggle.value = true;
};

const locales = ref({ countries: [], states: [], cities: [] });
const locale = ref({
  city: {},
  state: { name: "Kaduna", iso2: "KD" },
  country: { name: "Nigeria", iso2: "NG" },
});

const localeData = (options, type) => {
  locales.value[type] = options;
};

const onPickLocation = (data) => {
  form.value.location = [data.lat, data.lng].join(",");
  form.value.address = data.value;
  form.value.country = data.address?.country || form.value?.country;
  form.value.state = data.address?.state || form.value?.state;
  form.value.city =
    data.address?.city || data.address?.village || form.value.city;
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
    const prefix = !props.user ? "admin/" : "";
    const a = axios.Post(
      `${prefix}marketplace${item.value.id ? "/" + item.value.id : ""}`,
      {
        ...fd,
        image: image.value,
        country: fd.country?.name || fd.country,
        state: fd.state?.name || fd.state,
        city: fd.city?.name || fd.city,
        _method: item.value.id ? "PUT" : "POST",
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
      name: item.value.product_name,
      type: item.value.type,
      price: item.value.price,
      grade: item.value.grade,
      location: item.value.location,
      address: item.value.address,
      country: item.value.country,
      state: item.value.state,
      city: item.value.city,
      quantity: item.value.quantity,
      quantity_unit: item.value.quantity_unit,
      active: item.value.active ? 1 : 0,
      approved: item.value.approved ? 1 : 0,
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  // Notify the user
  helpers.notify(data.message, "success");
  if (item.value.id) {
    emit("update:item", data.data);
  } else {
    emit("created", data.data);
  }
  item.value = data.data;
});

watchEffect(() => {
  emit("update:modelValue", toggle.value);
});

watch(item, (i) => {
  form.value = {
    image: null,
    name: i.product_name,
    price: i.price,
    type: i.type,
    grade: i.grade,
    location: i.location,
    address: i.address,
    country: i.country,
    state: i.state,
    city: i.city,
    quantity: i.quantity,
    quantity_unit: i.quantity_unit,
    active: i.active ? 1 : 0,
    approved: i.approved ? 1 : 0,
  };
});
defineExpose({ open });
</script>

<style src="@quasar/quasar-ui-qcalendar/dist/index.css"></style>
