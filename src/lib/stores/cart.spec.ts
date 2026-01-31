import { describe, it, expect, beforeEach } from 'vitest';
import { createCartStore } from './cart';
import type { MenuItemWithCategory } from '$lib/types/orders';
import { get } from 'svelte/store';

const mockCategory = {
	id: 'cat-1',
	name: 'Test Category',
	displayOrder: 1,
	createdAt: new Date()
};

const mockMenuItem = (id: string, price: number): MenuItemWithCategory => ({
	id,
	name: `Item ${id}`,
	description: 'Test description',
	price,
	isAvailable: true,
	categoryId: 'cat-1',
	category: mockCategory,
	createdAt: new Date()
});

describe('Cart Store', () => {
	let cart: ReturnType<typeof createCartStore>;

	beforeEach(() => {
		cart = createCartStore();
	});

	describe('addItem', () => {
		it('should add item to empty cart', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 2);

			const items = get(cart.items);
			expect(items.length).toBe(1);
			expect(items[0].item.id).toBe('1');
			expect(items[0].quantity).toBe(2);
		});

		it('should increase quantity when adding existing item', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 2);
			cart.addItem(item, 3);

			const items = get(cart.items);
			expect(items.length).toBe(1);
			expect(items[0].quantity).toBe(5);
		});
	});

	describe('removeItem', () => {
		it('should remove item from cart', () => {
			const item1 = mockMenuItem('1', 10);
			const item2 = mockMenuItem('2', 15);
			cart.addItem(item1, 2);
			cart.addItem(item2, 1);

			cart.removeItem('1');

			const items = get(cart.items);
			expect(items.length).toBe(1);
			expect(items[0].item.id).toBe('2');
		});
	});

	describe('updateQuantity', () => {
		it('should update item quantity', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 2);
			cart.updateQuantity('1', 5);

			const items = get(cart.items);
			expect(items[0].quantity).toBe(5);
		});

		it('should remove item when quantity is 0 or less', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 2);
			cart.updateQuantity('1', 0);

			const items = get(cart.items);
			expect(items.length).toBe(0);
		});
	});

	describe('addItemDiscount', () => {
		it('should add fixed discount to item', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 2);
			cart.addItemDiscount('1', { type: 'fixed', value: 3 });

			const items = get(cart.items);
			expect(items[0].discount).toEqual({ type: 'fixed', value: 3 });
		});

		it('should add percentage discount to item', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 1);
			cart.addItemDiscount('1', { type: 'percentage', value: 20 });

			const items = get(cart.items);
			expect(items[0].discount).toEqual({ type: 'percentage', value: 20 });
		});

		it('should update existing discount on item', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 1);
			cart.addItemDiscount('1', { type: 'fixed', value: 2 });
			cart.addItemDiscount('1', { type: 'fixed', value: 3 });

			const items = get(cart.items);
			expect(items[0].discount).toEqual({ type: 'fixed', value: 3 });
		});

		it('should include discount reason when provided', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 1);
			cart.addItemDiscount('1', { type: 'fixed', value: 2, reason: 'Loyalty discount' });

			const items = get(cart.items);
			expect(items[0].discount?.reason).toBe('Loyalty discount');
		});
	});

	describe('removeItemDiscount', () => {
		it('should remove discount from item', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 1);
			cart.addItemDiscount('1', { type: 'fixed', value: 2 });
			cart.removeItemDiscount('1');

			const items = get(cart.items);
			expect(items[0].discount).toBeUndefined();
		});
	});

	describe('setOrderDiscount', () => {
		it('should set fixed order discount', () => {
			cart.setOrderDiscount({ type: 'fixed', value: 5 });

			const discount = get(cart.orderDiscount);
			expect(discount).toEqual({ type: 'fixed', value: 5 });
		});

		it('should set percentage order discount', () => {
			cart.setOrderDiscount({ type: 'percentage', value: 10 });

			const discount = get(cart.orderDiscount);
			expect(discount).toEqual({ type: 'percentage', value: 10 });
		});

		it('should include order discount reason', () => {
			cart.setOrderDiscount({ type: 'fixed', value: 5, reason: 'First order' });

			const discount = get(cart.orderDiscount);
			expect(discount?.reason).toBe('First order');
		});
	});

	describe('clearOrderDiscount', () => {
		it('should remove order discount', () => {
			cart.setOrderDiscount({ type: 'fixed', value: 5 });
			cart.clearOrderDiscount();

			const discount = get(cart.orderDiscount);
			expect(discount).toBeNull();
		});
	});

	describe('clearAllDiscounts', () => {
		it('should remove all item discounts and order discount', () => {
			const item1 = mockMenuItem('1', 10);
			const item2 = mockMenuItem('2', 15);
			cart.addItem(item1, 1);
			cart.addItem(item2, 1);
			cart.addItemDiscount('1', { type: 'fixed', value: 2 });
			cart.addItemDiscount('2', { type: 'percentage', value: 10 });
			cart.setOrderDiscount({ type: 'fixed', value: 5 });

			cart.clearAllDiscounts();

			const items = get(cart.items);
			const orderDiscount = get(cart.orderDiscount);
			expect(items[0].discount).toBeUndefined();
			expect(items[1].discount).toBeUndefined();
			expect(orderDiscount).toBeNull();
		});
	});

	describe('clearCart', () => {
		it('should remove all items and discounts', () => {
			const item = mockMenuItem('1', 10);
			cart.addItem(item, 2);
			cart.addItemDiscount('1', { type: 'fixed', value: 2 });
			cart.setOrderDiscount({ type: 'fixed', value: 5 });

			cart.clearCart();

			const items = get(cart.items);
			const orderDiscount = get(cart.orderDiscount);
			expect(items.length).toBe(0);
			expect(orderDiscount).toBeNull();
		});
	});

	describe('totals', () => {
		it('should calculate subtotal correctly', () => {
			cart.addItem(mockMenuItem('1', 10), 2);
			cart.addItem(mockMenuItem('2', 15), 1);

			const totals = get(cart.totals);
			expect(totals.subtotal).toBe(35);
		});

		it('should calculate totals with item discounts', () => {
			cart.addItem(mockMenuItem('1', 10), 2);
			cart.addItem(mockMenuItem('2', 15), 1);
			cart.addItemDiscount('1', { type: 'fixed', value: 2 });

			const totals = get(cart.totals);
			expect(totals.itemDiscounts).toBe(2);
			expect(totals.finalTotal).toBe(33);
		});

		it('should calculate totals with order discount', () => {
			cart.addItem(mockMenuItem('1', 10), 2);
			cart.addItem(mockMenuItem('2', 15), 1);
			cart.setOrderDiscount({ type: 'fixed', value: 5 });

			const totals = get(cart.totals);
			expect(totals.orderDiscount).toBe(5);
			expect(totals.finalTotal).toBe(30);
		});

		it('should calculate totals with both item and order discounts', () => {
			cart.addItem(mockMenuItem('1', 10), 2); // 20
			cart.addItem(mockMenuItem('2', 15), 1); // 15
			cart.addItemDiscount('1', { type: 'fixed', value: 2 }); // -2
			cart.setOrderDiscount({ type: 'percentage', value: 10 }); // -10% of 33 = 3.30

			const totals = get(cart.totals);
			expect(totals.subtotal).toBe(35);
			expect(totals.itemDiscounts).toBe(2);
			expect(totals.orderDiscount).toBeCloseTo(3.30, 2);
			expect(totals.totalDiscount).toBeCloseTo(5.30, 2);
			expect(totals.finalTotal).toBeCloseTo(29.70, 2);
		});
	});

	describe('itemCount', () => {
		it('should return total item count', () => {
			cart.addItem(mockMenuItem('1', 10), 2);
			cart.addItem(mockMenuItem('2', 15), 3);

			const count = get(cart.itemCount);
			expect(count).toBe(5);
		});

		it('should return 0 for empty cart', () => {
			const count = get(cart.itemCount);
			expect(count).toBe(0);
		});
	});
});
