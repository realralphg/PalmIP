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
import { computed, reactive, ref, watchEffect } from "vue";
import { RouterLink, useRouter } from "vue-router";
import helpers from "src/plugins/helpers";
import { useQuasar } from "quasar";
import { useInlineAuth } from "@toneflix/vue-auth";

const $q = useQuasar();
const errors = computed(() => error.value?.errors || {});
const router = useRouter();
const hidePassword = ref(true);

const form = reactive({
  email: "",
  password: "",
  remember: true,
});

const { login } = useInlineAuth();

// Form handler
const { send: attemptLogin, error, loading, onSuccess, onError } = login(form);

// Success handler
onSuccess((data) => {
  // Notify the user
  if (data?.message) helpers.notify(data.message, "success");

  // Redirect the user
  // if ($q.platform.is.mobile) {
  //   router.push({ name: "intro.loading" });
  // } else {
  router.replace({ name: "user.dashboard" });
  // }
});

// Error handler
onError(() => {
  // Hide the loading
  $q.loading.hide();
  helpers.notify("Please Recheck Credentials", "info");
});

watchEffect(() => {
  // Show the loading
  if (loading.value) $q.loading.show();
  // Hide the loading
  else $q.loading.hide();
});
</script>

<style>
.bg-image {
  background-image: linear-gradient(135deg, white 0%, #f4f4f4 100%);
}
</style>
