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

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 card-hover">
	<div class="flex justify-between items-start mb-4">
		<div class="flex-1">
			<div class="flex items-start gap-3">
				<div class="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="font-semibold text-gray-900 text-base">{item.name}</h3>
					{#if item.description}
						<p class="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-3 mt-3 ml-[52px]">
				<span class="text-xl font-bold text-gradient">{formatCurrency(item.price)}</span>
				{#if !item.isAvailable}
					<span class="text-xs bg-warning-100 text-warning-700 px-2.5 py-1 rounded-full font-medium">Out of Stock</span>
				{/if}
			</div>
		</div>
		<span class="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{item.category.name}</span>
	</div>

	{#if item.isAvailable}
		<div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
			<div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
				<button
					type="button"
					class="p-2 text-gray-500 hover:bg-gray-100 transition-colors"
					onclick={decrementQuantity}
					disabled={quantity <= 1}
					aria-label="Decrease quantity"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
					</svg>
				</button>
				
				<div class="px-3 py-2 text-center font-semibold text-gray-900 min-w-[50px]">
					{quantity}
				</div>
				
				<button
					type="button"
					class="p-2 text-gray-500 hover:bg-gray-100 transition-colors"
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
				class="flex-1"
				onclick={() => addToOrder()}
				disabled={quantity < 1}
			>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add
			</Button>
		</div>
	{:else}
		<div class="mt-4 pt-4 border-t border-gray-100 text-center py-2 px-3 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium">
			Currently unavailable
		</div>
	{/if}
</div>