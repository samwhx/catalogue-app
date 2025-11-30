<script setup lang="ts">
import { useLocationStore } from "~/stores/locationStore";
import { ref, watch } from "vue";
import BaseModal from "~/components/BaseModal.vue";
import BaseButton from "~/components/BaseButton.vue";

const locationStore = useLocationStore();
const searchQuery = ref("");
let debounceTimer: NodeJS.Timeout;

const handleInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    locationStore.searchLocation(searchQuery.value);
  }, 500);
};

watch(() => locationStore.isModalOpen, (isOpen) => {
  if (isOpen) {
    searchQuery.value = "";
    setTimeout(() => {
      if (locationStore.fulfillmentType === 'delivery') {
        const input = document.querySelector('input[name="location-search"]') as HTMLInputElement;
        if (input) input.focus();
      }
    }, 100);
  }
});
</script>

<template>
  <BaseModal
    :is-open="locationStore.isModalOpen"
    max-width="max-w-lg"
    align-top
    @close="locationStore.closeModal"
  >
    <!-- Header -->
    <div class="p-6 border-b border-gray-100 bg-brand-beige">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-black uppercase tracking-wide text-gray-900">Order Settings</h2>
        <button @click="locationStore.closeModal" class="text-gray-400 hover:text-gray-900">✕</button>
      </div>

      <!-- Tabs -->
      <div class="flex bg-white rounded-sm p-1 mb-6 shadow-sm border border-gray-200">
        <button
          @click="locationStore.setFulfillmentType('delivery')"
          class="flex-1 py-2 text-sm font-bold uppercase tracking-wide rounded-sm transition-all"
          :class="locationStore.fulfillmentType === 'delivery' ? 'bg-brand-olive text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'"
        >
          Delivery
        </button>
        <button
          @click="locationStore.setFulfillmentType('pickup')"
          class="flex-1 py-2 text-sm font-bold uppercase tracking-wide rounded-sm transition-all"
          :class="locationStore.fulfillmentType === 'pickup' ? 'bg-brand-olive text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'"
        >
          Pickup
        </button>
      </div>

      <!-- Search Input (Delivery Only) -->
      <div v-if="locationStore.fulfillmentType === 'delivery'" class="relative">
        <span class="absolute left-3 top-3 text-gray-400">🔍</span>
        <input
          v-model="searchQuery"
          name="location-search"
          @input="handleInput"
          type="text"
          placeholder="Enter Singapore postal code or address"
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-brand-olive focus:ring-1 focus:ring-brand-olive font-sans"
        />
      </div>
    </div>

    <!-- Results / Content -->
    <div class="overflow-y-auto p-2 bg-white min-h-[200px]">

      <!-- PICKUP VIEW -->
      <div v-if="locationStore.fulfillmentType === 'pickup'" class="p-6 text-center space-y-4">
        <div class="text-4xl mb-2">📍</div>
        <h3 class="font-bold text-gray-900 uppercase tracking-wide">Pickup Location</h3>
        <p class="text-brand-olive font-bold text-lg">{{ locationStore.storeLocation.name }}</p>
        <p class="text-gray-500">{{ locationStore.storeLocation.address }}</p>

        <BaseButton @click="locationStore.confirmPickup()" class="mt-4" block>
          Confirm Pickup
        </BaseButton>
      </div>

      <!-- DELIVERY VIEW -->
      <template v-else>
        <div v-if="locationStore.isSearching" class="flex justify-center py-8">
          <div class="animate-spin w-6 h-6 border-2 border-brand-olive border-t-transparent rounded-full"></div>
        </div>

        <div v-else-if="locationStore.searchError" class="text-center text-red-500 py-8 text-sm">
          {{ locationStore.searchError }}
        </div>

        <div v-else-if="locationStore.searchResults.length > 0" class="space-y-1">
          <button
            v-for="(result, index) in locationStore.searchResults"
            :key="index"
            @click="locationStore.selectLocation(result)"
            class="w-full text-left p-4 hover:bg-brand-beige rounded-sm transition-colors group"
          >
            <div class="font-bold text-gray-900 group-hover:text-brand-olive">{{ result.BUILDING !== 'NIL' ? result.BUILDING : result.BLK_NO + ' ' + result.ROAD_NAME }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ result.ADDRESS }}</div>
          </button>
        </div>

        <div v-else-if="searchQuery.length > 2" class="text-center text-gray-400 py-8 text-sm">
          No results found
        </div>

        <div v-else class="text-center text-gray-400 py-8 text-xs uppercase tracking-widest">
          Served by: {{ locationStore.storeLocation.name }}
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div class="p-4 bg-gray-50 border-t border-gray-100 text-xs text-center text-gray-400">
      Powered by OneMap
    </div>
  </BaseModal>
</template>
