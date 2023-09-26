<template>
  <q-page padding>
    <div class="flex justify-center items-center">
      <q-btn
        flat
        dense
        label="Prev"
        icon="arrow_back"
        @click="$refs.calendarRef.prev()"
      />
      <q-separator vertical class="q-ml-sm" />
      <div class="text-h6 text-uppercase q-mx-sm text-primary">
        {{ date.formatDate(selectedDate, "MMMM YYYY") }}
      </div>
      <q-separator vertical class="q-mr-sm" />
      <q-btn
        flat
        dense
        label="Next"
        icon-right="arrow_forward"
        @click="$refs.calendarRef.next()"
      />
    </div>
    <q-separator class="q-my-sm" />
    <QCalendar
      show-month-label
      show-day-of-the-year-label
      ref="calendarRef"
      class="shadow-15"
      animated
      mode="month"
      view="month"
      locale="en-us"
      :short-month-label="$q.screen.lt.sm"
      :short-weekday-label="$q.screen.lt.sm"
      :day-height="100"
      v-model="selectedDate"
      @moved="updateCalendar"
    >
      <!-- @change="loadEvents($event.start)" -->
      <template #day="{ scope: { timestamp } }">
        <template
          v-for="(event, index) in events.filter(
            (e) => e.date == timestamp.date,
          )"
        >
          <q-badge
            style="width: 100%; cursor: pointer; height: 16px; max-height: 16px"
            :key="index"
            :color="event.color"
            v-if="(index) => 0"
            @click="open(event)"
          >
            <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs" />
            <span class="ellipsis">
              {{ event.title }}
            </span>
          </q-badge>
        </template>
      </template>
    </QCalendar>
    <q-dialog v-model="readDialogToggle">
      <q-card flat class="q-ma-md" bordered style="width: 100%">
        <q-toolbar class="absolute-top" style="z-index: 1">
          <q-space />
          <q-btn v-close-popup dense color="negative" flat icon="clear" />
        </q-toolbar>
        <q-img :src="event.image_url" v-if="event.image_url" />
        <q-card-section>
          <div class="text-h6 text-grey-10">
            <q-icon :color="event.color" :name="event.icon" v-if="event.icon" />
            {{ event.title }}
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ event.details }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { usePagination } from "@alova/scene-vue";
import { QCalendar, parseDate } from "@quasar/quasar-ui-qcalendar";
import { date } from "quasar";
import { alova } from "src/boot/alova";
import { ref } from "vue";

const event = ref({});
const CURRENT_DAY = new Date();
const selectedDate = ref(getCurrentDay(CURRENT_DAY.getDate()));
const watchableDate = ref(selectedDate.value);
const readDialogToggle = ref(false);

function getCurrentDay(day) {
  const newDay = new Date(CURRENT_DAY);
  newDay.setDate(day);
  const tm = parseDate(newDay);
  return tm.date;
}

const open = (ev) => {
  event.value = ev;
  readDialogToggle.value = true;
};

const updateCalendar = ({ date }) => {
  watchableDate.value = date;
};

const { data: events } = usePagination(
  (page, limit) =>
    alova.Get(`events`, {
      params: {
        date: selectedDate.value || getCurrentDay(CURRENT_DAY.getUTCDay()),
        page,
        limit,
      },
      localCache: {
        mode: "placeholder",
        expire: 3.6e6,
      },
    }),
  {
    append: true,
    total: (data) => data.meta.total,
    initialData: {
      data: [],
      meta: { total: 0 },
    },
    initialPage: 1,
    watchingStates: [watchableDate],
    initialPageSize: 300,
  },
);
</script>
<style>
@import "@quasar/quasar-ui-qcalendar/dist/index.css";
</style>
