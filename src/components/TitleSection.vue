<template>
  <q-card-section v-bind="$attrs" class="text-h6 q-pb-none">
    <q-item>
      <q-item-section avatar class="">
        <q-icon color="green" :name="icon" size="44px" />
      </q-item-section>

      <q-item-section>
        <q-item-label class="flex justify-between">
          <div class="text-h6">{{ title }}</div>
          <slot name="button"></slot>
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
