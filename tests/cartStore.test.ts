import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../app/stores/cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with empty cart', () => {
    const store = useCartStore();
    expect(store.items.length).toBe(0);
    expect(store.totalPrice).toBe("0.00");
  });

  it('adds an item to the cart', () => {
    const store = useCartStore();
    const item = {
      id: '1',
      name: 'Test Burger',
      price: '10.00',
      description: 'Yum',
      image_url: 'test.jpg'
    };

    // Add item with no options, quantity 1
    store.addToCart(item as any, [], 'No onions', 1);

    expect(store.items.length).toBe(1);
    expect(store.items[0].item.name).toBe('Test Burger');
    expect(store.items[0].specialInstructions).toBe('No onions');
    expect(store.totalPrice).toBe("10.00");
  });

  it('calculates total price with options', () => {
    const store = useCartStore();
    const item = {
      id: '1',
      name: 'Test Burger',
      price: '10.00',
    };
    const option = {
      id: 'opt1',
      name: 'Cheese',
      price: '2.00'
    };

    store.addToCart(item as any, [option as any], '', 2);

    // (10 + 2) * 2 = 24
    expect(store.totalPrice).toBe("24.00");
  });

  it('updates quantity correctly', () => {
    const store = useCartStore();
    const item = { id: '1', price: '10.00' };

    store.addToCart(item as any, [], '', 1);
    const cartId = store.items[0].id;

    store.updateQuantity(cartId, 1);
    expect(store.items[0].quantity).toBe(2);

    store.updateQuantity(cartId, -2);
    expect(store.items.length).toBe(0); // Should be removed
  });
});
