<template>
  <q-page class="flex bg-image flex-center">
    <q-card
      class="shadow-15"
      v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '30%' }"
    >
      <q-card-section>
        <q-avatar size="103px" class="absolute-center shadow-10">
          <img src="~/assets/avatar.jpg" />
        </q-avatar>
      </q-card-section>
      <q-card-section>
        <div class="text-center q-pt-lg">
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

          <div class="flex justify-center">
            <q-btn
              rounded
              size="lg"
              label="Login"
              type="submit"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </div>
          <p class="text-dark q-mt-md q-pb-sm text-center">
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
  background-image: linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%);
}
</style>
