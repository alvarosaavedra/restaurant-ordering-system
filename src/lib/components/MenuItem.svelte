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

<div class="flex items-center justify-between py-3 px-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all" role="listitem">
	<div class="flex-1 min-w-0 pr-4">
		<div class="flex items-center gap-3">
			<div>
				<h3 class="font-semibold text-gray-900 text-sm">{item.name}</h3>
				{#if item.description}
					<p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
				{/if}
				{#if !item.isAvailable}
					<span class="text-xs text-warning-600 font-medium mt-1" role="status" aria-live="polite">Out of Stock</span>
				{/if}
			</div>
		</div>
	</div>
	
	<div class="flex items-center gap-3 flex-shrink-0">
		<span class="font-bold text-gray-900 text-sm min-w-[60px] text-right">{formatCurrency(item.price)}</span>
		
		{#if item.isAvailable}
			<div class="flex items-center border border-gray-200 rounded-md" role="group" aria-label="Quantity selector">
				<button
					type="button"
					class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-l transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
					onclick={decrementQuantity}
					disabled={quantity <= 1}
					aria-label={`Decrease quantity for ${item.name}`}
				>
					<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
					</svg>
				</button>
				
				<div class="px-2 py-1 text-center font-medium text-gray-900 min-w-[30px] text-sm" aria-live="polite" aria-atomic="true">
					{quantity}
				</div>
				
				<button
					type="button"
					class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-r transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
				class="px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-md hover:bg-primary-700 transition-colors min-h-[44px]"
				onclick={() => addToOrder()}
				disabled={quantity < 1}
				aria-label={`Add ${quantity} ${item.name} to order`}
			>
				Add
			</button>
		{:else}
			<span class="text-xs text-gray-400 px-3 py-1.5 bg-gray-100 rounded-md" role="status" aria-live="polite">
				Unavailable
			</span>
		{/if}
	</div>
</div>