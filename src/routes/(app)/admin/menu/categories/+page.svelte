<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { ActionData as ParentActionData } from '../$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import type { CategoryWithCount } from '$lib/types/orders';

	let { data, form }: { data: PageData; form: ParentActionData } = $props();

	let showAddModal: boolean = $state(false);
	let showEditModal: boolean = $state(false);
	let showDeleteModal: boolean = $state(false);

	let selectedCategory: CategoryWithCount | null = $state(null);

	let formData = $state({
		id: '',
		name: '',
		displayOrder: ''
	});

	function handleFormSuccess() {
		closeAllModals();
		invalidateAll();
	}

	function openAddModal() {
		const maxOrder = Math.max(...data.categories.map((c) => c.displayOrder), 0);
		formData = {
			id: '',
			name: '',
			displayOrder: (maxOrder + 1).toString()
		};
		showAddModal = true;
	}

	function openEditModal(category: CategoryWithCount) {
		selectedCategory = category;
		formData = {
			id: category.id,
			name: category.name,
			displayOrder: category.displayOrder.toString()
		};
		showEditModal = true;
	}

	function openDeleteModal(category: CategoryWithCount) {
		selectedCategory = category;
		showDeleteModal = true;
	}

	function closeAllModals() {
		showAddModal = false;
		showEditModal = false;
		showDeleteModal = false;
		selectedCategory = null;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
		<p class="text-gray-600">Manage your menu categories</p>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<div class="mb-6 flex justify-end">
			<Button onclick={openAddModal}>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add Category
			</Button>
		</div>

		{#if data.categories.length === 0}
			<div class="text-center py-12 text-gray-500">No categories yet. Add your first category!</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-2">
				{#each data.categories as category (category.id)}
					<CategoryCard
						{category}
						onedit={openEditModal}
						ondelete={openDeleteModal}
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

<Modal title="Add Category" open={showAddModal} onclose={closeAllModals}>
	<form method="POST" action="/admin/menu?/addCategory" use:enhance={handleFormSuccess}>
		<div class="space-y-4">
			<Input id="cat-name" name="name" type="text" placeholder="Category name" required bind:value={formData.name} />
			<Input
				id="cat-displayOrder"
				name="displayOrder"
				type="number"
				placeholder="Display order"
				bind:value={formData.displayOrder}
			/>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit">Add Category</Button>
			</div>
		</div>
	</form>
</Modal>

<Modal title="Edit Category" open={showEditModal} onclose={closeAllModals}>
	<form method="POST" action="/admin/menu?/updateCategory" use:enhance={handleFormSuccess}>
		<input type="hidden" name="id" value={formData.id} />
		<div class="space-y-4">
			<Input id="edit-cat-name" name="name" type="text" placeholder="Category name" required bind:value={formData.name} />
			<Input
				id="edit-cat-displayOrder"
				name="displayOrder"
				type="number"
				placeholder="Display order"
				required
				bind:value={formData.displayOrder}
			/>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit">Update Category</Button>
			</div>
		</div>
	</form>
</Modal>

<Modal title="Delete Category" open={showDeleteModal} onclose={closeAllModals}>
	<form method="POST" action="/admin/menu?/deleteCategory" use:enhance={handleFormSuccess}>
		<input type="hidden" name="id" value={selectedCategory?.id} />
		<p class="text-gray-700 mb-6">
			Are you sure you want to delete "<strong>{selectedCategory?.name}</strong>"? This action cannot be undone.
		</p>
		<div class="flex gap-3 justify-end">
			<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
			<Button type="submit" variant="danger">Delete</Button>
		</div>
	</form>
</Modal>
