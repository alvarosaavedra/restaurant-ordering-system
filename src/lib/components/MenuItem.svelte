<script lang="ts">
	import type { MenuItemWithCategory } from '$lib/types/orders';

	// Simple currency formatter for now
	function formatCurrency(amount: number): string {
		return `$${amount.toFixed(2)}`;
	}

	interface Props {
		item: MenuItemWithCategory;
		onAdd: (item: MenuItemWithCategory, quantity: number) => void;
	}

	let { item, onAdd }: Props = $props();

	let quantity = $state(1);

	function incrementQuantity() {
		quantity++;
	}

	function decrementQuantity() {
		if (quantity > 1) {
			quantity--;
		}
	}

	function addToOrder() {
		if (quantity >= 1) {
			onAdd(item, quantity);
		}
	}
</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-4 bg-white border border-neutral-200 rounded-lg hover:border-bakery-300 hover:bg-bakery-50/30 transition-all gap-2 sm:gap-0" role="listitem">
	<div class="flex-1 min-w-0 pr-0 sm:pr-4">
		<div class="flex items-start sm:items-center gap-2 sm:gap-3">
			<div class="flex-1 min-w-0">
				<h3 class="font-semibold text-neutral-900 text-sm sm:text-base">{item.name}</h3>
				{#if item.description}
					<p class="text-xs text-neutral-500 mt-0.5 line-clamp-1 sm:line-clamp-2">{item.description}</p>
				{/if}
				{#if !item.isAvailable}
					<span class="text-xs text-warning-600 font-medium mt-1" role="status" aria-live="polite">Out of Stock</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex flex-row sm:flex-col items-center justify-between sm:items-end sm:justify-end gap-3 sm:gap-2 flex-shrink-0 w-full sm:w-auto">
		<span class="font-bold text-neutral-900 text-sm min-w-[60px] text-right order-2 sm:order-1">{formatCurrency(item.price)}</span>

		{#if item.isAvailable}
			<div class="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
				<div class="flex items-center border border-neutral-200 rounded-md" role="group" aria-label="Quantity selector">
					<button
						type="button"
						class="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-l transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center"
						onclick={decrementQuantity}
						disabled={quantity <= 1}
						aria-label={`Decrease quantity for ${item.name}`}
					>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
						</svg>
					</button>

					<div class="px-2 py-1 text-center font-medium text-neutral-900 min-w-[30px] text-sm" aria-live="polite" aria-atomic="true">
						{quantity}
					</div>

					<button
						type="button"
						class="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-r transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center"
						onclick={incrementQuantity}
						aria-label={`Increase quantity for ${item.name}`}
					>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16m-8-8v8m0 0l8 8m-8-8v8" />
						</svg>
					</button>
				</div>

				<button
					type="button"
					class="px-3 py-1.5 sm:px-4 sm:py-2 bg-bakery-600 text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-bakery-700 transition-colors min-h-[40px] sm:min-h-[44px] flex-shrink-0"
					onclick={() => addToOrder()}
					disabled={quantity < 1}
					aria-label={`Add ${quantity} ${item.name} to order`}
				>
					Add
				</button>
			</div>
		{:else}
			<span class="text-xs text-neutral-400 px-3 py-1.5 bg-neutral-100 rounded-md order-1 sm:order-2" role="status" aria-live="polite">
				Unavailable
			</span>
		{/if}
	</div>
</div>