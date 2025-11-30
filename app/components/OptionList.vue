<script setup lang="ts">
import type { Option } from "~/types/catalogue";

interface Props {
  options: Option[];
}

const props = defineProps<Props>();

const formatPrice = (option: Option) => {
  if (!option.price) return "";
  const val = parseFloat(option.price);
  if (val === 0) return "";
  return `+ ${option.currency || "SGD"} ${val.toFixed(2)}`;
};
</script>

<template>
  <div v-if="options && options.length > 0" class="mb-4 text-xs text-gray-500">
    <div
      v-for="option in options"
      :key="option.id"
      class="flex justify-between items-baseline py-0.5"
    >
      <span>+ {{ option.name }}</span>
      <span v-if="option.price && parseFloat(option.price) > 0">
        {{ formatPrice(option) }}
      </span>
    </div>
  </div>
</template>
