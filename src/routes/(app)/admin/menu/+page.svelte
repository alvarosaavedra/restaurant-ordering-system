<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import MenuItemCard from '$lib/components/MenuItemCard.svelte';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import VariationGroupEditor from '$lib/components/admin/VariationGroupEditor.svelte';
	import VariationEditor from '$lib/components/admin/VariationEditor.svelte';
	import type { MenuItemWithCategory, CategoryWithCount } from '$lib/types/orders';
	import type { VariationGroup, Variation } from '$lib/server/db/schema';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type AdminTab = 'menu-items' | 'categories' | 'variations';

	let currentTab: AdminTab = $state('menu-items');
	let searchQuery: string = $state('');

	let showAddMenuItemModal: boolean = $state(false);
	let showEditMenuItemModal: boolean = $state(false);
	let showDeleteMenuItemModal: boolean = $state(false);
	let showAddCategoryModal: boolean = $state(false);
	let showEditCategoryModal: boolean = $state(false);
	let showDeleteCategoryModal: boolean = $state(false);
	let showAddVariationGroupModal: boolean = $state(false);
	let showVariationEditorModal: boolean = $state(false);

	let selectedMenuItem: MenuItemWithCategory | null = $state(null);
	let selectedCategory: CategoryWithCount | null = $state(null);
	let selectedVariationGroup: (VariationGroup & { variations: Variation[] }) | null = $state(null);
	let selectedVariation: Variation | null = $state(null);
	let variationGroupMenuItemId: string = $state('');

	let menuItemFormData = $state({
		id: '',
		name: '',
		description: '',
		price: '',
		categoryId: '',
		isAvailable: true
	});

	let categoryFormData = $state({
		id: '',
		name: '',
		displayOrder: ''
	});

	let variationGroupFormData = $state({
		id: '',
		name: '',
		isRequired: true,
		minSelections: 1,
		maxSelections: 1
	});

	let filteredMenuItems = $derived.by(() => {
		if (!searchQuery.trim()) return data.menuItems;
		const query = searchQuery.toLowerCase();
		return data.menuItems.filter(
			(item) =>
				item.name.toLowerCase().includes(query) ||
				item.description?.toLowerCase().includes(query) ||
				item.category?.name.toLowerCase().includes(query)
		);
	});

	$effect(() => {
		if (form?.message) {
			closeAllModals();
		}
	});

	function handleFormSuccess() {
		closeAllModals();
		invalidateAll();
	}

	function openAddMenuItemModal() {
		menuItemFormData = {
			id: '',
			name: '',
			description: '',
			price: '',
			categoryId: '',
			isAvailable: true
		};
		showAddMenuItemModal = true;
	}

	function openEditMenuItemModal(item: MenuItemWithCategory) {
		selectedMenuItem = item;
		menuItemFormData = {
			id: item.id,
			name: item.name,
			description: item.description || '',
			price: item.price.toString(),
			categoryId: item.categoryId,
			isAvailable: item.isAvailable
		};
		showEditMenuItemModal = true;
	}

	function openDeleteMenuItemModal(item: MenuItemWithCategory) {
		selectedMenuItem = item;
		showDeleteMenuItemModal = true;
	}

	function openAddCategoryModal() {
		const maxOrder = Math.max(...data.categories.map((c) => c.displayOrder), 0);
		categoryFormData = {
			id: '',
			name: '',
			displayOrder: (maxOrder + 1).toString()
		};
		showAddCategoryModal = true;
	}

	function openEditCategoryModal(category: CategoryWithCount) {
		selectedCategory = category;
		categoryFormData = {
			id: category.id,
			name: category.name,
			displayOrder: category.displayOrder.toString()
		};
		showEditCategoryModal = true;
	}

	function openDeleteCategoryModal(category: CategoryWithCount) {
		selectedCategory = category;
		showDeleteCategoryModal = true;
	}

	function openAddVariationGroupModal(menuItemId: string) {
		variationGroupMenuItemId = menuItemId;
		variationGroupFormData = {
			id: '',
			name: '',
			isRequired: true,
			minSelections: 1,
			maxSelections: 1
		};
		showAddVariationGroupModal = true;
	}

	function openVariationEditor(group: VariationGroup & { variations: Variation[] }, variation?: Variation) {
		selectedVariationGroup = group;
		selectedVariation = variation || null;
		showVariationEditorModal = true;
	}

	function closeAllModals() {
		showAddMenuItemModal = false;
		showEditMenuItemModal = false;
		showDeleteMenuItemModal = false;
		showAddCategoryModal = false;
		showEditCategoryModal = false;
		showDeleteCategoryModal = false;
		showAddVariationGroupModal = false;
		showVariationEditorModal = false;
		selectedMenuItem = null;
		selectedCategory = null;
		selectedVariationGroup = null;
		selectedVariation = null;
	}

	let categoryOptions = $derived.by(() =>
		data.categories.map((c) => ({ value: c.id, label: c.name }))
	);
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
			<p class="text-gray-600">Manage your restaurant's menu items and categories</p>
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

	<div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
		<div class="flex border-b border-gray-200">
			<button
				class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {currentTab === 'menu-items'
					? 'border-primary-600 text-primary-700'
					: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				onclick={() => (currentTab = 'menu-items')}
				aria-current={currentTab === 'menu-items' ? 'page' : undefined}
				role="tab"
			>
				Menu Items
			</button>
			<button
				class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {currentTab === 'categories'
					? 'border-primary-600 text-primary-700'
					: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				onclick={() => (currentTab = 'categories')}
				aria-current={currentTab === 'categories' ? 'page' : undefined}
				role="tab"
			>
				Categories
			</button>
			<button
				class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {currentTab === 'variations'
					? 'border-primary-600 text-primary-700'
					: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				onclick={() => (currentTab = 'variations')}
				aria-current={currentTab === 'variations' ? 'page' : undefined}
				role="tab"
			>
				Variations
			</button>
		</div>

		<div class="p-6">
			{#if currentTab === 'menu-items'}
				<div class="mb-6 flex items-center justify-between gap-4">
					<Input
						id="search"
						type="text"
						placeholder="Search menu items..."
						bind:value={searchQuery}
						class="max-w-md"
						aria-label="Search menu items"
					/>
					<Button onclick={openAddMenuItemModal}>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Add Menu Item
					</Button>
				</div>

				{#if filteredMenuItems.length === 0}
					<div class="text-center py-12 text-gray-500">
						{searchQuery ? 'No menu items found matching your search.' : 'No menu items yet. Add your first item!'}
					</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each filteredMenuItems as item (item.id)}
							<MenuItemCard {item} onedit={openEditMenuItemModal} ondelete={openDeleteMenuItemModal} />
						{/each}
					</div>
				{/if}
			{:else if currentTab === 'categories'}
				<div class="mb-6 flex justify-end">
					<Button onclick={openAddCategoryModal}>
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
								onedit={openEditCategoryModal}
								ondelete={openDeleteCategoryModal}
							/>
						{/each}
					</div>
				{/if}
			{:else if currentTab === 'variations'}
				<div class="space-y-6">
					{#if data.menuItems.length === 0}
						<div class="text-center py-12 text-gray-500">
							No menu items yet. Add menu items first to configure variations.
						</div>
					{:else}
						{#each data.menuItems as item (item.id)}
							<div class="bg-white rounded-xl border border-gray-200 p-6">
								<div class="flex items-center justify-between mb-4">
									<div>
										<h3 class="text-lg font-semibold text-gray-900">{item.name}</h3>
										<p class="text-sm text-gray-500">{item.category?.name || 'No category'} • ${item.price.toFixed(2)}</p>
									</div>
								<Button 
									size="sm" 
									onclick={() => openAddVariationGroupModal(item.id)}
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
												
												fetch('?/updateVariationGroup', {
													method: 'POST',
													body: form
												}).then(() => invalidateAll());
											}}
											onDelete={() => {
												const form = new FormData();
												form.append('id', group.id);
												fetch('?/deleteVariationGroup', {
													method: 'POST',
													body: form
												}).then(() => invalidateAll());
											}}
											onAddVariation={() => openVariationEditor(group)}
											onUpdateVariation={(variation) => openVariationEditor(group, variation as Variation)}
											onDeleteVariation={(variationId) => {
												const form = new FormData();
												form.append('id', variationId);
												fetch('?/deleteVariation', {
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

	<Modal title="Add Menu Item" open={showAddMenuItemModal} onclose={closeAllModals}>
		<form method="POST" action="?/addMenuItem" use:enhance={handleFormSuccess}>
			<div class="space-y-4">
				<Input id="name" name="name" type="text" placeholder="Item name" required bind:value={menuItemFormData.name} />
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
					<textarea
						id="description"
						name="description"
						rows="3"
						class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px]"
						placeholder="Item description (optional)"
						bind:value={menuItemFormData.description}
					></textarea>
				</div>
				<Input
					id="price"
					name="price"
					type="number"
					step="0.01"
					placeholder="0.00"
					required
					bind:value={menuItemFormData.price}
				/>
				<Select
					id="categoryId"
					name="categoryId"
					options={categoryOptions}
					placeholder="Select category"
					required
					bind:value={menuItemFormData.categoryId}
				/>
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="isAvailable"
						name="isAvailable"
						checked={menuItemFormData.isAvailable}
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

	<Modal title="Edit Menu Item" open={showEditMenuItemModal} onclose={closeAllModals}>
		<form method="POST" action="?/updateMenuItem" use:enhance={handleFormSuccess}>
			<input type="hidden" name="id" value={menuItemFormData.id} />
			<div class="space-y-4">
				<Input id="edit-name" name="name" type="text" placeholder="Item name" required bind:value={menuItemFormData.name} />
				<div>
					<label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1"
						>Description</label
					>
					<textarea
						id="edit-description"
						name="description"
						rows="3"
						class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px]"
						placeholder="Item description (optional)"
						bind:value={menuItemFormData.description}
					></textarea>
				</div>
				<Input
					id="edit-price"
					name="price"
					type="number"
					step="0.01"
					placeholder="0.00"
					required
					bind:value={menuItemFormData.price}
				/>
				<Select
					id="edit-categoryId"
					name="categoryId"
					options={categoryOptions}
					placeholder="Select category"
					required
					bind:value={menuItemFormData.categoryId}
				/>
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="edit-isAvailable"
						name="isAvailable"
						checked={menuItemFormData.isAvailable}
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

	<Modal title="Delete Menu Item" open={showDeleteMenuItemModal} onclose={closeAllModals}>
		<form method="POST" action="?/deleteMenuItem" use:enhance={handleFormSuccess}>
			<input type="hidden" name="id" value={selectedMenuItem?.id} />
			<p class="text-gray-700 mb-6">
				Are you sure you want to delete "<strong>{selectedMenuItem?.name}</strong>"? This action cannot be undone.
			</p>
			<div class="flex gap-3 justify-end">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit" variant="danger">Delete</Button>
			</div>
		</form>
	</Modal>

	<Modal title="Add Category" open={showAddCategoryModal} onclose={closeAllModals}>
		<form method="POST" action="?/addCategory" use:enhance={handleFormSuccess}>
			<div class="space-y-4">
				<Input id="cat-name" name="name" type="text" placeholder="Category name" required bind:value={categoryFormData.name} />
				<Input
					id="cat-displayOrder"
					name="displayOrder"
					type="number"
					placeholder="Display order"
					bind:value={categoryFormData.displayOrder}
				/>
				<div class="flex gap-3 pt-4">
					<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
					<Button type="submit">Add Category</Button>
				</div>
			</div>
		</form>
	</Modal>

	<Modal title="Edit Category" open={showEditCategoryModal} onclose={closeAllModals}>
		<form method="POST" action="?/updateCategory" use:enhance={handleFormSuccess}>
			<input type="hidden" name="id" value={categoryFormData.id} />
			<div class="space-y-4">
				<Input id="edit-cat-name" name="name" type="text" placeholder="Category name" required bind:value={categoryFormData.name} />
				<Input
					id="edit-cat-displayOrder"
					name="displayOrder"
					type="number"
					placeholder="Display order"
					required
					bind:value={categoryFormData.displayOrder}
				/>
				<div class="flex gap-3 pt-4">
					<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
					<Button type="submit">Update Category</Button>
				</div>
			</div>
		</form>
	</Modal>

	<Modal title="Delete Category" open={showDeleteCategoryModal} onclose={closeAllModals}>
		<form method="POST" action="?/deleteCategory" use:enhance={handleFormSuccess}>
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

	<!-- Variation Group Modal -->
	<Modal title="Add Variation Group" open={showAddVariationGroupModal} onclose={closeAllModals}>
		<form method="POST" action="?/addVariationGroup" use:enhance={handleFormSuccess}>
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
						bind:value={variationGroupFormData.name}
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="vg-min" class="block text-sm font-medium text-gray-700 mb-1">Min Selections</label>
						<Input
							id="vg-min"
							name="minSelections"
							type="number"
							bind:value={() => variationGroupFormData.minSelections.toString(), (v) => variationGroupFormData.minSelections = parseInt(v) || 0}
							min="0"
						/>
					</div>
					<div>
						<label for="vg-max" class="block text-sm font-medium text-gray-700 mb-1">Max Selections</label>
						<Input
							id="vg-max"
							name="maxSelections"
							type="number"
							bind:value={() => variationGroupFormData.maxSelections.toString(), (v) => variationGroupFormData.maxSelections = parseInt(v) || 1}
							min="1"
						/>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="vg-required"
						name="isRequired"
						checked={variationGroupFormData.isRequired}
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
			fetch(`?/${action}`, {
				method: 'POST',
				body: form
			}).then(() => {
				closeAllModals();
				invalidateAll();
			});
		}}
		onClose={closeAllModals}
	/>
</div>
