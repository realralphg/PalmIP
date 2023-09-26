<template>
  <q-btn-dropdown
    color="primary"
    content-class="t-dropdown"
    :flat="flat || (!hasAlert && flat !== 0)"
    :class="[
      {
        'no-icon': dropdownIcon === 'none',
        'bg-grey-3 text-dark': hasAlert,
      },
    ]"
    :dropdown-icon="noIcon ? 'none' : dropdownIcon"
    :dense="dense"
    :outline="outline && !hasAlert"
    :icon="noIcon || hasAlert ? undefined : icon"
    :label="label"
    :loading="loading"
    v-if="links.filter((e) => e.show !== false).length"
  >
    <template v-slot:label v-if="hasAlert || tooltip || label">
      <q-tooltip v-if="tooltip">{{ tooltip }}</q-tooltip>
      <q-icon
        name="fa-solid fa-circle"
        class="absolute-top-right text-red"
        size=".7em"
        v-if="!hideAlertIcon && hasAlert"
      />
      <q-icon
        color="primary"
        :name="icon"
        v-if="!noIcon && !!icon && hasAlert"
      />
      <label
        class="q-ma-none q-pa-none"
        :class="{
          'text-white': !outline,
          'text-primary': outline,
        }"
        v-if="label"
      >
        {{ label }}
      </label>
    </template>
    <q-list separator>
      <q-item
        clickable
        v-close-popup
        :active="link.active"
        :disable="!!link.countdown || link.disable || link.disabled"
        :key="link.label"
        :to="link.to"
        :target="link.target"
        @click="onClick(link)"
        v-for="link in links.filter((e) => e.show !== false)"
      >
        <q-item-section v-if="link.loading">
          <q-spinner :color="link.color || 'primary'" size="3em" />
        </q-item-section>
        <q-item-section v-if="!link.loading">
          <q-item-label :class="{ flex: link.countdown }">
            <q-icon
              dense
              class="q-mr-sm"
              :class="link.class"
              :name="link.countdown ? 'fa-duotone fa-timer' : link.icon"
              :color="link.countdown || !link.color ? 'primary' : link.color"
              v-if="link.icon"
            />
            {{ !link.countdown ? link.label : null }}
            <div class="tf-w-140" v-if="link.countdown">
              <vue-countdown
                class="text-weight-bold"
                :time="link.countdown"
                v-slot="{ days, hours, minutes, seconds }"
              >
                {{ days }}d {{ hours }}h {{ minutes }}m {{ seconds }}s
              </vue-countdown>
            </div>
            <q-tooltip v-if="link.tooltip">{{ link.tooltip }}</q-tooltip>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import VueCountdown from "vue-countdown";
export default {
  name: "TDropdown",
  components: { VueCountdown },
  props: {
    tooltip: {
      type: String,
    },
    label: {
      type: String,
    },
    icon: {
      type: String,
      default: "fa-solid fa-ellipsis-vertical",
    },
    dropdownIcon: {
      type: String,
      default: "arrow_drop_down",
    },
    links: {
      type: Array,
      default: () => [],
    },
    flat: {
      type: [Boolean, Number],
      default: false,
    },
    noIcon: {
      type: Boolean,
    },
    hasAlert: {
      type: Boolean,
    },
    hideAlertIcon: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
    dense: {
      type: Boolean,
      default: true,
    },
    outline: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    return {};
  },
  methods: {
    onClick(link) {
      if (link.click && typeof link.click === "function") {
        link.click(this);
      }
    },
  },
};
</script>

<style lang="scss">
.no-icon .q-icon.q-btn-dropdown__arrow {
  display: none;
}
.t-dropdown.q-menu {
  box-shadow:
    0 1px 15px rgb(0 0 0 / 8%),
    0 2px 5px rgb(0 0 0 / 5%);
  border-radius: 15px;
}
</style>
