<template>
  <div class="min-h-screen bg-brand-beige">
    <ClientOnly>
      <CartDrawer />
      <LocationModal />
      <DateTimeModal />
      <AuthModal />
      <ProductModal />
      <ScrollToTop />
    </ClientOnly>

    <div v-if="isLoading || (!catalog && !error)">
      <SkeletonLoader />
    </div>

    <div v-else-if="catalog">
      <div v-if="error" class="bg-red-500 text-white text-center text-xs font-bold py-1 px-4 sticky top-[120px] z-40 shadow-md">
        You are offline. Showing cached menu.
      </div>
      <CatalogDisplay :catalog="catalog" />
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center max-w-md">
        <p class="text-red-600 mb-6">Unable to load menu. Please try again.</p>
        <button
          @click="handleRetry"
          class="px-6 py-3 bg-gray-900 text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
    <div v-else class="flex items-center justify-center min-h-screen text-gray-400 italic">
      Menu unavailable
    </div>
  </div>
</template>

<script setup lang="ts">
import CatalogDisplay from "~/components/CatalogDisplay.vue";
import CartDrawer from "~/components/CartDrawer.vue";
import LocationModal from "~/components/LocationModal.vue";
import DateTimeModal from "~/components/DateTimeModal.vue";
import AuthModal from "~/components/AuthModal.vue";
import ProductModal from "~/components/ProductModal.vue";
import ScrollToTop from "~/components/ScrollToTop.vue";
import SkeletonLoader from "~/components/SkeletonLoader.vue";

const catalogStore = useCatalogStore();
const config = useRuntimeConfig();

const defaultCatalog = config.public.defaultCatalog || "atlas-kitchen-2024";

onMounted(async () => {
  try {
    await catalogStore.fetchCatalog(defaultCatalog);
  } catch (error) {
    console.error("Error fetching catalog:", error);
  }
});

const catalog = computed(() => catalogStore.currentCatalog);
const isLoading = computed(() => catalogStore.isCatalogLoading);
const error = computed(() => catalogStore.getCatalogError);

const errorMessage = computed(() => {
  if (!error.value) return "";
  return error.value instanceof Error ? error.value.message : String(error.value);
});

const handleRetry = () => {
  catalogStore.fetchCatalog(defaultCatalog, true);
};
</script>
