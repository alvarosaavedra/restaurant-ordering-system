<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { VariationGroup, Variation } from '$lib/server/db/schema';
	import { formatPrice } from '$lib/utils/formatting';

	interface Props {
		group: VariationGroup & { variations: Variation[] };
		onUpdate: (group: Partial<VariationGroup>) => void;
		onDelete: () => void;
		onAddVariation: () => void;
		onUpdateVariation: (variation: Partial<Variation>) => void;
		onDeleteVariation: (variationId: string) => void;
	}

	let { group, onUpdate, onDelete, onAddVariation, onUpdateVariation, onDeleteVariation }: Props = $props();

	let isEditing = $state(false);
	let editData = $state({
		name: '',
		isRequired: true,
		minSelections: 1,
		maxSelections: 1
	});

	function startEditing() {
		editData = {
			name: group.name,
			isRequired: group.isRequired,
			minSelections: group.minSelections,
			maxSelections: group.maxSelections
		};
		isEditing = true;
	}

	function handleSave() {
		onUpdate({
			id: group.id,
			...editData
		});
		isEditing = false;
	}

	function handleCancel() {
		isEditing = false;
	}
</script>

<div class="bg-white rounded-xl border border-gray-200 p-6">
	{#if isEditing}
		<div class="space-y-4">
			<div>
				<label for="group-name-{group.id}" class="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
				<Input
					id="group-name-{group.id}"
					type="text"
					bind:value={editData.name}
					placeholder="e.g., Protein Choice"
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="group-min-{group.id}" class="block text-sm font-medium text-gray-700 mb-1">Min Selections</label>
					<Input
						id="group-min-{group.id}"
						type="number"
						bind:value={() => editData.minSelections.toString(), (v) => editData.minSelections = parseInt(v) || 0}
						min="0"
					/>
				</div>
				<div>
					<label for="group-max-{group.id}" class="block text-sm font-medium text-gray-700 mb-1">Max Selections</label>
					<Input
						id="group-max-{group.id}"
						type="number"
						bind:value={() => editData.maxSelections.toString(), (v) => editData.maxSelections = parseInt(v) || 1}
						min="1"
					/>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="group-required-{group.id}"
					bind:checked={editData.isRequired}
					class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
				/>
				<label for="group-required-{group.id}" class="text-sm font-medium text-gray-700">Required</label>
			</div>
			<div class="flex gap-2 justify-end">
				<Button type="button" variant="secondary" size="sm" onclick={handleCancel}>Cancel</Button>
				<Button type="button" size="sm" onclick={handleSave}>Save</Button>
			</div>
		</div>
	{:else}
		<div class="flex items-start justify-between mb-4">
			<div>
				<h3 class="text-lg font-semibold text-gray-900">{group.name}</h3>
				<p class="text-sm text-gray-500">
					{group.isRequired ? 'Required' : 'Optional'} • 
					Select {group.minSelections}-{group.maxSelections}
				</p>
			</div>
			<div class="flex gap-2">
			<Button type="button" variant="secondary" size="sm" onclick={startEditing}>
				Edit
			</Button>
				<Button type="button" variant="danger" size="sm" onclick={onDelete}>
					Delete
				</Button>
			</div>
		</div>

		<div class="border-t border-gray-100 pt-4">
			<div class="flex items-center justify-between mb-3">
				<h4 class="text-sm font-medium text-gray-700">Variations</h4>
				<Button type="button" variant="secondary" size="sm" onclick={onAddVariation}>
					<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Add Variation
				</Button>
			</div>

			{#if group.variations.length === 0}
				<p class="text-sm text-gray-500 italic">No variations added yet</p>
			{:else}
				<div class="space-y-2">
					{#each group.variations as variation (variation.id)}
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div class="flex items-center gap-3">
								{#if variation.isDefault}
									<span class="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
										Default
									</span>
								{/if}
								<span class="font-medium text-gray-900">{variation.name}</span>
								{#if variation.priceAdjustment !== 0}
									<span class="text-sm text-gray-600">
										{variation.priceAdjustment > 0 ? '+' : ''}{formatPrice(variation.priceAdjustment)}
									</span>
								{/if}
							</div>
							<div class="flex gap-2">
								<button
									type="button"
									class="text-sm text-primary-600 hover:text-primary-700"
									onclick={() => onUpdateVariation(variation)}
								>
									Edit
								</button>
								<button
									type="button"
									class="text-sm text-error-600 hover:text-error-700"
									onclick={() => onDeleteVariation(variation.id)}
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
