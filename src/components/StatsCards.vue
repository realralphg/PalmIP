<template>
  <q-card flat class="bg-transparent">
    <q-card-section class="q-pa-none">
      <div class="row q-col-gutter-sm justify-start">
        <div
          class="col-md-3 col-sm-12 col-xs-12"
          :key="item.name"
          v-for="item in items"
        >
          <q-item class="q-pa-none" :class="`bg-${item.color}-4`">
            <q-item-section
              v-if="icon_position === 'left'"
              side
              class="q-pa-lg q-mr-none text-white"
              :class="`bg-${item.color}`"
            >
              <q-icon :name="item.icon" color="white" size="lg"></q-icon>
            </q-item-section>
            <q-item-section class="q-pa-md q-ml-none text-white">
              <q-item-label class="text-white text-h6 text-weight-bolder">
                {{ parseInt(item.count).toLocaleString("us") }}{{ item.sup }}
              </q-item-label>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
            <q-item-section
              v-if="icon_position === 'right'"
              side
              class="q-mr-md text-white"
            >
              <q-icon :name="item.icon" color="white" size="lg"></q-icon>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  items: {
    type: Object,
    default: () => ({}),
  },
  icon_position: {
    type: String,
    default: "left",
  },
});
</script>
