<template>
  <q-card flat class="bg-transparent">
    <q-card-section class="q-pa-none">
      <div class="row q-col-gutter-sm justify-start">
        <div
          class="col-md-3 col-sm-12 col-xs-12"
          :key="i"
          v-for="(item, i) in items"
          @click="onClick(item)"
        >
          <q-item
            class="q-pa-none"
            :class="[
              `bg-${item.color}-4`,
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
              class="q-pa-lg q-mr-none text-white"
              :class="`bg-${item.color}`"
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
              style="max-width: 30px"
              class="q-px-none q-mx-none text-white"
              :class="`bg-${item.color}-4`"
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
</style>
