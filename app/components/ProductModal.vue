<script setup lang="ts">
import type { Option } from "~/types/catalogue";
import { useCartStore } from "~/stores/cartStore";
import { ref, computed, watch } from "vue";

const cartStore = useCartStore();

// Local state
const quantity = ref(1);
const selectedOptions = ref<Option[]>([]);
const specialInstructions = ref("");
const imageError = ref(false);

// Sync with store state when modal opens
watch(() => cartStore.isProductModalOpen, (isOpen) => {
  if (isOpen) {
    quantity.value = cartStore.initialQuantity;
    selectedOptions.value = [...cartStore.initialOptions];
    specialInstructions.value = cartStore.initialInstructions;
    imageError.value = cartStore.activeItemImageBroken;
  }
});

const item = computed(() => cartStore.activeItem);

const formattedPrice = computed(() => {
  if (!item.value?.price) return "0.00";
  let total = parseFloat(item.value.price);

  selectedOptions.value.forEach(opt => {
    if (opt.price) total += parseFloat(opt.price);
  });

  return (total * quantity.value).toFixed(2);
});

const isSelectionRequired = computed(() => {
  return item.value && item.value.options && item.value.options.length > 0;
});

const isAddDisabled = computed(() => {
  if (isSelectionRequired.value) {
    return selectedOptions.value.length === 0;
  }
  return false;
});

const handleOptionToggle = (option: Option) => {
  const index = selectedOptions.value.findIndex(o => o.id === option.id);
  if (index === -1) {
    selectedOptions.value = [option];
  } else {
    selectedOptions.value = [];
  }
};

const handleAddToCart = () => {
  if (!item.value || isAddDisabled.value) return;
  cartStore.addToCart(item.value, selectedOptions.value, specialInstructions.value, quantity.value);
};

const handleImageError = () => {
  imageError.value = true;
};
</script>

<template>
  <div v-if="cartStore.isProductModalOpen && item" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cartStore.closeProductModal"></div>

    <!-- Modal -->
    <div class="relative w-full max-w-4xl bg-brand-cream rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
      <!-- Close Button -->
      <button @click="cartStore.closeProductModal" class="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-900 bg-white/80 rounded-full md:bg-transparent transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Image Side (Left/Top) -->
      <div class="w-full md:w-1/2 bg-brand-peach flex items-center justify-center p-8 md:p-12 shrink-0 relative overflow-hidden">
        <img
          v-if="item.image_url && !imageError"
          :src="item.image_url"
          :alt="item.name"
          @error="handleImageError"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <!-- Universal Placeholder (SVG) -->
        <div v-else class="flex flex-col items-center justify-center opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-40 w-40 text-brand-olive" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
          </svg>
        </div>
      </div>

      <!-- Content Side (Right/Bottom) -->
      <div class="w-full md:w-1/2 flex flex-col bg-white flex-1 min-h-0">
        <div class="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          <!-- Header -->
          <div>
            <h2 class="text-2xl md:text-3xl font-black uppercase tracking-wide text-gray-900 mb-3 leading-tight">{{ item.name }}</h2>
            <p class="text-gray-600 leading-relaxed text-sm">{{ item.description }}</p>
          </div>

          <!-- Options Section -->
          <div v-if="item.options && item.options.length > 0" class="space-y-4">
            <div class="flex justify-between items-baseline border-b border-gray-100 pb-2">
              <h3 class="text-sm font-bold uppercase tracking-wider text-gray-900">Choice of Option <span class="text-red-500 ml-1">*</span></h3>
              <span
                class="text-xs font-bold px-2 py-1 rounded-full transition-colors"
                :class="selectedOptions.length > 0 ? 'bg-brand-olive text-white' : 'bg-red-100 text-red-500'"
              >
                {{ selectedOptions.length > 0 ? 'Completed' : 'Required' }}
              </span>
            </div>

            <div class="space-y-3">
              <div
                v-for="opt in item.options"
                :key="opt.id"
                @click="handleOptionToggle(opt)"
                class="group flex justify-between items-center p-4 rounded-sm border cursor-pointer transition-all duration-200"
                :class="selectedOptions.find(o => o.id === opt.id) ? 'border-brand-olive bg-brand-beige shadow-sm ring-1 ring-brand-olive' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
              >
                <div class="flex items-center gap-3">
                  <!-- Radio Circle -->
                  <div
                    class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                    :class="selectedOptions.find(o => o.id === opt.id) ? 'border-brand-olive bg-brand-olive' : 'border-gray-300 bg-white group-hover:border-gray-400'"
                  >
                    <div v-if="selectedOptions.find(o => o.id === opt.id)" class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="font-bold text-gray-900 text-sm">{{ opt.name }}</span>
                </div>

                <span v-if="opt.price && parseFloat(opt.price) > 0" class="text-sm font-medium text-gray-500 group-hover:text-gray-900">
                  + SGD {{ parseFloat(opt.price).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Special Instructions -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-gray-900">Special Instructions</h3>
            <textarea
              v-model="specialInstructions"
              rows="3"
              class="w-full text-sm p-3 border border-gray-300 rounded-sm focus:outline-none focus:border-brand-olive bg-white resize-none"
              placeholder="Let us know of any special requests..."
            ></textarea>
          </div>
        </div>

        <!-- Footer / Action -->
        <div class="p-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-4 items-center sticky bottom-0 z-20">
          <!-- Quantity -->
          <div class="flex items-center border border-gray-300 rounded-sm h-12 bg-white overflow-hidden w-full sm:w-auto justify-between sm:justify-start">
            <button
              @click="quantity = Math.max(1, quantity - 1)"
              class="w-16 sm:w-12 h-full flex items-center justify-center text-gray-500 hover:text-brand-olive hover:bg-gray-50 font-medium text-xl transition-colors border-r border-gray-100 sm:border-none"
            >−</button>
            <span class="w-10 text-center font-bold text-gray-900 text-lg">{{ quantity }}</span>
            <button
              @click="quantity++"
              class="w-16 sm:w-12 h-full flex items-center justify-center text-gray-500 hover:text-brand-olive hover:bg-gray-50 font-medium text-xl transition-colors border-l border-gray-100 sm:border-none"
            >+</button>
          </div>

          <!-- Add Button -->
          <button
            @click="handleAddToCart"
            :disabled="isAddDisabled"
            class="w-full sm:flex-1 h-12 font-bold uppercase tracking-widest rounded-sm transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            :class="isAddDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand-olive text-white hover:bg-opacity-90'"
          >
            <span>{{ cartStore.editingCartId ? 'Update' : 'Add' }}</span>
            <span class="opacity-50">|</span>
            <span>SGD {{ formattedPrice }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
