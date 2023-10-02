<template>
  <q-btn
    size="10px"
    color="negative"
    icon="delete"
    :loading="loading"
    @click="confirm"
    v-if="validate"
  />
</template>

<script setup>
import { alova, useRequest } from "src/boot/alova";
import helpers from "src/plugins/helpers";
import { computed, ref } from "vue";

const emit = defineEmits(["deleted", "loading"]);
const props = defineProps({
  id: {
    type: [String, Number],
  },
  ids: {
    type: Array,
    default: () => [],
  },
  baseUrl: {
    type: String,
    default: "",
  },
  list: {
    type: Array,
    default: () => [],
  },
  confirmation: {
    type: [String, Boolean],
    default: "Are you sure you want to delete this item?",
  },
});

const validate = computed(() => {
  const valid = !!(props.id || props.ids.length) && props.baseUrl;
  if (!props.id && !props.ids.length) {
    console.error("Either of the id or ids prop is required");
  }
  if (!props.baseUrl) {
    console.error("The baseUrl prop is required");
  }
  return valid;
});

const parentList = ref(props.list);

const { loading, send, onSuccess } = useRequest(
  alova.Delete(`${props.baseUrl}/${props.id || "items"}`, {
    items: props.ids,
  }),
  {
    immediate: false,
  },
);

const confirm = () => {
  if (props.confirmation) {
    helpers
      .notify({
        alert: true,
        title: "Confirm Delete",
        status: "warning",
        message: props.confirmation,
        ok: "Yes, Delete",
      })
      .onOk(() => {
        send();
      });
  } else {
    send();
  }
};

onSuccess(({ data }) => {
  if (props.ids?.length) {
    props.ids.forEach((e) => {
      parentList.value.splice(
        props.list.findIndex((i) => i.id == e),
        1,
      );
    });
    emit("deleted", props.ids, parentList.value);
  } else {
    parentList.value.splice(
      props.list.findIndex((i) => i.id == props.id),
      1,
    );
    emit("deleted", props.id, parentList.value);
  }
  helpers.notify(data.message, data.status);
});
</script>
