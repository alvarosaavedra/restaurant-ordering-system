<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { ActionData as ParentActionData } from '../$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import MenuItemCard from '$lib/components/MenuItemCard.svelte';
	import type { MenuItemWithCategory } from '$lib/types/orders';

	let { data, form }: { data: PageData; form: ParentActionData } = $props();

	let searchQuery: string = $state('');
	let showAddModal: boolean = $state(false);
	let showEditModal: boolean = $state(false);
	let showDeleteModal: boolean = $state(false);

	let selectedItem: MenuItemWithCategory | null = $state(null);

	let formData = $state({
		id: '',
		name: '',
		description: '',
		price: '',
		categoryId: '',
		isAvailable: true
	});

	let filteredItems = $derived.by(() => {
		if (!searchQuery.trim()) return data.menuItems;
		const query = searchQuery.toLowerCase();
		return data.menuItems.filter(
			(item) =>
				item.name.toLowerCase().includes(query) ||
				item.description?.toLowerCase().includes(query) ||
				item.category?.name.toLowerCase().includes(query)
		);
	});

	let categoryOptions = $derived.by(() =>
		data.categories.map((c) => ({ value: c.id, label: c.name }))
	);

	function handleFormSuccess() {
		closeAllModals();
		invalidateAll();
	}

	function openAddModal() {
		formData = {
			id: '',
			name: '',
			description: '',
			price: '',
			categoryId: '',
			isAvailable: true
		};
		showAddModal = true;
	}

	function openEditModal(item: MenuItemWithCategory) {
		selectedItem = item;
		formData = {
			id: item.id,
			name: item.name,
			description: item.description || '',
			price: item.price.toString(),
			categoryId: item.categoryId,
			isAvailable: item.isAvailable
		};
		showEditModal = true;
	}

	function openDeleteModal(item: MenuItemWithCategory) {
		selectedItem = item;
		showDeleteModal = true;
	}

	function closeAllModals() {
		showAddModal = false;
		showEditModal = false;
		showDeleteModal = false;
		selectedItem = null;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Menu Items</h1>
			<p class="text-gray-600">Manage your restaurant's menu items</p>
		</div>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/admin/menu/share">
			<Button variant="secondary">
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
				</svg>
				Share Menu
			</Button>
		</a>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<div class="mb-6 flex items-center justify-between gap-4">
			<Input
				id="search"
				type="text"
				placeholder="Search menu items..."
				bind:value={searchQuery}
				class="max-w-md"
				aria-label="Search menu items"
			/>
			<Button onclick={openAddModal}>
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add Menu Item
			</Button>
		</div>

		{#if filteredItems.length === 0}
			<div class="text-center py-12 text-gray-500">
				{searchQuery ? 'No menu items found matching your search.' : 'No menu items yet. Add your first item!'}
			</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredItems as item (item.id)}
					<MenuItemCard {item} onedit={openEditModal} ondelete={openDeleteModal} />
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

<Modal title="Add Menu Item" open={showAddModal} onclose={closeAllModals}>
	<form method="POST" action="/admin/menu?/addMenuItem" use:enhance={handleFormSuccess}>
		<div class="space-y-4">
			<Input id="name" name="name" type="text" placeholder="Item name" required bind:value={formData.name} />
			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
				<textarea
					id="description"
					name="description"
					rows="3"
					class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px]"
					placeholder="Item description (optional)"
					bind:value={formData.description}
				></textarea>
			</div>
			<Input
				id="price"
				name="price"
				type="number"
				step="0.01"
				placeholder="0.00"
				required
				bind:value={formData.price}
			/>
			<Select
				id="categoryId"
				name="categoryId"
				options={categoryOptions}
				placeholder="Select category"
				required
				bind:value={formData.categoryId}
			/>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="isAvailable"
					name="isAvailable"
					checked={formData.isAvailable}
					value="true"
					class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
				/>
				<label for="isAvailable" class="text-sm font-medium text-gray-700">Available</label>
			</div>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit">Add Menu Item</Button>
			</div>
		</div>
	</form>
</Modal>

<Modal title="Edit Menu Item" open={showEditModal} onclose={closeAllModals}>
	<form method="POST" action="/admin/menu?/updateMenuItem" use:enhance={handleFormSuccess}>
		<input type="hidden" name="id" value={formData.id} />
		<div class="space-y-4">
			<Input id="edit-name" name="name" type="text" placeholder="Item name" required bind:value={formData.name} />
			<div>
				<label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
				<textarea
					id="edit-description"
					name="description"
					rows="3"
					class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px]"
					placeholder="Item description (optional)"
					bind:value={formData.description}
				></textarea>
			</div>
			<Input
				id="edit-price"
				name="price"
				type="number"
				step="0.01"
				placeholder="0.00"
				required
				bind:value={formData.price}
			/>
			<Select
				id="edit-categoryId"
				name="categoryId"
				options={categoryOptions}
				placeholder="Select category"
				required
				bind:value={formData.categoryId}
			/>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="edit-isAvailable"
					name="isAvailable"
					checked={formData.isAvailable}
					value="true"
					class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
				/>
				<label for="edit-isAvailable" class="text-sm font-medium text-gray-700">Available</label>
			</div>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit">Update Menu Item</Button>
			</div>
		</div>
	</form>
</Modal>

<Modal title="Delete Menu Item" open={showDeleteModal} onclose={closeAllModals}>
	<form method="POST" action="/admin/menu?/deleteMenuItem" use:enhance={handleFormSuccess}>
		<input type="hidden" name="id" value={selectedItem?.id} />
		<p class="text-gray-700 mb-6">
			Are you sure you want to delete "<strong>{selectedItem?.name}</strong>"? This action cannot be undone.
		</p>
		<div class="flex gap-3 justify-end">
			<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
			<Button type="submit" variant="danger">Delete</Button>
		</div>
	</form>
</Modal>
