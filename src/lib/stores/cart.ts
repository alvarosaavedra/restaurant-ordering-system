import type { MenuItemWithCategory } from '$lib/types/orders';
import { calculateCartTotals, type OrderDiscount as UtilsOrderDiscount } from '$lib/utils/discounts';
import { writable, derived, get, type Readable } from 'svelte/store';

export interface ItemDiscount {
	type: 'fixed' | 'percentage';
	value: number;
	reason?: string;
}

export interface OrderDiscount {
	type: 'fixed' | 'percentage';
	value: number;
	reason?: string;
}

export interface CartItem {
	item: MenuItemWithCategory;
	quantity: number;
	discount?: ItemDiscount;
}

export interface CartTotals {
	subtotal: number;
	itemDiscounts: number;
	orderDiscount: number;
	totalDiscount: number;
	finalTotal: number;
}

export interface CartStore {
	items: Readable<CartItem[]>;
	orderDiscount: Readable<OrderDiscount | null>;
	totals: Readable<CartTotals>;
	itemCount: Readable<number>;
	addItem: (item: MenuItemWithCategory, quantity: number) => void;
	removeItem: (itemId: string) => void;
	updateQuantity: (itemId: string, newQuantity: number) => void;
	addItemDiscount: (itemId: string, discount: ItemDiscount) => void;
	removeItemDiscount: (itemId: string) => void;
	setOrderDiscount: (discount: OrderDiscount) => void;
	clearOrderDiscount: () => void;
	clearAllDiscounts: () => void;
	clearCart: () => void;
}

export function createCartStore(): CartStore {
	// Writable stores for state
	const itemsStore = writable<CartItem[]>([]);
	const orderDiscountStore = writable<OrderDiscount | null>(null);

	// Derived stores for computed values
	const totalsStore = derived(
		[itemsStore, orderDiscountStore],
		([$items, $orderDiscount]) => {
			return calculateCartTotals(
				$items,
				$orderDiscount || undefined
			);
		}
	);

	const itemCountStore = derived(itemsStore, ($items) => {
		return $items.reduce((total, item) => total + item.quantity, 0);
	});

	function addItem(item: MenuItemWithCategory, quantity: number): void {
		itemsStore.update((items) => {
			const existingItem = items.find((cartItem) => cartItem.item.id === item.id);

			if (existingItem) {
				return items.map((cartItem) =>
					cartItem.item.id === item.id
						? { ...cartItem, quantity: cartItem.quantity + quantity }
						: cartItem
				);
			} else {
				return [...items, { item, quantity }];
			}
		});
	}

	function removeItem(itemId: string): void {
		itemsStore.update((items) =>
			items.filter((cartItem) => cartItem.item.id !== itemId)
		);
	}

	function updateQuantity(itemId: string, newQuantity: number): void {
		if (newQuantity <= 0) {
			removeItem(itemId);
		} else {
			itemsStore.update((items) =>
				items.map((cartItem) =>
					cartItem.item.id === itemId
						? { ...cartItem, quantity: newQuantity }
						: cartItem
				)
			);
		}
	}

	function addItemDiscount(itemId: string, discount: ItemDiscount): void {
		itemsStore.update((items) =>
			items.map((cartItem) =>
				cartItem.item.id === itemId
					? { ...cartItem, discount }
					: cartItem
			)
		);
	}

	function removeItemDiscount(itemId: string): void {
		itemsStore.update((items) =>
			items.map((cartItem) => {
				if (cartItem.item.id === itemId) {
					const { discount: _, ...rest } = cartItem;
					return rest;
				}
				return cartItem;
			})
		);
	}

	function setOrderDiscount(discount: OrderDiscount): void {
		orderDiscountStore.set(discount);
	}

	function clearOrderDiscount(): void {
		orderDiscountStore.set(null);
	}

	function clearAllDiscounts(): void {
		// Remove all item discounts
		itemsStore.update((items) =>
			items.map((cartItem) => {
				const { discount: _, ...rest } = cartItem;
				return rest;
			})
		);
		// Clear order discount
		orderDiscountStore.set(null);
	}

	function clearCart(): void {
		itemsStore.set([]);
		orderDiscountStore.set(null);
	}

	return {
		items: { subscribe: itemsStore.subscribe },
		orderDiscount: { subscribe: orderDiscountStore.subscribe },
		totals: { subscribe: totalsStore.subscribe },
		itemCount: { subscribe: itemCountStore.subscribe },
		addItem,
		removeItem,
		updateQuantity,
		addItemDiscount,
		removeItemDiscount,
		setOrderDiscount,
		clearOrderDiscount,
		clearAllDiscounts,
		clearCart
	};
}

// Create a singleton instance for app-wide use
export const cartStore = createCartStore();
