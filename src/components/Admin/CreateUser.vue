<template>
  <CustomDialog
    square
    position="right"
    full-height
    :title="`${user.id ? 'Update' : 'Create'} User: ${
      user.fullname || form.firstname
    }`"
    @before-hide="reset"
    v-model="toggle"
  >
    <q-list>
      <q-item>
        <q-item-section align="center" class="q-mb-md flex justify-center">
          <ImageCropper :aspect-ratio="1 / 1" @result="prepareProfilePic">
            <template #default="{ open, dataURL }">
              <q-circular-progress
                show-value
                size="100px"
                color="red"
                track-color="grey-3"
                class="q-ma-md edit-photo-progress"
                :class="{ inactive: !uploading.total }"
                :value="uploading.total"
                :thickness="!!uploading.total ? 0.3 : 0.0"
              >
                <q-avatar size="90px" class="edit-photo-avatar">
                  <img :src="dataURL || user.avatar" />

                  <q-btn
                    round
                    dense
                    unelevated
                    size="10px"
                    color="primary"
                    class="absolute-top-right"
                    @click="open"
                  >
                    <q-icon size="xs" name="edit" />
                  </q-btn>
                </q-avatar>
              </q-circular-progress>
            </template>
          </ImageCropper>
        </q-item-section>
      </q-item>
    </q-list>
    <q-form
      class="q-col-gutter-md row"
      ref="userProfileFormRef"
      @submit="create"
      style="min-width: 500px"
    >
      <div class="col-6">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.firstname"
          label="Fullname"
          :error="!!errors.firstname"
          :error-message="errors.firstname"
        />
      </div>
      <div class="col-6">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.lastname"
          label="Fullname"
          :error="!!errors.lastname"
          :error-message="errors.lastname"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="textarea"
          v-model="form.about"
          label="About"
          :error="!!errors.about"
          :error-message="errors.about"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.address"
          label="Address/Farm Address"
          :error="!!errors.address"
          :error-message="errors.address"
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
        <q-select
          filled
          lazy-rules
          emit-value
          map-options
          hide-bottom-space
          v-model="form.type"
          label="What are you?"
          :options="userTypes"
          :error="!!errors.type"
          :error-message="errors.type"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="text"
          v-model="form.email"
          label="Email Address"
          :error="!!errors.email"
          :error-message="errors.email"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          type="tel"
          autocomplete="tel"
          v-model="form.phone"
          label="Phone Number"
          :error="!!errors.phone"
          :error-message="errors.phone"
        />
      </div>
      <div class="col-12">
        <LocationPicker
          filled
          clear-search
          hint="Automatically get your location data."
          @update:location="onPickLocation"
          class="full-width"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          label="Latitude"
          v-model="form.latitude"
          :error="!!errors.latitude"
          :error-message="errors.latitude"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          label="Longitude"
          v-model="form.longitude"
          :error="!!errors.longitude"
          :error-message="errors.longitude"
        />
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          v-model="form.password"
          label="New Password"
          autocomplete="new-password"
          :type="hidePassword ? 'password' : 'text'"
          :error="!!errors.password"
          :error-message="errors.password"
        >
          <template #append>
            <q-btn
              flat
              dense
              rounded
              size="sm"
              color="primary"
              :icon="hidePassword ? 'visibility' : 'visibility_off'"
              @click="hidePassword = !hidePassword"
            />
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <q-input
          filled
          lazy-rules
          hide-bottom-space
          v-model="form.password_confirmation"
          label="Repeat New Password"
          autocomplete="new-password"
          :type="hidePassword ? 'password' : 'text'"
          :error="!!errors.password_confirmation"
          :error-message="errors.password_confirmation"
        >
          <template #append>
            <q-btn
              flat
              dense
              rounded
              size="sm"
              color="primary"
              :icon="hidePassword ? 'visibility' : 'visibility_off'"
              @click="hidePassword = !hidePassword"
            />
          </template>
        </q-input>
      </div>
    </q-form>
    <template #actions>
      <q-btn
        color="primary"
        :label="`${user.id ? 'Update' : 'Create'} User`"
        :loading="loading"
        @click="$refs.userProfileFormRef.submit()"
      />
    </template>
  </CustomDialog>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { axios } from "src/boot/alova";
import { useForm } from "@alova/scene-vue";
import LocalePicker from "src/components/LocalePicker.vue";
import ImageCropper from "src/components/ImageCropper.vue";
import helpers from "src/plugins/helpers";
import LocationPicker from "src/components/maps/LocationPicker.vue";
import CustomDialog from "../CustomDialog.vue";

const emit = defineEmits(["update:modelValue", "update:item", "created"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const user = ref(props.data);
const errors = computed(() => error.value?.errors || {});
const hidePassword = ref(true);

const userTypes = [
  {
    value: "farmer",
    label: "Farmer",
  },
  {
    value: "processsor",
    label: "Processsor",
  },
  {
    value: "marketer",
    label: "Marketer",
  },
  {
    value: "transporter",
    label: "Transporter",
  },
  {
    value: "offtaker",
    label: "Offtaker",
  },
  {
    value: "researcher",
    label: "Researcher",
  },
];

const toggle = ref(props.modelValue);
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
  form.value.latitude = data.lat;
  form.value.longitude = data.lng;
  form.value.address = data.value;
  form.value.country = data.address?.country || form.value.country;
  form.value.state = data.address?.state || form.value.state;
  form.value.city =
    data.address?.city || data.address?.village || form.value.city;
};

const open = (i) => {
  user.value = i || {};
  toggle.value = true;
};

const prepareProfilePic = ({ blob }) => {
  form.value.image = blob;
};

const {
  send: create,
  form,
  error,
  reset,
  onError,
  loading,
  uploading,
  onSuccess,
} = useForm(
  (fd) => {
    const avi = axios.Post(
      `admin/users/${user.value.id}`,
      {
        ...fd,
        location: [fd.latitude, fd.longitude].join(","),
        country: fd.country?.name || fd.country,
        state: fd.state?.name || fd.state,
        city: fd.city?.name || fd.city,
        _method: "PUT",
      },
      {
        enableUpload: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    avi.meta = {
      noContentType: true,
    };
    return avi;
  },
  {
    initialForm: {
      image: null,
      firstname: user.value.firstname,
      lastname: user.value.lastname,
      about: user.value.about,
      email: user.value.email,
      phone: user.value.phone,
      address: user.value.address,
      country: user.value.country,
      latitude: user.value.latitude,
      longitude: user.value.longitude,
      state: user.value.state,
      city: user.value.city,
      type: user.value.type || userTypes[0].value,
      password: null,
      password_confirmation: null,
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  user.value = data.data;
  if (uploading.value.total >= 100) {
    uploading.value.total = 0;
  }
  // Notify the user
  helpers.notify(data.message, "success");
  if (user.value.id) {
    emit("update:item", data.data);
  } else {
    emit("created", data.data);
  }
});

onError(({ error }) => {
  helpers.notify(error.message, error.status);
});

watchEffect(() => {
  emit("update:modelValue", toggle.value);
});

watch(user, (i) => {
  form.value = {
    image: null,
    firstname: i.firstname,
    lastname: i.lastname,
    about: i.about,
    email: i.email,
    phone: i.phone,
    address: i.address,
    country: i.country,
    latitude: i.latitude,
    longitude: i.longitude,
    state: i.state,
    city: i.city,
    type: i.type || userTypes[0].value,
    password: null,
    password_confirmation: null,
  };
});

defineExpose({ open });
</script>
