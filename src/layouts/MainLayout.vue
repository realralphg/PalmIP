<template>
  <q-layout view="hHh LpR lfr" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GNL__toolbar">
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          class="q-mr-sm"
        />

        <q-toolbar-title
          v-if="$q.screen.gt.xs"
          shrink
          class="row items-center no-wrap"
        >
          <RouterLink :to="{ name: 'home' }">
            <img src="~/assets/logo-vertical.svg" />
          </RouterLink>
        </q-toolbar-title>

        <q-space />

        <q-input
          class="GNL__toolbar-input"
          outlined
          dense
          v-model="search"
          color="bg-grey-7 shadow-1"
          placeholder="Search for topics, locations & sources"
        >
          <template v-slot:prepend>
            <q-icon v-if="search === ''" name="search" />
            <q-icon
              v-else
              name="clear"
              class="cursor-pointer"
              @click="search = ''"
            />
          </template>
        </q-input>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn round dense flat color="grey-8" icon="notifications">
            <q-badge color="red" text-color="white" floating> 2 </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
          <q-btn round flat>
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
            <q-tooltip>Account</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      bordered
      show-if-above
      class="bg-white"
      :width="280"
      v-model="leftDrawerOpen"
    >
      <q-scroll-area class="fit">
        <div class="column justify-between absolute full-height full-width">
          <q-list padding class="text-grey-8">
            <q-item
              v-ripple
              clickable
              class="GNL__drawer-item"
              :to="link.to"
              :key="link.text"
              :active="$route.name == link.to.name"
              :class="{ 'bg-grey-3': $route.name == link.to.name }"
              v-for="link in links1"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ link.text }}</q-item-label>
              </q-item-section>
            </q-item>

            <!-- <q-separator inset class="q-my-sm" /> -->
          </q-list>
          <q-list padding class="text-grey-8">
            <div class="q-mt-md">
              <div class="flex flex-center q-gutter-xs">
                <a
                  class="GNL__drawer-footer-link"
                  href="javascript:void(0)"
                  aria-label="Privacy"
                  >Privacy</a
                >
                <span> · </span>
                <a
                  class="GNL__drawer-footer-link"
                  href="javascript:void(0)"
                  aria-label="Terms"
                  >Terms</a
                >
                <span> · </span>
                <a
                  class="GNL__drawer-footer-link"
                  href="javascript:void(0)"
                  aria-label="About"
                  >About PalmIP</a
                >
              </div>
            </div>
          </q-list>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
const leftDrawerOpen = ref(false);
const search = ref("");

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const links1 = [
  { icon: "web", text: "Dashboard", to: { name: "user.dashboard" } },
  { icon: "store", text: "Market Place", to: { name: "user.market" } },
];
</script>

<style lang="sass">
.GNL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 55%

  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      .q-icon
        color: #5f6368

    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

    &:hover
      color: #000
</style>
