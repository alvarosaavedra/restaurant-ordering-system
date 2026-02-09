<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import type { ActionData as ParentActionData } from '../$types';

	let { data, form }: { data: PageData; form: ParentActionData } = $props();
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
		<p class="text-gray-600">Assign modifier groups to menu items</p>
	</div>

	<div class="space-y-6">
		{#if data.menuItems.length === 0}
			<div class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
				<p>No menu items yet. Add menu items first to assign modifiers.</p>
			</div>
		{:else if data.modifierGroups.length === 0}
			<div class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
				<p>No modifier groups yet. Create modifier groups first.</p>
			</div>
		{:else}
			{#each data.menuItems as item (item.id)}
				{@const itemAssignments = data.assignments?.filter((a) => a.menuItemId === item.id) || []}
				{@const assignedGroupIds = itemAssignments.map((a) => a.modifierGroupId)}
				{@const availableGroups = data.modifierGroups.filter((mg) => !assignedGroupIds.includes(mg.id))}
				<div class="bg-white rounded-xl border border-gray-200 p-6">
					<div class="mb-4">
						<h3 class="text-lg font-semibold text-gray-900">{item.name}</h3>
						<p class="text-sm text-gray-500">{item.category?.name || 'No category'}</p>
					</div>
					
					{#if itemAssignments.length === 0}
						<p class="text-sm text-gray-500 italic mb-3">No modifier groups assigned</p>
					{:else}
						<div class="mb-4 space-y-2">
							{#each itemAssignments as assignment (assignment.id)}
								{@const group = data.modifierGroups.find((mg) => mg.id === assignment.modifierGroupId)}
								{#if group}
									<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<span class="font-medium text-gray-900">{group.name}</span>
										<button
											type="button"
											class="text-sm text-error-600 hover:text-error-700"
											onclick={() => {
												const form = new FormData();
												form.append('id', assignment.id);
												fetch('/admin/menu?/unassignModifierGroup', {
													method: 'POST',
													body: form
												}).then(() => invalidateAll());
											}}
										>
											Remove
										</button>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
					
					{#if availableGroups.length > 0}
						<div class="border-t border-gray-100 pt-4">
							<p class="text-sm font-medium text-gray-700 mb-2">Available modifier groups:</p>
							<div class="flex flex-wrap gap-2">
								{#each availableGroups as group (group.id)}
									<button
										type="button"
										class="px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
										onclick={() => {
											const form = new FormData();
											form.append('menuItemId', item.id);
											form.append('modifierGroupId', group.id);
											form.append('isRequired', 'false');
											form.append('minSelections', '0');
											fetch('/admin/menu?/assignModifierGroup', {
												method: 'POST',
												body: form
											}).then(() => invalidateAll());
										}}
									>
										+ {group.name}
									</button>
								{/each}
							</div>
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
