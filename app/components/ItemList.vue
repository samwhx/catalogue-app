<script setup lang="ts">
import type { Item } from "~/types/catalogue";
import CatalogItem from "./CatalogItem.vue";

interface Props {
  items: Item[];
}

defineProps<Props>();
</script>

<template>
  <div
    v-if="items && items.length > 0"
    class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
  >
    <CatalogItem v-for="item in items" :key="item.id" :item="item" />
  </div>
</template>
