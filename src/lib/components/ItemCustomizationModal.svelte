<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import type { VariationGroup, Variation, ModifierGroup, Modifier } from '$lib/server/db/schema';
	import type { SelectedVariation, SelectedModifier } from '$lib/stores/cart';

	interface Props {
		open: boolean;
		itemName: string;
		basePrice: number;
		variationGroups: (VariationGroup & { variations: Variation[] })[];
		modifierGroups: (ModifierGroup & { modifiers: Modifier[] })[];
		onSave: (variations: SelectedVariation[], modifiers: SelectedModifier[], quantity: number) => void;
		onClose: () => void;
	}

	let { open, itemName, basePrice, variationGroups, modifierGroups, onSave, onClose }: Props = $props();

	let quantity = $state(1);
	let selectedVariations = $state<Record<string, Variation>>({});
	let selectedModifiers = $state<Record<string, { modifier: Modifier; quantity: number }>>({});

	// Calculate total price
	let totalPrice = $derived.by(() => {
		let price = basePrice;
		Object.values(selectedVariations).forEach((variation) => {
			price += variation.priceAdjustment;
		});
		Object.values(selectedModifiers).forEach(({ modifier, quantity: modQty }) => {
			price += modifier.price * modQty;
		});
		return price * quantity;
	});

	// Pre-select default variations
	$effect(() => {
		if (open) {
			const defaults: Record<string, Variation> = {};
			variationGroups.forEach((group) => {
				const defaultVariation = group.variations.find((v) => v.isDefault);
				if (defaultVariation) {
					defaults[group.id] = defaultVariation;
				} else if (group.variations.length > 0) {
					defaults[group.id] = group.variations[0];
				}
			});
			selectedVariations = defaults;
			selectedModifiers = {};
		}
	});

	function handleVariationSelect(groupId: string, variation: Variation) {
		selectedVariations = { ...selectedVariations, [groupId]: variation };
	}

	function handleModifierToggle(groupId: string, modifier: Modifier) {
		const key = `${groupId}-${modifier.id}`;
		const newModifiers = { ...selectedModifiers };
		
		if (newModifiers[key]) {
			delete newModifiers[key];
		} else {
			newModifiers[key] = { modifier, quantity: 1 };
		}
		selectedModifiers = newModifiers;
	}

	function updateModifierQuantity(groupId: string, modifier: Modifier, delta: number) {
		const key = `${groupId}-${modifier.id}`;
		const current = selectedModifiers[key];
		
		if (current) {
			const newQty = Math.max(1, current.quantity + delta);
			selectedModifiers = { ...selectedModifiers, [key]: { modifier, quantity: newQty } };
		}
	}

	function handleSave() {
		const variations: SelectedVariation[] = [];
		Object.entries(selectedVariations).forEach(([groupId, variation]) => {
			const group = variationGroups.find((g) => g.id === groupId);
			if (group) {
				variations.push({
					groupId,
					groupName: group.name,
					variationId: variation.id,
					variationName: variation.name,
					priceAdjustment: variation.priceAdjustment
				});
			}
		});

		const modifiers: SelectedModifier[] = [];
		Object.entries(selectedModifiers).forEach(([key, { modifier, quantity: modQty }]) => {
			const [groupId] = key.split('-');
			const group = modifierGroups.find((g) => g.id === groupId);
			if (group) {
				modifiers.push({
					modifierId: modifier.id,
					modifierName: modifier.name,
					groupId,
					groupName: group.name,
					price: modifier.price,
					quantity: modQty
				});
			}
		});

		onSave(variations, modifiers, quantity);
		reset();
	}

	function handleClose() {
		reset();
		onClose();
	}

	function reset() {
		quantity = 1;
		selectedVariations = {};
		selectedModifiers = {};
	}

	function formatPrice(price: number): string {
		return price.toFixed(2);
	}
</script>

<Modal title="Customize {itemName}" {open} onclose={handleClose}>
	<div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
		<!-- Variations -->
		{#if variationGroups.length > 0}
			<div class="space-y-4">
				<h3 class="text-sm font-medium text-gray-900 uppercase tracking-wide">Options</h3>
				{#each variationGroups as group (group.id)}
					<div class="bg-gray-50 rounded-lg p-4">
						<h4 class="font-medium text-gray-900 mb-2">
							{group.name}
							{#if group.isRequired}
								<span class="text-error-600">*</span>
							{/if}
						</h4>
						<div class="space-y-2">
							{#each group.variations as variation (variation.id)}
								<label class="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-white transition-colors">
									<div class="flex items-center gap-3">
									<input
										type="radio"
										name="variation-{group.id}"
										checked={selectedVariations[group.id]?.id === variation.id}
										onchange={() => handleVariationSelect(group.id, variation)}
										class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
									/>
										<span class="text-gray-900">{variation.name}</span>
									</div>
									{#if variation.priceAdjustment !== 0}
										<span class="text-sm text-gray-600">
											{variation.priceAdjustment > 0 ? '+' : ''}${formatPrice(variation.priceAdjustment)}
										</span>
									{/if}
								</label>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Modifiers -->
		{#if modifierGroups.length > 0}
			<div class="space-y-4">
				<h3 class="text-sm font-medium text-gray-900 uppercase tracking-wide">Extras</h3>
				{#each modifierGroups as group (group.id)}
					<div class="bg-gray-50 rounded-lg p-4">
						<h4 class="font-medium text-gray-900 mb-2">{group.name}</h4>
						<div class="space-y-2">
							{#each group.modifiers as modifier (modifier.id)}
							{@const key = `${group.id}-${modifier.id}`}
							{@const isSelected = !!selectedModifiers[key]}
							<div class="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors">
								<label class="flex items-center gap-3 flex-1 cursor-pointer">
									<input
										type="checkbox"
										checked={isSelected}
										onchange={() => handleModifierToggle(group.id, modifier)}
										class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
									/>
									<span class="text-gray-900">{modifier.name}</span>
									<span class="text-sm text-gray-600">+${formatPrice(modifier.price)}</span>
								</label>
								{#if isSelected}
									<div class="flex items-center gap-2">
										<button
											type="button"
											class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
											onclick={() => updateModifierQuantity(group.id, modifier, -1)}
										>
											-
										</button>
										<span class="w-8 text-center font-medium">{selectedModifiers[key]?.quantity}</span>
										<button
											type="button"
											class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
											onclick={() => updateModifierQuantity(group.id, modifier, 1)}
										>
											+
										</button>
									</div>
								{/if}
							</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Quantity -->
		<div class="bg-gray-50 rounded-lg p-4">
			<h4 class="font-medium text-gray-900 mb-2">Quantity</h4>
			<div class="flex items-center gap-4">
				<button
					type="button"
					class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
					onclick={() => quantity = Math.max(1, quantity - 1)}
					aria-label="Decrease quantity"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
					</svg>
				</button>
				<span class="text-xl font-semibold w-12 text-center">{quantity}</span>
				<button
					type="button"
					class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
					onclick={() => quantity++}
					aria-label="Increase quantity"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Total -->
		<div class="border-t border-gray-200 pt-4">
			<div class="flex items-center justify-between">
				<span class="text-lg font-medium text-gray-900">Total</span>
				<span class="text-2xl font-bold text-primary-600">${formatPrice(totalPrice)}</span>
			</div>
		</div>
	</div>

	<div class="flex gap-3 pt-4 border-t border-gray-200 mt-4">
		<Button type="button" variant="secondary" class="flex-1" onclick={handleClose}>Cancel</Button>
		<Button type="button" class="flex-1" onclick={handleSave}>Add to Order</Button>
	</div>
</Modal>
