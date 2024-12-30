<template>
  <q-page class="flex bg-image flex-center">
    <q-card
      class="shadow-15"
      v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '40%' }"
    >
      <q-card-section>
        <q-avatar size="103px" class="absolute-center">
          <div
            style="
              width: 80px;
              height: 80px;
              object-fit: contain;
              border-radius: 50%;
            "
            class="bg-green q-mr-sm row items-center justify-center"
          >
            <img
              style="width: 70px; height: 70px; object-fit: contain"
              src="~/assets/palm_logo.png"
            />
          </div>
        </q-avatar>
      </q-card-section>
      <q-card-section>
        <div class="text-center q-pt-lg">
          <div class="col text-h6 ellipsis">Create your account</div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-form class="q-col-gutter-md row" @submit="attemptLogin">
          <div class="col-12">
            <q-input
              filled
              lazy-rules
              hide-bottom-space
              type="text"
              v-model="form.name"
              label="Fullname"
              :error="!!errors.name"
              :error-message="errors.name"
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
          <div class="col-6">
            <q-input
              filled
              lazy-rules
              hide-bottom-space
              v-model="form.password"
              label="Password"
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
          <div class="col-6">
            <q-input
              filled
              lazy-rules
              hide-bottom-space
              v-model="form.password_confirmation"
              label="Repeat Password"
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
          <div class="col-12 q-pt-lg flex justify-center">
            <q-btn
              size="lg"
              label="Register"
              type="submit"
              color="primary"
              class="full-width"
              :loading="registering"
            />
          </div>
          <p class="col-12 text-dark text-center">
            Already have an account?
            <RouterLink class="text-primary" :to="{ name: 'login' }">
              Login
            </RouterLink>
          </p>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from "vue";
import { RouterLink, useRouter } from "vue-router";
import LocalePicker from "src/components/LocalePicker.vue";
import helpers from "src/plugins/helpers";
import { useUserStore } from "src/stores/user-store";
import { useQuasar } from "quasar";
import { userTypes } from "src/data/collection";
import { useInlineAuth } from "@toneflix/vue-auth";

const $q = useQuasar();
const errors = computed(() => error.value?.errors || {});
const router = useRouter();
const userStore = useUserStore();
const hidePassword = ref(true);

const locales = ref({ countries: [], states: [], cities: [] });
const locale = ref({
  city: {},
  state: { name: "Kaduna", iso2: "KD" },
  country: { name: "Nigeria", iso2: "NG" },
});
const localeData = (options, type) => {
  locales.value[type] = options;
};

const form = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  address: "",
  country: "Nigeria",
  state: "Kaduna",
  city: "Kaduna",
  type: userTypes[0].value,
});

const { register } = useInlineAuth();
// Form handler
const {
  send: attemptLogin,
  error,
  loading: registering,
  onSuccess,
} = register(form);

// Success handler
onSuccess((data) => {
  userStore.setUser(data.data);

  // Notify the user
  helpers.notify(data.message, "success");

  // Redirect the user
  // if ($q.platform.is.mobile) {
  //   router.push({ name: "intro.loading" });
  // } else {
  router.replace({ name: "user.dashboard" });
  // }
});

watchEffect(() => {
  // Show the loading
  if (registering.value) $q.loading.show();
  // Hide the loading
  else $q.loading.hide();
});
</script>

<style>
.bg-image {
  padding-top: 4rem;
  background-image: linear-gradient(135deg, white 0%, #f4f4f4 100%);
}
</style>
