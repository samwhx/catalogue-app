<script setup lang="ts">
import { useLocationStore } from "~/stores/locationStore";
import { ref, computed, watch } from "vue";
import BaseModal from "~/components/BaseModal.vue";
import BaseButton from "~/components/BaseButton.vue";

const locationStore = useLocationStore();

// Generate next 7 days
const dates = computed(() => {
  const list = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    list.push(date);
  }
  return list;
});

const selectedDate = ref<Date>(dates.value[0]);
// Default time, will be validated against available times
const selectedTime = ref<string>("");

const isSameDay = (d1: Date, d2: Date) => {
  return d1.toDateString() === d2.toDateString();
};

// Generate available times based on selected date
const availableTimes = computed(() => {
  const list: string[] = [];
  const now = new Date();
  const isToday = isSameDay(selectedDate.value, now);

  // 10am - 9pm
  for (let hour = 10; hour <= 21; hour++) {
    for (const min of ['00', '30']) {
      // Skip 21:30 if we want to close at 21:00
      if (hour === 21 && min === '30') continue;

      const timeStr = `${hour}:${min}`;

      if (isToday) {
        const slotTime = new Date(now);
        slotTime.setHours(hour, parseInt(min), 0, 0);

        // Add 30 min buffer for prep time
        const bufferTime = new Date(now.getTime() + 30 * 60000);

        if (slotTime > bufferTime) {
           list.push(timeStr);
        }
      } else {
        list.push(timeStr);
      }
    }
  }
  return list;
});

// Auto-select first available time if current selection is invalid
watch([selectedDate, availableTimes], () => {
  if (!availableTimes.value.includes(selectedTime.value)) {
    selectedTime.value = availableTimes.value.length > 0 ? availableTimes.value[0] : "";
  }
}, { immediate: true });

const confirmSelection = () => {
  if (!selectedTime.value) return;

  const [hours, minutes] = selectedTime.value.split(':');
  const finalDate = new Date(selectedDate.value);
  finalDate.setHours(parseInt(hours), parseInt(minutes));

  locationStore.selectDateTime(finalDate);
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
};
</script>

<template>
  <BaseModal
    :is-open="locationStore.isDateTimeModalOpen"
    @close="locationStore.closeDateTimeModal"
  >
    <div class="p-6 border-b border-gray-100 bg-brand-beige shrink-0">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-black uppercase tracking-wide text-gray-900">Select Time</h2>
        <button @click="locationStore.closeDateTimeModal" class="text-gray-400 hover:text-gray-900 p-2">✕</button>
      </div>

      <div class="mt-2 text-xs text-gray-500 flex items-center gap-2" v-if="locationStore.distanceFromStore && locationStore.fulfillmentType === 'delivery'">
        <span>📍 Distance from Atlas Booth:</span>
        <span class="font-bold text-brand-olive">{{ locationStore.distanceFromStore }} km</span>
      </div>
    </div>

    <div class="p-6 space-y-6 overflow-y-auto flex-1">
      <!-- Date Selection -->
      <div>
        <label class="block text-xs font-bold uppercase text-gray-500 mb-2">Date</label>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="date in dates"
            :key="date.toISOString()"
            @click="selectedDate = date"
            class="flex-shrink-0 px-4 py-3 rounded-sm border text-sm font-medium transition-all text-center min-w-[80px]"
            :class="isSameDay(selectedDate, date) ? 'border-brand-olive bg-brand-olive text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-brand-olive hover:text-brand-olive'"
          >
            <div class="text-xs opacity-80 uppercase">{{ date.toLocaleDateString('en-US', { weekday: 'short' }) }}</div>
            <div class="font-bold text-lg">{{ date.getDate() }}</div>
          </button>
        </div>
      </div>

      <!-- Time Selection -->
      <div>
        <label class="block text-xs font-bold uppercase text-gray-500 mb-2">Time</label>

        <div v-if="availableTimes.length === 0" class="text-center py-8 text-gray-400 italic text-sm border border-dashed border-gray-200 rounded-sm">
          No available slots for this date.
        </div>

        <div v-else class="grid grid-cols-4 gap-2">
          <button
            v-for="time in availableTimes"
            :key="time"
            @click="selectedTime = time"
            class="px-2 py-2 rounded-sm border text-sm font-medium transition-all"
            :class="selectedTime === time ? 'border-brand-olive bg-brand-olive text-white hover:bg-brand-olive' : 'border-gray-200 text-gray-600 hover:border-brand-olive hover:bg-gray-50'"
          >
            {{ time }}
          </button>
        </div>
      </div>
    </div>

    <div class="p-6 border-t border-gray-100 bg-white shrink-0">
      <BaseButton
        @click="confirmSelection"
        :disabled="!selectedTime"
        block
      >
        Confirm {{ locationStore.fulfillmentType === 'pickup' ? 'Pickup' : 'Delivery' }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
