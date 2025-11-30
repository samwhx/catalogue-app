import { defineStore } from "pinia";
import { useCartStore } from "./cartStore";

interface OneMapResult {
  SEARCHVAL: string;
  BLK_NO: string;
  ROAD_NAME: string;
  BUILDING: string;
  ADDRESS: string;
  POSTAL: string;
  X: string;
  Y: string;
  LATITUDE: string;
  LONGITUDE: string;
}

// Singapore Expo Coordinates
const STORE_LAT = 1.3406;
const STORE_LNG = 103.9632;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(1);
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const useLocationStore = defineStore("location", {
  state: () => ({
    selectedLocation: null as OneMapResult | null,
    fulfillmentType: 'delivery' as 'delivery' | 'pickup',
    selectedDateTime: null as Date | null,

    isModalOpen: false,
    isDateTimeModalOpen: false,

    searchResults: [] as OneMapResult[],
    isSearching: false,
    searchError: null as string | null,

    storeLocation: {
      name: "Atlas Booth, FHA HoReCa, Singapore Expo",
      address: "1 Expo Dr, Singapore 486150",
      lat: STORE_LAT,
      lng: STORE_LNG
    }
  }),

  getters: {
    displayAddress: (state) => {
      if (state.fulfillmentType === 'pickup') {
        return "Pickup at Atlas Booth";
      }
      if (!state.selectedLocation) return "Select a delivery/pickup location";
      return state.selectedLocation.ADDRESS;
    },

    displayDateTime: (state) => {
      if (!state.selectedDateTime) return "Select date and time";
      return state.selectedDateTime.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    },

    distanceFromStore: (state) => {
      if (!state.selectedLocation) return null;
      return calculateDistance(
        parseFloat(state.selectedLocation.LATITUDE),
        parseFloat(state.selectedLocation.LONGITUDE),
        STORE_LAT,
        STORE_LNG
      );
    }
  },

  actions: {
    openModal() {
      this.isModalOpen = true;
    },

    closeModal() {
      this.isModalOpen = false;
      this.searchResults = [];
      this.searchError = null;
    },

    openDateTimeModal() {
      this.isDateTimeModalOpen = true;
    },

    closeDateTimeModal() {
      this.isDateTimeModalOpen = false;
    },

    setFulfillmentType(type: 'delivery' | 'pickup') {
      this.fulfillmentType = type;
      // Don't clear selectedLocation immediately, user might switch back tabs
    },

    confirmPickup() {
      this.fulfillmentType = 'pickup';
      this.selectedLocation = null; // Clear delivery location as we are picking up
      this.closeModal();
      // Auto open date/time picker
      setTimeout(() => {
        this.openDateTimeModal();
      }, 300);
    },

    selectLocation(location: OneMapResult) {
      this.selectedLocation = location;
      this.fulfillmentType = 'delivery'; // Explicitly set to delivery
      this.closeModal();
      // Auto open date/time picker after location selection
      setTimeout(() => {
        this.openDateTimeModal();
      }, 300);
    },

    selectDateTime(date: Date) {
      this.selectedDateTime = date;
      this.closeDateTimeModal();

      // Re-open cart if user was in checkout flow (implied by non-empty cart)
      const cartStore = useCartStore();
      if (!cartStore.isEmpty) {
        setTimeout(() => {
          cartStore.openCart();
        }, 300);
      }
    },

    async searchLocation(query: string) {
      if (!query || query.length < 3) return;

      this.isSearching = true;
      this.searchError = null;

      try {
        const response = await fetch(
          `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
        );

        if (!response.ok) throw new Error("Failed to fetch locations");

        const data = await response.json();
        this.searchResults = data.results;
      } catch (error) {
        this.searchError = "Error searching locations. Please try again.";
        console.error(error);
      } finally {
        this.isSearching = false;
      }
    }
  }
});
