<script lang="ts">
	import DiscountBadge from './DiscountBadge.svelte';
	import { calculateDiscountAmount } from '$lib/utils/discounts';
	import type { CartItem } from '$lib/stores/cart';

	interface Props {
		cartItem: CartItem;
		onUpdateDiscount: () => void;
		onRemoveDiscount: () => void;
	}

	let { cartItem, onUpdateDiscount, onRemoveDiscount }: Props = $props();

	let itemTotal = $derived(cartItem.item.price * cartItem.quantity);
	let hasDiscount = $derived(!!cartItem.discount);

	let discountAmount = $derived(
		hasDiscount && cartItem.discount
			? calculateDiscountAmount(itemTotal, cartItem.discount.type, cartItem.discount.value)
			: 0
	);

	let finalPrice = $derived(itemTotal - discountAmount);
</script>

<div class="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg">
	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-2">
			<h4 class="font-semibold text-neutral-900 text-sm truncate">{cartItem.item.name}</h4>
			{#if cartItem.item.category}
				<span class="text-xs text-neutral-500">{cartItem.item.category.name}</span>
			{/if}
		</div>

		<div class="flex items-center gap-2 mt-1">
			<span class="text-sm text-neutral-600">Qty: {cartItem.quantity}</span>
			<span class="text-neutral-300">|</span>
			{#if hasDiscount}
				<span data-testid="original-price" class="text-sm text-neutral-400 line-through">
					${itemTotal.toFixed(2)}
				</span>
				<span class="text-sm font-bold text-success-700">
					${finalPrice.toFixed(2)}
				</span>
			{:else}
				<span class="text-sm font-medium text-neutral-700">
					${itemTotal.toFixed(2)}
				</span>
			{/if}
		</div>
	</div>

	<div class="ml-3">
		{#if hasDiscount && cartItem.discount}
			<div class="flex items-center gap-2">
				<DiscountBadge
					discount={cartItem.discount}
					size="sm"
					onClick={onUpdateDiscount}
				/>
				<button
					type="button"
					data-testid="remove-discount-btn"
					class="p-1.5 text-neutral-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
					aria-label="Remove discount"
					onclick={onRemoveDiscount}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{:else}
			<button
				type="button"
				data-testid="add-discount-btn"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-bakery-700 bg-bakery-50 hover:bg-bakery-100 border border-bakery-200 rounded-lg transition-colors"
				onclick={onUpdateDiscount}
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add Discount
			</button>
		{/if}
	</div>
</div>
