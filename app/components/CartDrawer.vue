<script setup lang="ts">
import { useCartStore, type CartItem } from "~/stores/cartStore";
import { useLocationStore } from "~/stores/locationStore";
import { ref, onMounted } from "vue";
import BaseButton from "~/components/BaseButton.vue";

const cartStore = useCartStore();
const locationStore = useLocationStore();
const isMounted = ref(false);
const imageErrors = ref<Record<string, boolean>>({});

onMounted(() => {
  // Small delay to ensure hydration and CSS are complete before rendering
  setTimeout(() => {
    isMounted.value = true;
    // Ensure cart starts closed
    if (cartStore.isOpen) {
      cartStore.closeCart();
    }
  }, 500);
});

const handleImageError = (itemId: string) => {
  imageErrors.value[itemId] = true;
};

const calculateItemTotal = (cartItem: CartItem) => {
  let price = parseFloat(cartItem.item.price || "0");
  cartItem.selectedOptions.forEach((opt) => {
    if (opt.price) price += parseFloat(opt.price);
  });
  return (price * cartItem.quantity).toFixed(2);
};

const handleCheckout = () => {
  // 1. Check Location (if delivery)
  if (locationStore.fulfillmentType === 'delivery' && !locationStore.selectedLocation) {
    cartStore.closeCart();
    locationStore.openModal();
    return;
  }

  // 2. Check Date/Time
  if (!locationStore.selectedDateTime) {
    cartStore.closeCart();
    locationStore.openDateTimeModal();
    return;
  }

  // 3. Proceed (Mock)
  alert("Proceeding to checkout...");
};
</script>

<template>
  <Teleport to="body">
    <div v-if="isMounted" class="z-50">
      <!-- Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-linear"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-linear"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="cartStore.isOpen"
        class="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        @click="cartStore.closeCart"
      ></div>
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transform transition ease-in-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition ease-in-out duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="cartStore.isOpen"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-brand-beige z-50 shadow-2xl flex flex-col"
      >
        <!-- Header -->
        <div class="p-6 bg-brand-olive text-white shadow-md shrink-0">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-black uppercase tracking-wide flex items-center gap-2">
              <span>Your Cart</span>
              <span v-if="cartStore.totalItems > 0" class="bg-white text-brand-olive text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {{ cartStore.totalItems }}
              </span>
            </h2>
            <button @click="cartStore.closeCart" class="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 bg-brand-beige flex flex-col">
          <div v-if="cartStore.isEmpty" class="flex flex-col items-center justify-center flex-1 w-full text-center text-gray-500 py-12">
            <div class="text-6xl mb-4 opacity-50">🛒</div>
            <p class="text-xl font-bold text-gray-900 mb-2">Your cart is empty</p>
            <p class="text-sm">Looks like you haven't added anything yet.</p>
            <button @click="cartStore.closeCart" class="mt-8 text-brand-olive font-bold hover:underline uppercase tracking-wide text-sm">
              Browse Menu
            </button>
          </div>

          <div v-else class="space-y-4">
            <div v-for="cartItem in cartStore.items" :key="cartItem.id" class="bg-white p-4 rounded-sm shadow-sm border border-gray-100 group relative">
              <div class="flex gap-4">
                <!-- Image/Icon -->
                <div class="w-16 h-16 bg-brand-peach flex items-center justify-center text-2xl rounded-sm shrink-0 relative overflow-hidden">
                  <!-- Placeholder (Always visible behind image) -->
                  <div class="flex items-center justify-center w-full h-full bg-brand-peach absolute inset-0 z-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-brand-olive opacity-50" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                    </svg>
                  </div>

                  <!-- Image (Overlay) -->
                  <img
                    v-if="cartItem.item.image_url"
                    v-show="!imageErrors[cartItem.item.id]"
                    :src="cartItem.item.image_url"
                    @error="handleImageError(cartItem.item.id)"
                    class="w-full h-full object-cover rounded-sm absolute inset-0 z-10 transition-opacity duration-300"
                  />
                </div>

                <!-- Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-1">
                    <h3 class="font-black text-gray-900 uppercase tracking-wide text-sm truncate pr-2">{{ cartItem.item.name }}</h3>
                    <p class="font-bold text-brand-olive shrink-0">SGD {{ calculateItemTotal(cartItem) }}</p>
                  </div>

                  <!-- Options -->
                  <div v-if="cartItem.selectedOptions.length > 0" class="mb-2">
                    <p class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Options:</p>
                    <ul class="text-xs text-gray-700 list-disc pl-4">
                      <li v-for="opt in cartItem.selectedOptions" :key="opt.id">
                        {{ opt.name }}
                        <span v-if="opt.price && parseFloat(opt.price) > 0" class="text-gray-400">(+${{ parseFloat(opt.price).toFixed(2) }})</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Special Instructions -->
                  <div v-if="cartItem.specialInstructions" class="mb-3 bg-yellow-50 p-2 rounded-sm border border-yellow-100">
                    <p class="text-[10px] text-yellow-700 uppercase font-bold tracking-wider mb-0.5">Note:</p>
                    <p class="text-xs text-gray-700 italic">"{{ cartItem.specialInstructions }}"</p>
                  </div>

                  <!-- Controls -->
                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <!-- Quantity -->
                    <div class="flex items-center border border-gray-300 rounded-sm h-8 bg-white">
                      <button @click="cartStore.updateQuantity(cartItem.id, -1)" class="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">-</button>
                      <span class="w-8 text-center font-bold text-sm">{{ cartItem.quantity }}</span>
                      <button @click="cartStore.updateQuantity(cartItem.id, 1)" class="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">+</button>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-3">
                      <button
                        @click="cartStore.openEditModal(cartItem.id)"
                        class="text-xs font-bold text-gray-500 hover:text-brand-olive uppercase tracking-wider transition-colors flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        @click="cartStore.removeItem(cartItem.id)"
                        class="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-wider transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!cartStore.isEmpty" class="p-6 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-10">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm font-bold uppercase tracking-wider text-gray-500">Subtotal</span>
            <span class="font-black text-2xl text-gray-900">SGD {{ cartStore.totalPrice }}</span>
          </div>
          <p class="text-xs text-gray-400 mb-4 text-center">Shipping & taxes calculated at checkout</p>
          <BaseButton size="lg" block class="text-lg shadow-lg" @click="handleCheckout">
            Checkout
          </BaseButton>
        </div>
      </div>
    </Transition>
    </div>
  </Teleport>
</template>
