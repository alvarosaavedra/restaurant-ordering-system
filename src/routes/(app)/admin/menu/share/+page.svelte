<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import Button from '$lib/components/ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatting';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface MenuItem {
		id: string;
		categoryId: string;
		name: string;
		description: string | null;
		price: number;
		isAvailable: boolean;
	}

	interface CategoryWithItems {
		id: string;
		name: string;
		displayOrder: number;
		items: MenuItem[];
	}

	const categories: CategoryWithItems[] = $derived(data.categories);

	const itemEmojis = ['🍕', '🍔', '🥗', '🍝', '🍰', '🥤', '🌮', '🍜', '🥪', '🍟', '🍱', '🥘', '🍛', '🥙', '🌯'];

	let selectedItems = new SvelteSet<string>();
	let expandedCategories = new SvelteSet<string>();
	let copied = $state(false);
	let shared = $state(false);

	$effect(() => {
		if (categories.length > 0 && expandedCategories.size === 0) {
			categories.forEach(c => expandedCategories.add(c.id));
		}
	});

	let selectedCount = $derived(selectedItems.size);

	let formattedText = $derived.by(() => {
		if (selectedCount === 0) {
			return '🍴✨ Select items to share your menu! ✨🍴';
		}

		const lines: string[] = ['🍴✨ Our Delicious Menu ✨🍴', ''];
		let emojiIndex = 0;

		for (const category of categories) {
			const categoryItems = category.items.filter(item => selectedItems.has(item.id));
			
			if (categoryItems.length > 0) {
				lines.push(`📌 ${category.name}`);
				lines.push('');
				
				for (const item of categoryItems) {
					const emoji = itemEmojis[emojiIndex % itemEmojis.length];
					emojiIndex++;
					
					lines.push(`${emoji} ${item.name} - ${formatCurrency(item.price)}`);
					
					if (item.description) {
						lines.push(`   ${item.description}`);
					}
					lines.push('');
				}
			}
		}

		lines.push('✨💫 Hope to see you soon! 💫✨');
		return lines.join('\n');
	});

	function toggleCategory(categoryId: string) {
		if (expandedCategories.has(categoryId)) {
			expandedCategories.delete(categoryId);
		} else {
			expandedCategories.add(categoryId);
		}
	}

	function toggleCategorySelection(category: CategoryWithItems) {
		const categoryItemIds = category.items.map(item => item.id);
		const allSelected = categoryItemIds.every(id => selectedItems.has(id));
		
		if (allSelected) {
			categoryItemIds.forEach(id => selectedItems.delete(id));
		} else {
			categoryItemIds.forEach(id => selectedItems.add(id));
		}
	}

	function toggleItemSelection(itemId: string) {
		if (selectedItems.has(itemId)) {
			selectedItems.delete(itemId);
		} else {
			selectedItems.add(itemId);
		}
	}

	function selectAll() {
		selectedItems.clear();
		const allItemIds = categories.flatMap(c => c.items.map(i => i.id));
		allItemIds.forEach(id => selectedItems.add(id));
	}

	function clearSelection() {
		selectedItems.clear();
	}

	function isCategorySelected(category: CategoryWithItems): boolean {
		const categoryItemIds = category.items.map(item => item.id);
		return categoryItemIds.length > 0 && categoryItemIds.every(id => selectedItems.has(id));
	}

	function isCategoryPartiallySelected(category: CategoryWithItems): boolean {
		const categoryItemIds = category.items.map(item => item.id);
		const selectedCount = categoryItemIds.filter(id => selectedItems.has(id)).length;
		return selectedCount > 0 && selectedCount < categoryItemIds.length;
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(formattedText);
			copied = true;
			setTimeout(() => copied = false, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
			alert('Failed to copy to clipboard');
		}
	}

	async function shareMenu() {
		if (selectedCount === 0) {
			alert('Please select at least one item to share');
			return;
		}

		try {
			if (navigator.share) {
				await navigator.share({
					title: 'Our Menu',
					text: formattedText
				});
				shared = true;
				setTimeout(() => shared = false, 2000);
			} else {
				await copyToClipboard();
			}
		} catch (err) {
			if ((err as Error).name !== 'AbortError') {
				console.error('Failed to share:', err);
				await copyToClipboard();
			}
		}
	}
</script>

<svelte:head>
	<title>Share Menu | Admin</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 pb-24 lg:pb-8">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/admin/menu" class="rounded-full bg-white p-2 shadow-sm transition-shadow hover:shadow-md" aria-label="Go back">
					<svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
				</a>
				<div>
					<h1 class="text-2xl font-bold text-gray-900">📱 Share Menu</h1>
					<p class="text-sm text-gray-600">Select items to share on social media</p>
				</div>
			</div>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<div class="space-y-4">
				<div class="rounded-xl bg-white p-4 shadow-sm">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-semibold text-gray-900">📝 Select Items</h2>
						<div class="flex gap-2">
							<Button variant="ghost" size="sm" onclick={selectAll}>
								Select All
							</Button>
							<Button variant="ghost" size="sm" onclick={clearSelection}>
								Clear
							</Button>
						</div>
					</div>

					<div class="mb-3 rounded-lg bg-orange-100 px-3 py-2 text-sm text-orange-800">
						📊 {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
					</div>

					<div class="space-y-3">
						{#each categories as category (category.id)}
							{#if category.items.length > 0}
								<div class="rounded-lg border border-gray-200 overflow-hidden">
									<button
										onclick={() => toggleCategory(category.id)}
										class="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
									>
										<div class="flex items-center gap-3">
											<input
												type="checkbox"
												checked={isCategorySelected(category)}
												indeterminate={isCategoryPartiallySelected(category)}
					onclick={(e: MouseEvent) => {
												e.stopPropagation();
												toggleCategorySelection(category);
											}}
												class="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
											/>
											<span class="font-medium text-gray-900">{category.name}</span>
											<span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
												{category.items.length} items
											</span>
										</div>
										{#if expandedCategories.has(category.id)}
											<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
											</svg>
										{:else}
											<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
											</svg>
										{/if}
									</button>

									{#if expandedCategories.has(category.id)}
										<div class="divide-y divide-gray-100">
											{#each category.items as item (item.id)}
												<label
													class="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-orange-50"
												>
													<input
														type="checkbox"
														checked={selectedItems.has(item.id)}
														onchange={() => toggleItemSelection(item.id)}
														class="mt-1 h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
													/>
													<div class="flex-1 min-w-0">
														<div class="flex items-center justify-between">
															<span class="font-medium text-gray-900">{item.name}</span>
															<span class="font-semibold text-orange-600">{formatCurrency(item.price)}</span>
														</div>
														{#if item.description}
															<p class="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
														{/if}
													</div>
												</label>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>

			<div class="lg:sticky lg:top-6 lg:self-start">
				<div class="rounded-xl bg-white p-4 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold text-gray-900">👀 Preview</h2>
					
					<div class="rounded-lg bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto">
						{formattedText}
					</div>

					<div class="mt-4 flex gap-3">
						<Button
							variant="secondary"
							class="flex-1"
							onclick={copyToClipboard}
							disabled={selectedCount === 0}
						>
							{#if copied}
								<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Copied!
							{:else}
								<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
									<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
								</svg>
								Copy
							{/if}
						</Button>
						<Button
							class="flex-1"
							onclick={shareMenu}
							disabled={selectedCount === 0}
						>
							{#if shared}
								<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Shared!
							{:else}
								<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
								</svg>
								Share
							{/if}
						</Button>
					</div>

					{#if selectedCount === 0}
						<p class="mt-3 text-center text-sm text-gray-500">
							✨ Select items from the menu to create your shareable text ✨
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
