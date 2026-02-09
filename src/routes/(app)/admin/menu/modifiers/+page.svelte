<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { ActionData as ParentActionData } from '../$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ModifierGroupEditor from '$lib/components/admin/ModifierGroupEditor.svelte';
	import ModifierEditor from '$lib/components/admin/ModifierEditor.svelte';
	import type { ModifierGroup, Modifier } from '$lib/server/db/schema';

	let { data, form }: { data: PageData; form: ParentActionData } = $props();

	let showAddGroupModal: boolean = $state(false);
	let showModifierEditorModal: boolean = $state(false);

	let selectedModifierGroup: (ModifierGroup & { modifiers: Modifier[] }) | null = $state(null);
	let selectedModifier: Modifier | null = $state(null);

	let groupFormData = $state({
		id: '',
		name: '',
		minSelections: 0,
		maxSelections: ''
	});

	function handleFormSuccess() {
		closeAllModals();
		invalidateAll();
	}

	function openAddGroupModal() {
		groupFormData = {
			id: '',
			name: '',
			minSelections: 0,
			maxSelections: ''
		};
		showAddGroupModal = true;
	}

	function openModifierEditor(group: ModifierGroup & { modifiers: Modifier[] }, modifier?: Modifier) {
		selectedModifierGroup = group;
		selectedModifier = modifier || null;
		showModifierEditorModal = true;
	}

	function closeAllModals() {
		showAddGroupModal = false;
		showModifierEditorModal = false;
		selectedModifierGroup = null;
		selectedModifier = null;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Modifiers</h1>
		<p class="text-gray-600">Create and manage modifier groups</p>
	</div>

	<div class="space-y-6">
		<div class="mb-6 flex justify-end">
			<Button onclick={openAddGroupModal}>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add Modifier Group
			</Button>
		</div>

		{#if data.modifierGroups.length === 0}
			<div class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
				<p>No modifier groups yet. Create your first group to add modifiers!</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each data.modifierGroups as group (group.id)}
					<ModifierGroupEditor
						{group}
						onUpdate={(data) => {
							const form = new FormData();
							form.append('id', data.id || group.id);
							form.append('name', data.name || group.name);
							form.append('minSelections', String(data.minSelections ?? group.minSelections));
							form.append('maxSelections', data.maxSelections?.toString() ?? '');
							
							fetch('/admin/menu?/updateModifierGroup', {
								method: 'POST',
								body: form
							}).then(() => invalidateAll());
						}}
						onDelete={() => {
							const form = new FormData();
							form.append('id', group.id);
							fetch('/admin/menu?/deleteModifierGroup', {
								method: 'POST',
								body: form
							}).then(() => invalidateAll());
						}}
						onAddModifier={() => openModifierEditor(group)}
						onUpdateModifier={(modifier: Modifier) => openModifierEditor(group, modifier)}
						onDeleteModifier={(modifierId: string) => {
							const form = new FormData();
							form.append('id', modifierId);
							fetch('/admin/menu?/deleteModifier', {
								method: 'POST',
								body: form
							}).then(() => invalidateAll());
						}}
					/>
				{/each}
			</div>
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

<!-- Add Modifier Group Modal -->
<Modal title="Add Modifier Group" open={showAddGroupModal} onclose={closeAllModals}>
	<form method="POST" action="/admin/menu?/addModifierGroup" use:enhance={handleFormSuccess}>
		<div class="space-y-4">
			<div>
				<label for="mod-group-name" class="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
				<Input
					id="mod-group-name"
					name="name"
					type="text"
					placeholder="e.g., Extra Toppings"
					required
					bind:value={groupFormData.name}
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="mod-group-min" class="block text-sm font-medium text-gray-700 mb-1">Min Selections</label>
					<Input
						id="mod-group-min"
						name="minSelections"
						type="number"
						bind:value={() => groupFormData.minSelections.toString(), (v) => groupFormData.minSelections = parseInt(v) || 0}
						min="0"
					/>
				</div>
				<div>
					<label for="mod-group-max" class="block text-sm font-medium text-gray-700 mb-1">Max Selections (0 = unlimited)</label>
					<Input
						id="mod-group-max"
						name="maxSelections"
						type="number"
						bind:value={groupFormData.maxSelections}
						min="0"
					/>
				</div>
			</div>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit">Add Group</Button>
			</div>
		</div>
	</form>
</Modal>

<!-- Modifier Editor Modal -->
<ModifierEditor
	open={showModifierEditorModal}
	modifier={selectedModifier}
	onSave={(data) => {
		const form = new FormData();
		if (data.id) form.append('id', data.id);
		form.append('groupId', selectedModifierGroup?.id || '');
		form.append('name', data.name);
		form.append('price', String(data.price));
		form.append('isAvailable', String(data.isAvailable));
		form.append('displayOrder', String(data.displayOrder));
		
		const action = data.id ? 'updateModifier' : 'addModifier';
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
