<template>
  <q-card-section v-bind="$attrs" class="text-h6 q-pb-none">
    <q-item>
      <q-item-section avatar class="">
        <q-icon color="blue" :name="icon" size="44px" />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <div class="text-h6">{{ title }}</div>
        </q-item-label>
        <q-item-label caption class="text-black" v-if="subtitle">
          {{ subtitle }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-card-section>
  <q-separator v-if="separator" />
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "info",
  },
  title: {
    type: String,
  },
  subtitle: {
    type: String,
  },
  separator: {
    type: Boolean,
  },
});
</script>
