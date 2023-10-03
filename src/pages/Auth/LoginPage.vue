<template>
  <q-header elevated class="bg-white q-pa-sm">
    <router-link
      to="/"
      flat
      no-caps
      no-wrap
      class="q-ml-xs row items-center logo"
    >
      <div
        style="
          width: 50px;
          height: 50px;
          object-fit: contain;
          border-radius: 50%;
        "
        class="bg-green q-mr-sm row items-center justify-center"
      >
        <img
          style="width: 40px; height: 40px; object-fit: contain"
          src="~/assets/palm_logo.png"
        />
      </div>
      <h1 class="logo">Palmvalley <span>NG</span></h1>
    </router-link>
  </q-header>
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
        <div class="text-center q-pt-xl">
          <div class="col text-h6 ellipsis">Log in to your dashboard</div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md" @submit="attemptLogin">
          <q-input
            filled
            lazy-rules
            type="text"
            autocomplete="email"
            v-model="form.email"
            label="Email Address"
            :error="!!errors.email"
            :error-message="errors.email"
          />

          <q-input
            filled
            lazy-rules
            hide-bottom-space
            v-model="form.password"
            autocomplete="current-password"
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

          <div class="flex q-mt-xl justify-center">
            <q-btn
              size="lg"
              label="Login"
              type="submit"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </div>
          <p class="text-dark q-mt-md text-center">
            Don’t have an account?
            <RouterLink class="text-primary" :to="{ name: 'register' }">
              Register
            </RouterLink>
          </p>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { alova } from "src/boot/alova";
import { useForm } from "@alova/scene-vue";
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import helpers from "src/plugins/helpers";
import { useUserStore } from "src/stores/user-store";
import { authValidator } from "src/plugins/processor";
import { useQuasar } from "quasar";

const $q = useQuasar();
const errors = computed(() => error.value?.errors || {});
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const hidePassword = ref(true);

const {
  form,
  error,
  loading,
  send: attemptLogin,
  onSuccess,
  onError,
} = useForm(
  (fd) => {
    const instance = alova.Post("login", fd);
    !instance.meta ? (instance.meta = {}) : null;
    instance.meta.noAuth = true;
    return instance;
  },
  {
    initialForm: {
      password: "",
      email: "",
    },
    initialData: {},
  },
);

// Success handler
onSuccess(({ data }) => {
  // Set the user and token
  userStore.setUser(data.data);

  // Hide the loading
  $q.loading.hide();

  // Notify the user
  helpers.notify(data.message, "success");

  // Redirect the user
  // if ($q.platform.is.mobile) {
  //   router.push({ name: "intro.loading" });
  // } else {
  authValidator(route, router);
  // }
});

// Error handler
onError(() => {
  // Hide the loading
  $q.loading.hide();
  helpers.notify("Please Recheck Credentials", "info");
});
</script>

<style>
.bg-image {
  background-image: linear-gradient(135deg, white 0%, #f4f4f4 100%);
}
</style>
