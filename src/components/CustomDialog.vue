<template>
  <q-dialog
    :class="{ 'remove-padding': removePadding }"
    :model-value="modelValue"
    :position="position"
    :full-height="fullHeight"
    :maximized="maximized"
    :square="square"
    @before-show="emit('beforeShow', $event)"
    @show="emit('dialog:ready', $event), emit('show', $event)"
    @before-hide="emit('beforeHide', $event)"
    @hide="emit('hide', $event)"
    @update:model-value="
      (value) => {
        emit('update:modelValue', value);
      }
    "
  >
    <q-card
      flat
      :style="cardStyles"
      :class="[
        'tf-important overflow-hidden',
        { [`tf-rounded${edges}-4`]: !square },
        { [cardClass]: !!cardClass },
      ]"
    >
      <q-toolbar v-if="title !== false">
        <q-avatar>
          <img src="~/assets/logo-vertical.svg" />
        </q-avatar>

        <q-toolbar-title>
          <slot name="title">
            <span class="text-weight-bold">{{ title }}</span>
          </slot>
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup v-if="closable" />
      </q-toolbar>

      <q-separator v-if="!!title" />

      <slot name="top"></slot>

      <q-card-section
        :class="[cardSectionClass, 'scroll']"
        :style="{ maxHeight: $slots.actions ? '85vh' : cardSectionHeight }"
      >
        <slot></slot>
      </q-card-section>
      <slot name="bottom"></slot>

      <q-separator v-if="$slots.actions && !hideFooter" />

      <q-card-actions
        :align="alignActions"
        v-if="$slots.actions && !hideFooter"
      >
        <slot name="actions"></slot>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from "vue";

const emit = defineEmits([
  "update:modelValue",
  "dialog:ready",
  "beforeShow",
  "show",
  "beforeHide",
  "hide",
]);

const props = defineProps({
  /**
   * @description The model value of the dialog
   * @type {Boolean}
   */
  modelValue: {
    type: Boolean,
    default: false,
  },
  /**
   * @description Dialog title, set to true to use the default title, or false to hide the title
   * @type {String | Boolean}
   */
  title: {
    type: [String, Boolean],
    default: "PalmIP",
  },
  /**
   * @description Stick dialog to one of the sides (top, right, bottom or left) Default value: standard
   * @type {String}
   */
  position: {
    type: String,
    default: "standard",
  },
  /**
   * @description Set dialog to full height
   * @type {Boolean}
   */
  fullHeight: {
    type: Boolean,
    default: false,
  },
  /**
   * @description Set dialog to full height
   * @type {Boolean}
   */
  removePadding: {
    type: Boolean,
    default: false,
  },
  /**
   * @description Remove all borders radius and set dialog to square
   * @type {Boolean}
   */
  square: {
    type: Boolean,
    default: false,
  },
  /**
   * @description Set dialog to maximized
   * @type {Boolean}
   */
  maximized: {
    type: Boolean,
    default: false,
  },
  /**
   * @description Determine if dialog is closable
   * @type {Boolean}
   */
  closable: {
    type: Boolean,
    default: true,
  },
  /**
   * @description Hide the footer
   * @type {Boolean}
   */
  hideFooter: {
    type: Boolean,
    default: false,
  },
  /**
   * @description Add custom class to the card
   * @type {String}
   */
  cardClass: {
    type: String,
    default: null,
  },
  /**
   * @description Add custom class to the card section
   * @type {String}
   */
  cardSectionClass: {
    type: String,
    default: null,
  },
  cardSectionHeight: {
    type: String,
    default: "90vh",
  },
  /**
   * @description Align actions to the left or right
   * @type {String}
   */
  alignActions: {
    type: String,
    default: "right",
  },
  /**
   * @description Styles to be applied to the main card
   * @type {String}
   */
  cardStyles: {
    type: String,
  },
});

const edges = computed(
  () =>
    ({
      top: "-b",
      left: "-r",
      right: "-l",
      bottom: "-t",
    })[props.position],
);
// console.log(edges.value)
</script>
<style scope>
.remove-padding .q-dialog__inner {
  padding: 0 !important;
}
</style>
