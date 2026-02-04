<script lang="ts">
	import type { CartItem, CartTotals, OrderDiscount } from '$lib/stores/cart';
	import { formatCurrency } from '$lib/utils/formatting';

	interface Props {
		cartItems: CartItem[];
		orderDiscount: OrderDiscount | null;
		totals: CartTotals;
		onAddDiscount: () => void;
		onRemoveItemDiscount: (itemId: string) => void;
		onRemoveOrderDiscount: () => void;
	}

	let { cartItems, orderDiscount, totals, onAddDiscount, onRemoveItemDiscount, onRemoveOrderDiscount }: Props = $props();

	// Check if there are any discounts
	let hasDiscounts = $derived(() => {
		const hasItemDiscounts = cartItems.some(item => item.discount);
		const hasOrderDiscount = orderDiscount !== null;
		return hasItemDiscounts || hasOrderDiscount;
	});

	// Format discount label
	function formatDiscountLabel(discount: { type: 'fixed' | 'percentage'; value: number }): string {
		if (discount.type === 'percentage') {
			return `${discount.value}% off`;
		}
		return `${formatCurrency(discount.value)} off`;
	}

	// Calculate item final price
	function getItemFinalPrice(item: CartItem): number {
		const basePrice = item.item.price * item.quantity;
		if (!item.discount) return basePrice;
		
		if (item.discount.type === 'percentage') {
			const discountAmount = basePrice * (item.discount.value / 100);
			return Math.max(0, basePrice - discountAmount);
		} else {
			return Math.max(0, basePrice - item.discount.value);
		}
	}
</script>

<div data-testid="discount-panel" class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
	<!-- Header -->
	<div class="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
		<h3 class="text-sm font-semibold text-neutral-900">Discounts</h3>
		<button
			type="button"
			data-testid="add-discount-btn"
			class="text-sm font-medium text-bakery-600 hover:text-bakery-700 flex items-center gap-1"
			onclick={onAddDiscount}
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
			</svg>
			Add Discount
		</button>
	</div>

	<div class="p-4 space-y-3">
		<!-- Item Discounts -->
		{#each cartItems as item (item.item.id)}
			{#if item.discount}
				<div data-testid="item-discount-{item.item.id}" class="flex items-center justify-between p-3 bg-success-50 border border-success-200 rounded-lg">
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success-600" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
							</svg>
							<span class="text-sm font-medium text-success-700 truncate">
								{formatDiscountLabel(item.discount)}
							</span>
						</div>
						<p class="text-xs text-success-600 mt-0.5 ml-6">
							{item.item.name} x{item.quantity}
							{#if item.discount.reason}
								• {item.discount.reason}
							{/if}
						</p>
					</div>
					<div class="flex items-center gap-3 ml-3">
						<span class="text-sm font-medium text-success-700">
							-{formatCurrency(item.item.price * item.quantity - getItemFinalPrice(item))}
						</span>
						<button
							type="button"
							data-testid="remove-item-discount-{item.item.id}"
							class="p-1 text-success-600 hover:text-success-800 hover:bg-success-100 rounded transition-colors"
							onclick={() => onRemoveItemDiscount(item.item.id)}
							aria-label="Remove discount for {item.item.name}"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
							</svg>
						</button>
					</div>
				</div>
			{/if}
		{/each}

		<!-- Order Discount -->
		{#if orderDiscount}
			<div data-testid="order-discount" class="flex items-center justify-between p-3 bg-bakery-50 border border-bakery-200 rounded-lg">
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-bakery-600" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
						</svg>
						<span class="text-sm font-medium text-bakery-700">
							{formatDiscountLabel(orderDiscount)} on entire order
						</span>
					</div>
					{#if orderDiscount.reason}
						<p class="text-xs text-bakery-600 mt-0.5 ml-6">
							{orderDiscount.reason}
						</p>
					{/if}
				</div>
				<div class="flex items-center gap-3 ml-3">
					<span class="text-sm font-medium text-bakery-700">
						-{formatCurrency(totals.orderDiscount)}
					</span>
					<button
						type="button"
						data-testid="remove-order-discount"
						class="p-1 text-bakery-600 hover:text-bakery-800 hover:bg-bakery-100 rounded transition-colors"
						onclick={onRemoveOrderDiscount}
						aria-label="Remove order discount"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
						</svg>
					</button>
				</div>
			</div>
		{/if}

		<!-- Empty State -->
		{#if !hasDiscounts()}
			<div class="text-center py-6 text-neutral-500">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
				</svg>
				<p class="text-sm">No discounts applied</p>
				<p class="text-xs text-neutral-400 mt-1">Click "Add Discount" to get started</p>
			</div>
		{/if}
	</div>

	<!-- Totals Section -->
	<div class="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span class="text-neutral-600">Subtotal</span>
				<span class="font-medium text-neutral-900">{formatCurrency(totals.subtotal)}</span>
			</div>
			
			{#if totals.totalDiscount > 0}
				<div class="flex justify-between text-sm text-success-600">
					<span>You saved</span>
					<span class="font-medium">-{formatCurrency(totals.totalDiscount)}</span>
				</div>
			{/if}
			
			<div class="flex justify-between text-base font-semibold pt-2 border-t border-neutral-200">
				<span class="text-neutral-900">Total</span>
				<span class="text-bakery-700">{formatCurrency(totals.finalTotal)}</span>
			</div>
		</div>
	</div>
</div>
