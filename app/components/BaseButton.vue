<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
}>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  loading: false,
});
</script>

<template>
  <button
    :class="[
      'font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-2',
      block ? 'w-full' : '',
      // Variants
      variant === 'primary' ? 'bg-brand-olive text-white hover:bg-opacity-90 shadow-sm' : '',
      variant === 'secondary' ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm' : '',
      variant === 'outline' ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : '',
      variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm' : '',
      variant === 'text' ? 'text-gray-500 hover:text-gray-900 bg-transparent px-0 py-0' : '',

      // Sizes
      size === 'xs' ? 'px-2 py-1 text-[10px]' : '',
      size === 'sm' ? 'px-4 py-2 text-xs' : '',
      size === 'md' ? 'px-6 py-3 text-sm' : '',
      size === 'lg' ? 'px-8 py-4 text-base' : '',

      // State
      (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full shrink-0"></span>
    <slot />
  </button>
</template>
