import type { MenuItemWithCategory } from '$lib/types/orders';
import { calculateCartTotals } from '$lib/utils/discounts';
import { writable, derived, type Readable } from 'svelte/store';

export interface SelectedVariation {
	groupId: string;
	groupName: string;
	variationId: string;
	variationName: string;
	priceAdjustment: number;
}

export interface SelectedModifier {
	modifierId: string;
	modifierName: string;
	groupId: string;
	groupName: string;
	price: number;
	quantity: number;
}

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
	variations: SelectedVariation[];
	modifiers: SelectedModifier[];
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
	addItem: (item: MenuItemWithCategory, quantity: number, variations?: SelectedVariation[], modifiers?: SelectedModifier[]) => void;
	removeItem: (itemId: string, variations?: SelectedVariation[], modifiers?: SelectedModifier[]) => void;
	updateQuantity: (itemId: string, newQuantity: number, variations?: SelectedVariation[], modifiers?: SelectedModifier[]) => void;
	addItemDiscount: (itemId: string, discount: ItemDiscount, variations?: SelectedVariation[], modifiers?: SelectedModifier[]) => void;
	removeItemDiscount: (itemId: string, variations?: SelectedVariation[], modifiers?: SelectedModifier[]) => void;
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

	function addItem(item: MenuItemWithCategory, quantity: number, variations: SelectedVariation[] = [], modifiers: SelectedModifier[] = []): void {
		itemsStore.update((items) => {
			// Create a unique key for this item + variations + modifiers combination
			const existingItem = items.find((cartItem) => 
				cartItem.item.id === item.id &&
				JSON.stringify(cartItem.variations) === JSON.stringify(variations) &&
				JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers)
			);

			if (existingItem) {
				return items.map((cartItem) =>
					cartItem.item.id === item.id &&
					JSON.stringify(cartItem.variations) === JSON.stringify(variations) &&
					JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers)
						? { ...cartItem, quantity: cartItem.quantity + quantity }
						: cartItem
				);
			} else {
				return [...items, { item, quantity, variations, modifiers }];
			}
		});
	}

	function removeItem(itemId: string, variations: SelectedVariation[] = [], modifiers: SelectedModifier[] = []): void {
		itemsStore.update((items) =>
			items.filter((cartItem) => 
				!(cartItem.item.id === itemId &&
				JSON.stringify(cartItem.variations) === JSON.stringify(variations) &&
				JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers))
			)
		);
	}

	function updateQuantity(itemId: string, newQuantity: number, variations: SelectedVariation[] = [], modifiers: SelectedModifier[] = []): void {
		if (newQuantity <= 0) {
			removeItem(itemId, variations, modifiers);
		} else {
			itemsStore.update((items) =>
				items.map((cartItem) =>
					cartItem.item.id === itemId &&
					JSON.stringify(cartItem.variations) === JSON.stringify(variations) &&
					JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers)
						? { ...cartItem, quantity: newQuantity }
						: cartItem
				)
			);
		}
	}

	function addItemDiscount(itemId: string, discount: ItemDiscount, variations: SelectedVariation[] = [], modifiers: SelectedModifier[] = []): void {
		itemsStore.update((items) =>
			items.map((cartItem) =>
				cartItem.item.id === itemId &&
				JSON.stringify(cartItem.variations) === JSON.stringify(variations) &&
				JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers)
					? { ...cartItem, discount }
					: cartItem
			)
		);
	}

	function removeItemDiscount(itemId: string, variations: SelectedVariation[] = [], modifiers: SelectedModifier[] = []): void {
		itemsStore.update((items) =>
			items.map((cartItem) => {
				if (cartItem.item.id === itemId &&
					JSON.stringify(cartItem.variations) === JSON.stringify(variations) &&
					JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers)) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { discount, ...rest } = cartItem;
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
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { discount, ...rest } = cartItem;
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
