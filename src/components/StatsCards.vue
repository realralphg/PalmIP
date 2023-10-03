<template>
  <q-card flat class="bg-transparent">
    <q-card-section class="q-pa-none">
      <div class="grid">
        <div
          class="each_card"
          :key="i"
          v-for="(item, i) in items"
          @click="onClick(item)"
        >
          <q-item
            class="q-pa-none"
            :class="[
              `bg-${item.color}-8`,
              { 'cursor-pointer hover-overlay': !!item.click },
            ]"
          >
            <div
              :class="`absolute-top bg-${item.color}-10 full-height full-width overlay`"
              style="z-index: 1; opacity: 0.2; display: none"
            >
              <q-tooltip v-if="item.tooltip">{{ item.tooltip }}</q-tooltip>
            </div>
            <q-item-section
              v-if="icon_position === 'left'"
              side
              class="q-pa-md q-mr-none text-white"
              :class="`bg-${item.color}-10`"
            >
              <q-icon :name="item.icon" color="white" size="lg"></q-icon>
              <q-tooltip v-if="item.tooltip">{{ item.tooltip }}</q-tooltip>
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
            <q-item-section
              style="max-width: 50px"
              class="q-px-md q-mx-none text-white"
              :class="`bg-${item.color}-8`"
              v-if="item.click || item.to"
            >
              <q-icon
                :name="
                  item.danger
                    ? 'warning'
                    : item.danger == false
                    ? 'check_circle'
                    : 'info'
                "
                :class="{
                  'has-badge': [true, false].includes(item.danger),
                  danger: !!item.danger,
                }"
                :color="
                  item.danger === true
                    ? 'negative'
                    : item.danger === false
                    ? 'positive'
                    : 'white'
                "
                size="sm"
              />
              <q-tooltip v-if="item.tooltip">{{ item.tooltip }}</q-tooltip>
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

const onClick = (item) => {
  if (typeof item.click === "function") {
    item.click(item);
    return true;
  }
  return false;
};
</script>

<style scoped lang="scss">
.each_card {
  .q-item {
    height: 120px;
  }
}
.has-badge {
  z-index: 1;
  &:not(.danger) {
    border-radius: 50%;
    background: #fff;
  }
  &.danger {
    animation: blink 1s steps(2, start) infinite;
    &::before {
      content: "";
      width: 0;
      height: 0;
      border-left: 13px solid transparent;
      border-right: 13px solid transparent;
      border-bottom: 21px solid white;
      position: absolute;
      left: 0;
      right: 0;
      z-index: -1;
      top: 0.9px;
    }
  }
}
@keyframes blink {
  to {
    visibility: hidden;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  .text-h6 {
    font-size: 1rem;
  }
}
</style>
