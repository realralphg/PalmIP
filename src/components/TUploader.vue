<template>
  <div
    class="t-uploader"
    :class="{ refit }"
    :style="`--preview-height: ${prevHeight}; --uploader-width: ${uploaderWidth}`"
  >
    <q-uploader
      flat
      square
      bordered
      hide-upload-btn
      color="primary"
      :label="label"
      :accept="accept"
      :max-files="maxFiles"
      :no-thumbnails="hidePreview"
      :max-file-size="maxFileSize"
      @added="readFiles"
      @removed="removed"
      @rejected="rejected"
    />
    <div
      class="preview-img q-pa-sm"
      v-if="(prev || prevDefault) && !file && !hidePreview"
    >
      <q-video v-if="video" :src="prev || prevDefault" spinner-color="white" />
      <q-img v-else :src="prev || prevDefault" spinner-color="white" />
    </div>
    <small class="text-green" v-if="showLimit">
      {{ helpers.formatBytes(maxFileSize) }} max file size allowed.
    </small>
    <div class="q-py-xs" v-if="progress > 0">
      <q-linear-progress
        :value="progressValue"
        size="sm"
        :color="progressColor"
      />
    </div>
  </div>
</template>

<script setup>
import helpers from "src/plugins/helpers";

import { computed, onMounted, ref, toRaw } from "vue";

const emit = defineEmits(["update:modelValue", "added", "rejected", "removed"]);

const props = defineProps({
  modelValue: {
    type: Object,
  },
  preview: {
    type: String,
  },
  refit: {
    type: Boolean,
  },
  video: {
    type: Boolean,
  },
  hidePreview: {
    type: Boolean,
  },
  showLimit: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "Choose an image",
  },
  progressColor: {
    type: String,
    default: "primary",
  },
  accept: {
    type: String,
  },
  maxFiles: {
    type: Number,
    default: 1,
  },
  maxFileSize: {
    type: [Number, String],
    default: 1048576,
  },
  previewHeight: {
    type: [String, Number],
    default: 200,
  },
  width: {
    type: [String, Number],
    default: 320,
  },
  progress: {
    type: Number,
    default: 0,
  },
});

const file = ref(props.modelValue);
const prev = ref(props.preview);
const prevDefault = toRaw(props.preview);
const progressValue = computed(() =>
  props.progress > 1 ? props.progress / 100 : props.progress,
);
const uploaderWidth = !isNaN(props.width) ? props.width + "px" : props.width;
const prevHeight = !isNaN(props.previewHeight)
  ? props.previewHeight + "px"
  : props.previewHeight;

const readFiles = (e) => {
  file.value = e[0];
  emit("update:modelValue", file.value);
  emit("added", e);
};

const removed = (e) => {
  file.value = null;
  emit("update:modelValue", file.value);
  emit("removed", e);
  if (!prev.value?.includes("http")) {
    prev.value = null;
  }
};

const rejected = (e) => {
  const max = props.maxFileSize;
  const eKey = e[0]?.failedPropValidation ?? "max-file-size";
  const errors = {
    "max-file-size": `File size is too big, max size is ${helpers.formatBytes(
      max,
    )}`,
    "unsupported-file-type": `File type is not supported, supported types are ${props.accept}`,
  };

  helpers.notify(errors[eKey], "error");
  emit("rejected", errors[eKey], e);
};

onMounted(() => {
  const hEl = document.querySelector(".q-uploader__header");
  const filler = document.createElement("div");
  filler.classList.add("filler");
  hEl?.insertAdjacentElement("afterbegin", filler);
});
</script>
<style lang="scss">
.t-uploader {
  --preview-height: 200px;
  --uploader-width: 320px;
  .q-uploader {
    width: var(--uploader-width);
  }

  .q-uploader__list {
    padding: 0;
    min-height: 0;
  }
  .q-uploader__subtitle {
    display: none;
  }
  .q-uploader__file--img {
    margin: 8px;
    min-width: inherit;
  }
  .preview-img {
    width: var(--uploader-width);
    border-radius: 0;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-top: none;
  }

  .filler {
    background: var(--q-primary);
    width: 100%;
    height: 10px;
    position: absolute;
    bottom: 0;
    z-index: 1;
  }
  &.refit {
    &,
    .q-uploader {
      overflow: hidden;
    }
    .q-uploader__header-content {
      .q-btn {
        width: 100%;
        height: var(--preview-height);
        border: dashed;
        .q-icon {
          display: none;
        }
      }
      div:first-child.no-wrap {
        flex-wrap: wrap;
        z-index: 1;
        border: 5px solid #2f4858;
        div:not(.q-uploader__title) {
          position: absolute;
        }
      }
    }
    .q-uploader__list {
      height: 100%;
      margin: 5px;
      position: absolute;
      left: 0;
      right: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      .q-uploader__file {
        position: absolute;
        top: 0;
        .q-uploader__file-header-content {
          color: rgba(158, 158, 158, 0.5);
        }
      }
    }
  }
}
</style>
