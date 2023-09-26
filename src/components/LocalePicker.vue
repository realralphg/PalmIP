<template>
  <q-select
    popup-content-class="locale-picker"
    ref="select"
    v-model="model"
    v-bind="$attrs"
    :id="id"
    :label="label"
    :options="locales"
    :loading="loading"
    :emit-value="emitValue"
    :option-label="optionLabel"
    :option-value="optionValue"
    :map-options="mapOptions"
    :autocomplete="currentType"
    :rules="[
      (val) => locales.length <= 0 || !!val || 'Please  select ' + currentType,
    ]"
    @update:model-value="update"
  >
    <template v-slot:selected-item="scope">
      <div class="flex no-wrap items-center">
        <div
          :title="scope.opt.name"
          :class="`fflag fflag-${scope.opt.iso2} ff-sm q-mr-xs`"
          v-if="scope.opt.iso2 && type === 'countries'"
        ></div>
        {{ scope.opt?.name || model?.name || model }}
      </div>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-italic text-grey">
          No {{ currentType }} available, have you selected a {{ parent }}?
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" class="flex">
        <q-item-section>
          <q-item-label class="flex items-center">
            <div
              :class="`fflag fflag-${scope.opt.iso2} ff-sm q-mr-xs`"
              :title="scope.opt.name"
              v-if="scope.opt.iso2 && type === 'countries'"
            ></div>
            {{ scope.opt.name }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { createAlova, useRequest } from "alova";
import GlobalFetch from "alova/GlobalFetch";
import VueHook from "alova/vue";
import { is } from "quasar";
import { ref, computed, watch, toRaw } from "vue";

const emit = defineEmits(["update", "update:modelValue", "loaded"]);
const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: "Nigeria",
  },
  except: {
    type: Array,
  },
  only: {
    type: Array,
  },
  defaultList: {
    type: Array,
    default: () => [],
  },
  mapOptions: {
    type: Boolean,
  },
  emitValue: {
    type: Boolean,
  },
  parentData: {
    type: Object,
  },
  optionLabel: {
    type: String,
    default: "name",
  },
  optionValue: {
    type: String,
    default: "iso2",
  },
  type: {
    type: String,
    default: "countries",
  },
  options: {
    type: Array,
    default: () => [],
  },
  id: {
    type: String,
    default: "country",
  },
  label: {
    type: String,
    default: "Choose Country",
  },
});
const alova = createAlova({
  statesHook: VueHook,
  requestAdapter: GlobalFetch(),
  responded: (response) => response.json(),
  localCache: true,
});

const select = ref(null),
  gurl = "https://api.countrystatecity.in/v1/countries",
  apiKey = "NnQ4cFhHVEhrZGREQ0w3OFJWUG1IV09PUDVrMWxZYloyM3F2UUd0eQ==",
  model = ref(props.modelValue),
  loaded = ref(false),
  selectedData = ref({}),
  localeTypes = {
    countries: "country",
    states: "state",
    cities: "city",
  },
  parentMap = {
    states: "country",
    cities: "state",
  },
  currentType = computed(() => localeTypes[props.type]),
  parent = computed(() => parentMap[props.type]),
  params = ref("");

const {
  data: locales,
  send: requestLocales,
  loading,
  onSuccess,
} = useRequest(
  (prms) =>
    alova.Get(gurl + (prms || params.value), {
      headers: { "X-CSCAPI-KEY": apiKey },
      localCache: {
        mode: "restore",
        expire: 60 * 10 * 1000,
      },
      transformData: (data) => {
        const ov = props.optionValue;
        if (props.except?.length) {
          data = data.filter((e) => !props.only.includes(e[ov]));
        } else if (props.only?.length) {
          data = data.filter((e) => !!props.only.includes(e[ov]));
        }
        return data;
      },
    }),
  { immediate: false, initialData: props.defaultList },
);

onSuccess(({ data }) => {
  // If the current model is not set, set it to the first item in the list
  if (!exists(model.value, data)) {
    model.value = data[0];
  }

  if (!loaded.value) {
    loaded.value = true;
    update(model.value);
    emit("loaded", locales.value);
  }
});

const loadLocale = () => {
  // If params.value contains undefined, it means the parent is not selected.
  if (
    ["undefined", null, ""].includes(params.value) &&
    props.type !== "countries"
  )
    return;
  requestLocales();
};

const update = (data) => {
  const ov = props.optionValue;
  let value = data?.[ov] || data;
  if (typeof value === "string" && value.length > 2) {
    value = locales.value.find((e) => e[ov] === value);
  }

  selectedData.value[currentType.value] = value;

  emit("update", selectedData.value);
  emit("update:modelValue", data);
};

const setParams = (data) => {
  if (!data) return;
  let country = data.country.iso2 || data.country;
  if (props.type === "states") {
    if (!data.country) {
      params.value = null;
      return;
    }
    params.value = `/${country}/states`;
  } else if (props.type === "cities") {
    let state = data.state.iso2 || data.state;
    if (typeof state !== "string" || typeof country !== "string") {
      params.value = null;
      return;
    }
    params.value = `/${country}/states/${state}/cities`;
  }
};

if (props.options.length) {
  locales.value = props.options;
  emit("update:modelValue", props.modelValue);
  emit("update", selectedData.value);
} else {
  loadLocale();
}

const exists = (value, e) => {
  // Check if the current model is in the list of locales
  const val = toRaw(value);
  const ov = props.optionValue;
  delete val?.emoji;
  if (typeof e.find !== "function") return false;
  return !!e.find(
    (i) =>
      i == val || (i[ov] && val?.[ov] && i[ov] == val?.[ov]) || i[ov] == val,
  );
};
watch(params, (e) => loadLocale(e));
watch(
  () => props.modelValue,
  (e) => (model.value = e),
);

watch(
  () => props.parentData,
  (data, old) => {
    if (!loaded.value || !is.deepEqual(data, old)) {
      setParams(data);
    }
  },
  { immediate: props.type !== "countries" },
);
</script>

<style lang="scss">
@import url("src/css/custom/freakflags.css");
</style>
