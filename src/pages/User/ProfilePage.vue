<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-lg-8 col-md-8 col-xs-12 col-sm-12">
        <q-card class="shadow-15">
          <q-card-section class="text-h6">
            <div class="text-h6">Edit Profile</div>
            <div class="text-subtitle2">Complete your profile</div>
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section
                  align="center"
                  class="q-mb-md flex justify-center"
                >
                  <ImageCropper
                    :aspect-ratio="1 / 1"
                    @result="uploadProfilePic"
                  >
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
              ref="updateProfileFormRef"
              @submit="updateProfile"
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
            </q-form>
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              label="Update Profile"
              type="submit"
              color="primary"
              :loading="registering"
              @click="$refs.updateProfileFormRef.submit()"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-4 col-md-4 col-xs-12 col-sm-12">
        <q-card class="shadow-15">
          <q-card-section class="text-center bg-transparent">
            <q-avatar size="100px" class="shadow-10">
              <img :src="user.avatar" />
            </q-avatar>
            <div class="text-subtitle2 q-mt-lg">{{ user.email }}</div>
            <div class="text-h6 q-mt-md">{{ user.fullname }}</div>
          </q-card-section>
          <q-card-section>
            <div class="text-body2 text-justify">
              {{ user.about }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-lg-8 col-md-8 col-xs-12 col-sm-12">
        <q-form ref="updatePasswordFormRef" @submit="updateLocation(location)">
          <q-card class="shadow-15">
            <q-card-section class="text-h6">
              <div class="text-h6">Update Location</div>
            </q-card-section>
            <q-card-section class="row">
              <q-item class="col-12">
                <LocationPicker
                  filled
                  clear-search
                  hint="Automatically get your location data."
                  @update:location="onPickLocation"
                  class="full-width"
                />
              </q-item>
              <q-item class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <q-item-section> Latitude </q-item-section>
              </q-item>
              <q-item class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input
                    filled
                    lazy-rules
                    hide-bottom-space
                    v-model="location.latitude"
                    :error="!!errors.latitude"
                    :error-message="errors.latitude"
                  />
                </q-item-section>
              </q-item>
              <q-item class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <q-item-section> Longitude </q-item-section>
              </q-item>
              <q-item class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input
                    filled
                    lazy-rules
                    hide-bottom-space
                    v-model="location.longitude"
                    :error="!!errors.longitude"
                    :error-message="errors.longitude"
                  />
                </q-item-section>
              </q-item>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                label="Update Location"
                type="submit"
                color="primary"
                :loading="updating_location"
              />
            </q-card-actions>
          </q-card>
        </q-form>
      </div>

      <div class="col-lg-8 col-md-8 col-xs-12 col-sm-12">
        <q-form
          ref="updatePasswordFormRef"
          @submit="updatePassword(password_dict)"
        >
          <q-card class="shadow-15">
            <q-card-section class="text-h6">
              <div class="text-h6">Change Password</div>
            </q-card-section>
            <q-card-section class="row">
              <q-item class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <q-item-section> Current Password </q-item-section>
              </q-item>
              <q-item class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input
                    filled
                    lazy-rules
                    hide-bottom-space
                    v-model="password_dict.password"
                    type="password"
                    label="Password"
                    autocomplete="current-password"
                    :error="!!errors.password"
                    :error-message="errors.password"
                  />
                </q-item-section>
              </q-item>
              <q-item class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <q-item-section> New Password </q-item-section>
              </q-item>
              <q-item class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input
                    filled
                    lazy-rules
                    hide-bottom-space
                    v-model="password_dict.new_password"
                    label="New Password"
                    autocomplete="new-password"
                    :type="hidePassword ? 'password' : 'text'"
                    :error="!!errors.new_password"
                    :error-message="errors.new_password"
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
                </q-item-section>
              </q-item>
              <q-item class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <q-item-section> Confirm New Password </q-item-section>
              </q-item>
              <q-item class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input
                    filled
                    lazy-rules
                    hide-bottom-space
                    v-model="password_dict.new_password_confirmation"
                    label="Repeat New Password"
                    autocomplete="new-password"
                    :type="hidePassword ? 'password' : 'text'"
                    :error="!!errors.new_password_confirmation"
                    :error-message="errors.new_password_confirmation"
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
                </q-item-section>
              </q-item>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                label="Change Password"
                type="submit"
                color="primary"
                :loading="updating_password"
              />
            </q-card-actions>
          </q-card>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from "vue";
import { useUserStore } from "stores/user-store";
import { alova, axios, useRequest } from "src/boot/alova";
import { useForm } from "alova/client";
import LocalePicker from "src/components/LocalePicker.vue";
import ImageCropper from "src/components/ImageCropper.vue";
import helpers from "src/plugins/helpers";
import LocationPicker from "src/components/maps/LocationPicker.vue";
import { userTypes } from "src/data/collection";

const hidePassword = ref(true);
const userStore = useUserStore();

const user = computed({
  get: () => userStore.user,
  set: (u) => userStore.setUser(u),
});

const errors = computed(
  () =>
    error.value?.errors || perror.value?.errors || lerror.value?.errors || {},
);

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
  location.value.latitude = data.lat;
  location.value.longitude = data.lng;
};

const {
  form,
  error,
  loading: registering,
  send: updateProfile,
  onSuccess,
} = useForm(
  (fd) =>
    alova.Post("account", {
      ...fd,
      country: fd.country?.name || fd.country,
      state: fd.state?.name || fd.state,
      city: fd.city?.name || fd.city,
    }),
  {
    initialForm: {
      firstname: user.value.firstname,
      lastname: user.value.lastname,
      about: user.value.about,
      email: user.value.email,
      phone: user.value.phone,
      address: user.value.address,
      country: user.value.country,
      state: user.value.state,
      city: user.value.city,
      type: user.value.type || userTypes[0].value,
    },
    initialData: {},
    store: true,
  },
);

// Success handler
onSuccess(({ data }) => {
  userStore.setUser(data.data);
  // Notify the user
  helpers.notify(data.message, "success");
});

// Change Password
const {
  error: perror,
  loading: updating_password,
  form: password_dict,
  send: updatePassword,
  reset: resetPassForm,
  onSuccess: onUpdatePassword,
} = useForm(
  (formData) => alova.Post("account/password", { ...formData, _method: "PUT" }),
  {
    immediate: false,
    initialForm: {
      password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  },
);

onUpdatePassword(({ data }) => {
  resetPassForm();
  helpers.notify(data.message, data.status);
});

// Update Location
const {
  error: lerror,
  loading: updating_location,
  form: location,
  send: updateLocation,
  onSuccess: onUpdateLocation,
} = useForm(
  (fd) =>
    alova.Post("account/location", {
      location: [fd.latitude, fd.longitude].join(","),
      _method: "PUT",
    }),
  {
    immediate: false,
    initialForm: {
      latitude: (user.value.location || "").split(",")?.[0],
      longitude: (user.value.location || "").split(",")?.[1],
    },
  },
);

onUpdateLocation(({ data }) => {
  user.value = data.data;
  helpers.notify(data.message, data.status);
});

// Update profile photo
const {
  uploading,
  send: sendUpload,
  onSuccess: onUploaded,
  onError: onUploadedError,
} = useRequest(
  (formData) => {
    const avi = axios.Post("account/image", formData, {
      enableUpload: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    avi.meta = {
      noContentType: true,
    };
    return avi;
  },
  {
    immediate: false,
  },
);

const uploadProfilePic = ({ blob }) => {
  sendUpload({ image: blob, _method: "PUT" });
  onUploaded(({ data }) => {
    if (uploading.value.total >= 100) {
      uploading.value.total = 0;
    }
    useUserStore().setUser(data.data);
    helpers.notify(data.message, data.status);
  });

  onUploadedError(({ error }) => {
    helpers.notify(error.message, error.status);
  });
};
</script>
<style scoped>
.edit-photo-progress.inactive {
  border: 12px solid var(--q-primary);
  border-radius: 50%;
}
</style>
