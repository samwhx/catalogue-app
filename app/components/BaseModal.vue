<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  maxWidth?: string; // Tailwind class, default 'max-w-md'
  alignTop?: boolean; // If true, aligns to top (for search inputs etc)
}>();

const emit = defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="emit('close')"
      ></div>

      <!-- Wrapper -->
      <div
        class="relative h-full w-full flex px-4 pointer-events-none"
        :class="alignTop ? 'items-start pt-20 justify-center' : 'items-center justify-center'"
      >
        <!-- Modal Card -->
        <div
          class="bg-white w-full rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
          :class="maxWidth || 'max-w-md'"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
