<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
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

<div class="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
	<div class="flex justify-between items-start mb-3">
		<div class="flex-1">
			<h3 class="font-semibold text-gray-900">{item.name}</h3>
			{#if item.description}
				<p class="text-sm text-gray-600 mt-1">{item.description}</p>
			{/if}
			<div class="flex items-center gap-4 mt-2">
				<span class="text-lg font-bold text-gray-900">{formatCurrency(item.price)}</span>
				{#if !item.isAvailable}
					<span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Out of Stock</span>
				{/if}
			</div>
		</div>
		<div class="text-sm text-gray-500">
			{item.category.name}
		</div>
	</div>

	{#if item.isAvailable}
			<div class="flex items-center gap-3">
				<div class="flex items-center border border-gray-200 rounded-lg">
				<button
					type="button"
					class="p-2 text-gray-500 hover:text-gray-700 transition-colors"
					onclick={decrementQuantity}
					disabled={quantity <= 1}
					aria-label="Decrease quantity"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
					</svg>
				</button>
					
					<div class="px-3 py-2 text-center font-medium">
						{quantity}
					</div>
					
				<button
					type="button"
					class="p-2 text-gray-500 hover:text-gray-700 transition-colors"
					onclick={incrementQuantity}
					aria-label="Increase quantity"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16m-8-8v8m0 0l8 8m-8-8v8" />
					</svg>
				</button>
				</div>
				
			<Button
				variant="primary"
				size="sm"
				class="min-w-[100px]"
				onclick={() => addToOrder()}
				disabled={quantity < 1}
			>
					Add to Order
				</Button>
			</div>
	{:else}
		<div class="text-center py-2 px-3 bg-gray-100 text-gray-600 rounded-lg">
			Currently unavailable
		</div>
	{/if}
</div>