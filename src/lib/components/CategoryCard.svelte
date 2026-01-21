<script lang="ts">
	import type { CategoryWithCount } from '$lib/types/orders';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		category: CategoryWithCount;
		onedit: (category: CategoryWithCount) => void;
		ondelete: (category: CategoryWithCount) => void;
	}

	let { category, onedit, ondelete }: Props = $props();
</script>

<div class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
	<div class="flex items-start justify-between gap-4">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-3 mb-1">
				<h3 class="font-semibold text-gray-900 text-base">{category.name}</h3>
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
					{category.itemCount} item{category.itemCount !== 1 ? 's' : ''}
				</span>
			</div>
			<p class="text-sm text-gray-500">Display Order: {category.displayOrder}</p>
		</div>

		<div class="flex items-center gap-2 flex-shrink-0">
			<Button
				variant="secondary"
				size="sm"
				onclick={() => onedit(category)}
				aria-label={`Edit ${category.name}`}
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
				onclick={() => ondelete(category)}
				disabled={category.itemCount > 0}
				aria-label={
					category.itemCount > 0
						? `Cannot delete ${category.name} - has ${category.itemCount} items`
						: `Delete ${category.name}`
				}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
			</Button>
		</div>
	</div>
</div>
