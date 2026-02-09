<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { ActionData as ParentActionData } from '../$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import VariationGroupEditor from '$lib/components/admin/VariationGroupEditor.svelte';
	import VariationEditor from '$lib/components/admin/VariationEditor.svelte';
	import type { VariationGroup, Variation } from '$lib/server/db/schema';
	import { formatPrice } from '$lib/utils/formatting';

	let { data, form }: { data: PageData; form: ParentActionData } = $props();

	let showAddGroupModal: boolean = $state(false);
	let showVariationEditorModal: boolean = $state(false);

	let selectedVariationGroup: (VariationGroup & { variations: Variation[] }) | null = $state(null);
	let selectedVariation: Variation | null = $state(null);
	let variationGroupMenuItemId: string = $state('');

	let groupFormData = $state({
		id: '',
		name: '',
		isRequired: true,
		minSelections: 1,
		maxSelections: 1
	});

	function handleFormSuccess() {
		closeAllModals();
		invalidateAll();
	}

	function openAddGroupModal(menuItemId: string) {
		variationGroupMenuItemId = menuItemId;
		groupFormData = {
			id: '',
			name: '',
			isRequired: true,
			minSelections: 1,
			maxSelections: 1
		};
		showAddGroupModal = true;
	}

	function openVariationEditor(group: VariationGroup & { variations: Variation[] }, variation?: Variation) {
		selectedVariationGroup = group;
		selectedVariation = variation || null;
		showVariationEditorModal = true;
	}

	function closeAllModals() {
		showAddGroupModal = false;
		showVariationEditorModal = false;
		selectedVariationGroup = null;
		selectedVariation = null;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Variations</h1>
		<p class="text-gray-600">Configure variation groups for your menu items</p>
	</div>

	<div class="space-y-6">
		{#if data.menuItems.length === 0}
			<div class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
				No menu items yet. Add menu items first to configure variations.
			</div>
		{:else}
			{#each data.menuItems as item (item.id)}
				<div class="bg-white rounded-xl border border-gray-200 p-6">
					<div class="flex items-center justify-between mb-4">
						<div>
							<h3 class="text-lg font-semibold text-gray-900">{item.name}</h3>
							<p class="text-sm text-gray-500">{item.category?.name || 'No category'} • {formatPrice(item.price)}</p>
						</div>
						<Button 
							size="sm" 
							onclick={() => openAddGroupModal(item.id)}
						>
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							Add Group
						</Button>
					</div>
					
					{#if data.variationGroups.filter(vg => vg.menuItemId === item.id).length === 0}
						<p class="text-sm text-gray-500 italic">No variation groups configured</p>
					{:else}
						<div class="space-y-4">
							{#each data.variationGroups.filter(vg => vg.menuItemId === item.id) as group (group.id)}
								<VariationGroupEditor
									{group}
									onUpdate={(data) => {
										const form = new FormData();
										form.append('id', data.id || group.id);
										form.append('name', data.name || group.name);
										form.append('isRequired', String(data.isRequired ?? group.isRequired));
										form.append('minSelections', String(data.minSelections ?? group.minSelections));
										form.append('maxSelections', String(data.maxSelections ?? group.maxSelections));
										
										fetch('/admin/menu?/updateVariationGroup', {
											method: 'POST',
											body: form
										}).then(() => invalidateAll());
									}}
									onDelete={() => {
										const form = new FormData();
										form.append('id', group.id);
										fetch('/admin/menu?/deleteVariationGroup', {
											method: 'POST',
											body: form
										}).then(() => invalidateAll());
									}}
									onAddVariation={() => openVariationEditor(group)}
									onUpdateVariation={(variation) => openVariationEditor(group, variation as Variation)}
									onDeleteVariation={(variationId) => {
										const form = new FormData();
										form.append('id', variationId);
										fetch('/admin/menu?/deleteVariation', {
											method: 'POST',
											body: form
										}).then(() => invalidateAll());
									}}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>

{#if form?.error}
	<div class="fixed top-4 right-4 max-w-sm p-4 bg-error-50 border border-error-200 rounded-xl shadow-lg" role="alert">
		<div class="flex items-center gap-3">
			<svg class="w-5 h-5 text-error-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<p class="text-sm font-medium text-error-800">{form.error}</p>
		</div>
	</div>
{/if}

{#if form?.message}
	<div class="fixed top-4 right-4 max-w-sm p-4 bg-green-50 border border-green-200 rounded-xl shadow-lg" role="alert">
		<div class="flex items-center gap-3">
			<svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			<p class="text-sm font-medium text-green-800">{form.message}</p>
		</div>
	</div>
{/if}

<!-- Variation Group Modal -->
<Modal title="Add Variation Group" open={showAddGroupModal} onclose={closeAllModals}>
	<form method="POST" action="/admin/menu?/addVariationGroup" use:enhance={handleFormSuccess}>
		<input type="hidden" name="menuItemId" value={variationGroupMenuItemId} />
		<div class="space-y-4">
			<div>
				<label for="vg-name" class="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
				<Input
					id="vg-name"
					name="name"
					type="text"
					placeholder="e.g., Protein Choice"
					required
					bind:value={groupFormData.name}
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="vg-min" class="block text-sm font-medium text-gray-700 mb-1">Min Selections</label>
					<Input
						id="vg-min"
						name="minSelections"
						type="number"
						bind:value={() => groupFormData.minSelections.toString(), (v) => groupFormData.minSelections = parseInt(v) || 0}
						min="0"
					/>
				</div>
				<div>
					<label for="vg-max" class="block text-sm font-medium text-gray-700 mb-1">Max Selections</label>
					<Input
						id="vg-max"
						name="maxSelections"
						type="number"
						bind:value={() => groupFormData.maxSelections.toString(), (v) => groupFormData.maxSelections = parseInt(v) || 1}
						min="1"
					/>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="vg-required"
					name="isRequired"
					checked={groupFormData.isRequired}
					value="true"
					class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
				/>
				<label for="vg-required" class="text-sm font-medium text-gray-700">Required</label>
			</div>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit">Add Group</Button>
			</div>
		</div>
	</form>
</Modal>

<!-- Variation Editor Modal -->
<VariationEditor
	open={showVariationEditorModal}
	variation={selectedVariation}
	onSave={(data) => {
		const form = new FormData();
		if (data.id) form.append('id', data.id);
		form.append('groupId', selectedVariationGroup?.id || '');
		form.append('name', data.name);
		form.append('priceAdjustment', String(data.priceAdjustment));
		form.append('isDefault', String(data.isDefault));
		form.append('displayOrder', String(data.displayOrder));
		
		const action = data.id ? 'updateVariation' : 'addVariation';
		fetch(`/admin/menu?/${action}`, {
			method: 'POST',
			body: form
		}).then(() => {
			closeAllModals();
			invalidateAll();
		});
	}}
	onClose={closeAllModals}
/>
