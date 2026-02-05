<script lang="ts">
	import type { MenuItemWithCategory } from '$lib/types/orders';
	import Button from '$lib/components/ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatting';

	interface Props {
		item: MenuItemWithCategory;
		onedit: (item: MenuItemWithCategory) => void;
		ondelete: (item: MenuItemWithCategory) => void;
	}

	let { item, onedit, ondelete }: Props = $props();
</script>

<div class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
	<div class="flex items-start justify-between gap-4">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<h3 class="font-semibold text-gray-900 text-base truncate">{item.name}</h3>
				<div
					class="flex-shrink-0 w-2.5 h-2.5 rounded-full {item.isAvailable
						? 'bg-green-500'
						: 'bg-red-500'}"
					title={item.isAvailable ? 'Available' : 'Unavailable'}
					role="status"
					aria-label={item.isAvailable ? 'Available' : 'Unavailable'}
				></div>
			</div>

			{#if item.description}
				<p class="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
			{/if}

			<div class="flex items-center gap-2 flex-wrap">
				{#if item.category}
					<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
						{item.category.name}
					</span>
				{/if}
				<span class="text-sm font-bold text-gray-900">{formatCurrency(item.price)}</span>
			</div>
		</div>

		<div class="flex items-center gap-2 flex-shrink-0">
			<Button
				variant="secondary"
				size="sm"
				onclick={() => onedit(item)}
				aria-label={`Edit ${item.name}`}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			</Button>
			<Button
				variant="danger"
				size="sm"
				onclick={() => ondelete(item)}
				aria-label={`Delete ${item.name}`}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
			</Button>
		</div>
	</div>
</div>
