<script setup lang="ts">
import type { Item } from "~/types/catalogue";
import OptionList from "./OptionList.vue";
import { useCartStore } from "~/stores/cartStore";
import { computed, ref, watch } from "vue";

interface Props {
  item: Item;
}

const props = defineProps<Props>();
const cartStore = useCartStore();
const imageError = ref(false);

// Reset error state if item changes
watch(() => props.item.image_url, () => {
  imageError.value = false;
});

const formattedPrice = computed(() => {
  if (!props.item.price) return "";
  const val = parseFloat(props.item.price);
  return `$${val.toFixed(2)}`;
});

const cartCount = computed(() => {
  return cartStore.getItemCountInCart(props.item.id);
});

const openModal = () => {
  cartStore.openProductModal(props.item, imageError.value);
};

const handleImageError = () => {
  imageError.value = true;
};
</script>

<template>
  <div class="bg-white rounded-sm shadow-md overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all duration-300 relative">
    <!-- Cart Indicator Badge -->
    <div v-if="cartCount > 0" class="absolute top-3 right-3 z-10 bg-brand-olive text-white text-xs font-bold px-2 py-1 rounded-full shadow-md pointer-events-none">
      {{ cartCount }} in cart
    </div>

    <!-- Image Area (Clickable) -->
    <div
      @click="openModal"
      class="aspect-[4/3] bg-brand-peach w-full flex items-center justify-center relative overflow-hidden cursor-pointer"
    >
      <img
        v-if="item.image_url && !imageError"
        :src="item.image_url"
        :alt="item.name"
        @error="handleImageError"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <!-- Universal Placeholder (SVG) -->
      <div v-else class="flex flex-col items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity p-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-brand-olive" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
        </svg>
        <span class="text-brand-olive font-black uppercase tracking-widest mt-2 text-xs opacity-60">No Image</span>
      </div>
    </div>

    <div class="p-6 flex flex-col flex-grow bg-white">
      <h3
        @click="openModal"
        class="text-lg font-black text-gray-900 uppercase tracking-wide mb-3 leading-tight font-sans cursor-pointer hover:text-brand-olive transition-colors"
      >
        {{ item.name }}
      </h3>

      <p v-if="item.description" class="text-gray-900 text-sm font-medium leading-relaxed mb-6 flex-grow">
        {{ item.description }}
      </p>

      <OptionList v-if="item.options && item.options.length > 0" :options="item.options" />

      <div class="mt-auto pt-2 flex items-center justify-between">
        <div v-if="item.price" class="text-lg font-bold text-gray-900">
          {{ formattedPrice }}
        </div>

        <button
          @click="openModal"
          class="bg-brand-olive hover:bg-opacity-90 text-white text-sm font-bold uppercase tracking-wide px-8 py-3 rounded-sm transition-colors shadow-sm"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>
