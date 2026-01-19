<script lang="ts">
	import OrderCard from '$lib/components/OrderCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// @ts-ignore - Warning about initial value reference is acceptable for this use case
	let orders = $state(data.orders || []);

	function handleStatusUpdate(orderId: string, status: string) {
		// Remove order from list when delivered
		if (status === 'delivered') {
			// @ts-ignore - Order type inference
			orders = orders.filter(order => order.id !== orderId);
		}
	}
</script>

<div class="px-4 py-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
				<svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
				</svg>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Delivery View</h1>
				<p class="text-sm text-gray-600">Manage orders ready for delivery</p>
			</div>
		</div>
	</div>

	<!-- Orders Grid -->
	{#if orders.length === 0}
		<div class="text-center py-16">
			<div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
				<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">No Orders for Delivery</h3>
			<p class="text-gray-500">All ready orders have been delivered or there are no orders yet.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each orders as order (order.id)}
				<OrderCard
					order={order}
					onStatusUpdate={handleStatusUpdate}
				/>
			{/each}
		</div>
	{/if}
</div>
