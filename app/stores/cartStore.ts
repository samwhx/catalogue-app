import { defineStore } from "pinia";
import type { Item, Option } from "~/types/catalogue";

export interface CartItem {
  id: string; // Unique ID for cart entry (item + options + instructions)
  item: Item;
  quantity: number;
  selectedOptions: Option[];
  specialInstructions: string;
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
    isOpen: false,

    // Product Modal State
    isProductModalOpen: false,
    activeItem: null as Item | null,
    activeItemImageBroken: false, // New state to track if image is known to be broken
    editingCartId: null as string | null, // If editing
    initialOptions: [] as Option[],
    initialInstructions: "",
    initialQuantity: 1,
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),

    totalPrice: (state) => {
      return state.items.reduce((sum, cartItem) => {
        let itemPrice = parseFloat(cartItem.item.price || "0");
        cartItem.selectedOptions.forEach(opt => {
          itemPrice += parseFloat(opt.price || "0");
        });
        return sum + (itemPrice * cartItem.quantity);
      }, 0).toFixed(2);
    },

    isEmpty: (state) => state.items.length === 0,

    getItemCountInCart: (state) => (itemId: string) => {
      return state.items
        .filter(i => i.item.id === itemId)
        .reduce((sum, i) => sum + i.quantity, 0);
    }
  },

  actions: {
    toggleCart() {
      this.isOpen = !this.isOpen;
    },

    openCart() {
      this.isOpen = true;
    },

    closeCart() {
      this.isOpen = false;
    },

    // Modal Actions
    openProductModal(item: Item, isImageBroken = false) {
      this.activeItem = item;
      this.activeItemImageBroken = isImageBroken;
      this.editingCartId = null;
      this.initialOptions = [];
      this.initialInstructions = "";
      this.initialQuantity = 1;
      this.isProductModalOpen = true;
    },

    openEditModal(cartId: string) {
      const cartItem = this.items.find(i => i.id === cartId);
      if (!cartItem) return;

      this.activeItem = cartItem.item;
      this.activeItemImageBroken = false; // Default to false, or could check if we track it elsewhere
      this.editingCartId = cartId;
      this.initialOptions = [...cartItem.selectedOptions];
      this.initialInstructions = cartItem.specialInstructions;
      this.initialQuantity = cartItem.quantity;
      this.isProductModalOpen = true;
      this.closeCart(); // Close cart to focus on modal
    },

    closeProductModal() {
      this.isProductModalOpen = false;
      this.activeItem = null;
      this.activeItemImageBroken = false;
    },

    // Cart Logic
    addToCart(item: Item, options: Option[], instructions: string, quantity: number) {
      if (this.editingCartId) {
        // Remove old item first if editing
        this.removeItem(this.editingCartId);
        this.editingCartId = null;
      }

      const optionsId = options.map(o => o.id).sort().join('-');
      const cartId = `${item.id}|${optionsId}|${instructions.trim()}`;

      const existingItem = this.items.find(i => i.id === cartId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({
          id: cartId,
          item,
          quantity,
          selectedOptions: options,
          specialInstructions: instructions
        });
      }

      this.closeProductModal();
      // this.openCart(); // Don't auto-open cart
    },

    removeItem(cartId: string) {
      this.items = this.items.filter(i => i.id !== cartId);
    },

    updateQuantity(cartId: string, delta: number) {
      const item = this.items.find(i => i.id === cartId);
      if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
          this.removeItem(cartId);
        }
      }
    }
  },
});
