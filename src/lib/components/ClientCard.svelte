<script lang="ts">
	import type { Client } from '$lib/server/db/schema';
	import Button from './ui/Button.svelte';

	interface Props {
		client: Client & { orderCount: number };
		onedit: (client: Client & { orderCount: number }) => void;
		ondelete: (client: Client & { orderCount: number }) => void;
	}

	let { client, onedit, ondelete }: Props = $props();
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
	<div class="flex items-start justify-between mb-4">
		<div class="flex-1">
			<h3 class="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
			<div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
					/>
				</svg>
				<span>{client.phone}</span>
			</div>
			{#if client.address}
				<div class="flex items-start gap-2 text-sm text-gray-600">
					<svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span class="break-words">{client.address}</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex items-center justify-between pt-4 border-t border-gray-100">
		<div class="flex items-center gap-2 text-sm text-gray-500">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
				/>
			</svg>
			<span>{client.orderCount} order{client.orderCount !== 1 ? 's' : ''}</span>
		</div>

		<div class="flex gap-2">
			<Button
				type="button"
				variant="secondary"
				size="sm"
				onclick={() => onedit(client)}
				aria-label={`Edit ${client.name}`}
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
				type="button"
				variant="danger"
				size="sm"
				onclick={() => ondelete(client)}
				aria-label={`Delete ${client.name}`}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
			</Button>
		</div>
	</div>
</div>
