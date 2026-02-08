<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ModifierGroup, Modifier } from '$lib/server/db/schema';

	interface Props {
		group: ModifierGroup & { modifiers: Modifier[] };
		onUpdate: (group: Partial<ModifierGroup>) => void;
		onDelete: () => void;
		onAddModifier: () => void;
		onUpdateModifier: (modifier: Modifier) => void;
		onDeleteModifier: (modifierId: string) => void;
	}

	let { group, onUpdate, onDelete, onAddModifier, onUpdateModifier, onDeleteModifier }: Props = $props();

	let isEditing = $state(false);
	let editData = $state({
		name: '',
		minSelections: 0,
		maxSelections: null as number | null
	});

	function startEditing() {
		editData = {
			name: group.name,
			minSelections: group.minSelections,
			maxSelections: group.maxSelections
		};
		isEditing = true;
	}

	function handleSave() {
		onUpdate({
			id: group.id,
			name: editData.name,
			minSelections: editData.minSelections,
			maxSelections: editData.maxSelections
		});
		isEditing = false;
	}

	function handleCancel() {
		isEditing = false;
	}

	function handleMaxSelectionsChange(v: string) {
		const num = parseInt(v);
		editData.maxSelections = isNaN(num) || num === 0 ? null : num;
	}
</script>

<div class="bg-white rounded-xl border border-gray-200 p-6">
	{#if isEditing}
		<div class="space-y-4">
			<div>
				<label for="mod-group-name-{group.id}" class="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
				<Input
					id="mod-group-name-{group.id}"
					type="text"
					bind:value={editData.name}
					placeholder="e.g., Extra Toppings"
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="mod-group-min-{group.id}" class="block text-sm font-medium text-gray-700 mb-1">Min Selections</label>
					<Input
						id="mod-group-min-{group.id}"
						type="number"
						bind:value={() => editData.minSelections.toString(), (v) => editData.minSelections = parseInt(v) || 0}
						min="0"
					/>
				</div>
				<div>
					<label for="mod-group-max-{group.id}" class="block text-sm font-medium text-gray-700 mb-1">Max Selections (0 = unlimited)</label>
					<Input
						id="mod-group-max-{group.id}"
						type="number"
						bind:value={() => editData.maxSelections?.toString() ?? '', handleMaxSelectionsChange}
						min="0"
					/>
				</div>
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
					Select {group.minSelections}-{group.maxSelections ?? 'unlimited'}
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
				<h4 class="text-sm font-medium text-gray-700">Modifiers</h4>
				<Button type="button" variant="secondary" size="sm" onclick={onAddModifier}>
					<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Add Modifier
				</Button>
			</div>

			{#if group.modifiers.length === 0}
				<p class="text-sm text-gray-500 italic">No modifiers added yet</p>
			{:else}
				<div class="space-y-2">
					{#each group.modifiers as modifier (modifier.id)}
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div class="flex items-center gap-3">
								<span class="font-medium text-gray-900">{modifier.name}</span>
								<span class="text-sm text-gray-600">${modifier.price.toFixed(2)}</span>
								{#if !modifier.isAvailable}
									<span class="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
										Unavailable
									</span>
								{/if}
							</div>
							<div class="flex gap-2">
								<button
									type="button"
									class="text-sm text-primary-600 hover:text-primary-700"
									onclick={() => onUpdateModifier(modifier)}
								>
									Edit
								</button>
								<button
									type="button"
									class="text-sm text-error-600 hover:text-error-700"
									onclick={() => onDeleteModifier(modifier.id)}
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
