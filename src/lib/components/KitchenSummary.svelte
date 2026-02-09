<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';

	interface OrderItem {
		id: string;
		quantity: number;
		unitPrice: number;
		menuItemId: string;
		menuItem: {
			id: string;
			name: string;
			categoryId: string;
		} | null;
		variations?: Array<{
			groupName: string | null;
			variationName: string | null;
			priceAdjustment: number | null;
		}>;
		modifiers?: Array<{
			modifierId: string;
			modifierName: string | null;
			quantity: number;
			priceAtOrder: number;
		}>;
	}

	interface Order {
		id: string;
		items: OrderItem[];
	}

	interface AggregatedItem {
		menuItemName: string;
		variationsKey: string;
		variationsDisplay: string;
		totalQuantity: number;
	}

	interface AggregatedModifier {
		modifierId: string;
		modifierName: string;
		totalQuantity: number;
	}

	let { orders }: { orders: Order[] } = $props();

	function aggregateItems(ordersList: Order[]): AggregatedItem[] {
		const itemMap: Record<string, AggregatedItem> = {};

		for (const order of ordersList) {
			for (const item of order.items) {
				if (!item.menuItem) continue;

				// Create a unique key based on menu item and variations
				const variationsKey = item.variations && item.variations.length > 0
					? item.variations
						.filter(v => v.variationName)
						.sort((a, b) => (a.groupName || '').localeCompare(b.groupName || ''))
						.map(v => `${v.groupName}:${v.variationName}`)
						.join('|')
					: '';

				const key = `${item.menuItem.id}|${variationsKey}`;

				// Create display text for variations
				const variationsDisplay = item.variations && item.variations.length > 0
					? item.variations
						.filter(v => v.variationName)
						.map(v => v.variationName)
						.join(', ')
					: '';

				if (itemMap[key]) {
					itemMap[key].totalQuantity += item.quantity;
				} else {
					itemMap[key] = {
						menuItemName: item.menuItem.name,
						variationsKey,
						variationsDisplay,
						totalQuantity: item.quantity
					};
				}
			}
		}

		// Convert to array and sort by menu item name
		return Object.values(itemMap).sort((a, b) => {
			const nameCompare = a.menuItemName.localeCompare(b.menuItemName);
			if (nameCompare !== 0) return nameCompare;
			return a.variationsDisplay.localeCompare(b.variationsDisplay);
		});
	}

	function aggregateModifiers(ordersList: Order[]): AggregatedModifier[] {
		const modifierMap: Record<string, AggregatedModifier> = {};

		for (const order of ordersList) {
			for (const item of order.items) {
				if (!item.modifiers || item.modifiers.length === 0) continue;

				for (const modifier of item.modifiers) {
					if (!modifier.modifierName) continue;

					const key = modifier.modifierId;
					const totalQty = modifier.quantity * item.quantity;

					if (modifierMap[key]) {
						modifierMap[key].totalQuantity += totalQty;
					} else {
						modifierMap[key] = {
							modifierId: key,
							modifierName: modifier.modifierName,
							totalQuantity: totalQty
						};
					}
				}
			}
		}

		// Convert to array and sort by modifier name
		return Object.values(modifierMap).sort((a, b) =>
			a.modifierName.localeCompare(b.modifierName)
		);
	}

	let aggregatedItems = $derived(aggregateItems(orders));
	let aggregatedModifiers = $derived(aggregateModifiers(orders));
	let totalItemsCount = $derived(
		aggregatedItems.reduce((sum: number, item: AggregatedItem) => sum + item.totalQuantity, 0)
	);
	let hasItems = $derived(aggregatedItems.length > 0);
	let hasModifiers = $derived(aggregatedModifiers.length > 0);
</script>

<Card class="overflow-hidden">
	<div class="p-4 border-b border-neutral-200 bg-bakery-50">
		<div class="flex items-center gap-2">
			<svg class="w-5 h-5 text-bakery-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
			</svg>
			<h3 class="font-semibold text-neutral-900">Kitchen Summary</h3>
			<span class="ml-auto text-sm text-neutral-600 bg-white px-2 py-1 rounded-full">
				{totalItemsCount} items total
			</span>
		</div>
	</div>

	<div class="p-4">
		{#if !hasItems}
			<p class="text-center text-neutral-500 py-4">No items to prepare</p>
		{:else}
			<div class="space-y-6">
				<!-- Dish Summary -->
				<div>
					<h4 class="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						Dishes to Prepare
					</h4>
					<div class="space-y-2">
						{#each aggregatedItems as item (item.variationsKey)}
							<div class="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
								<div class="flex-1">
									<span class="font-medium text-neutral-900">{item.menuItemName}</span>
									{#if item.variationsDisplay}
										<span class="text-sm text-neutral-600 ml-2">({item.variationsDisplay})</span>
									{/if}
								</div>
								<span class="font-bold text-lg text-bakery-600 min-w-[2rem] text-right">
									{item.totalQuantity}
								</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Modifiers Summary -->
				{#if hasModifiers}
					<div class="border-t border-neutral-200 pt-4">
						<h4 class="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Extras Needed
						</h4>
						<div class="grid grid-cols-2 gap-2">
							{#each aggregatedModifiers as modifier (modifier.modifierId)}
								<div class="flex items-center justify-between py-2 px-3 bg-bakery-50 rounded-lg border border-bakery-100">
									<span class="text-sm text-neutral-700">{modifier.modifierName}</span>
									<span class="font-semibold text-bakery-700 min-w-[1.5rem] text-right">
										{modifier.totalQuantity}
									</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</Card>
