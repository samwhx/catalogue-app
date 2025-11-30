<script setup lang="ts">
interface Props {
  message?: string;
}

withDefaults(defineProps<Props>(), {
  message: "No items available",
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="w-16 h-px bg-gray-300 mb-6"></div>
    <p class="text-gray-500 italic font-serif text-lg">{{ message }}</p>
    <div class="w-16 h-px bg-gray-300 mt-6"></div>
  </div>
</template>
