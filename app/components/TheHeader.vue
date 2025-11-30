<script setup lang="ts">
import { useCartStore } from "~/stores/cartStore";
import { useLocationStore } from "~/stores/locationStore";
import { useAuthStore } from "~/stores/authStore";

const cartStore = useCartStore();
const locationStore = useLocationStore();
const authStore = useAuthStore();
</script>

<template>
  <header class="bg-brand-olive text-brand-beige shadow-md sticky top-0 z-30">
    <!-- Top Row: Logo & Actions -->
    <div class="max-w-7xl mx-auto flex justify-between items-center p-4 h-16">
      <!-- Logo (Left) -->
      <div class="flex flex-col leading-none cursor-pointer flex-shrink-0 mr-4">
        <span class="font-black text-xl md:text-2xl tracking-widest uppercase text-brand-beige">ATLAS</span>
        <span class="text-[0.5rem] md:text-[0.6rem] font-bold tracking-[0.2em] uppercase text-brand-beige/80">GASTRO BAR</span>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-3 md:gap-6 justify-end flex-1 min-w-0">

        <!-- Location & Time (Desktop Only) -->
        <div class="hidden lg:flex items-center gap-6 text-xs font-medium tracking-wide uppercase opacity-90 flex-shrink min-w-0">
          <button
            @click="locationStore.openModal"
            class="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group whitespace-nowrap bg-transparent border-none p-0 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-beige/70 group-hover:text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="truncate max-w-[350px] lg:max-w-[450px]">{{ locationStore.displayAddress }}</span>
          </button>

          <div class="h-4 w-px bg-white/20"></div>

          <button
            @click="locationStore.openDateTimeModal"
            class="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group whitespace-nowrap bg-transparent border-none p-0 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-beige/70 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ locationStore.displayDateTime }}</span>
          </button>
        </div>

        <!-- Cart Button -->
        <button
          @click="cartStore.toggleCart"
          class="bg-[#6B6B4F] hover:bg-[#7A7A5C] text-brand-beige text-xs font-bold py-2 px-3 md:px-4 rounded-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap ml-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>${{ cartStore.totalPrice }}</span>
          <span v-if="cartStore.totalItems > 0" class="bg-white text-brand-olive text-[10px] rounded-full w-4 h-4 flex items-center justify-center -mr-1">
            {{ cartStore.totalItems }}
          </span>
        </button>

        <!-- Profile Icon -->
        <button
          @click="authStore.openAuthModal()"
          class="h-8 w-8 rounded-full bg-[#6B6B4F] hover:bg-[#7A7A5C] flex items-center justify-center cursor-pointer transition-colors text-brand-beige shadow-sm"
        >
          <svg v-if="authStore.isAuthenticated" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Sub-Header (Location & Time) -->
    <div class="lg:hidden border-t border-white/10 bg-[#5A5A40] p-2">
      <div class="flex items-center justify-between max-w-7xl mx-auto text-[10px] font-bold uppercase tracking-wide text-brand-beige/90">
        <!-- Location -->
        <button
          @click="locationStore.openModal"
          class="flex items-center gap-1.5 truncate flex-1 pr-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="truncate">{{ locationStore.displayAddress }}</span>
        </button>

        <div class="h-3 w-px bg-white/20 mx-2 shrink-0"></div>

        <!-- Time -->
        <button
          @click="locationStore.openDateTimeModal"
          class="flex items-center gap-1.5 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ locationStore.displayDateTime }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
