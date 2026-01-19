<script lang="ts">
	import OrderCard from '$lib/components/OrderCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let initialOrders = $derived(data.orders || []);
	let orders = $state([...initialOrders]);

	function handleStatusUpdate(orderId: string, status: string) {
		// Remove order from list when status changes to ready
		if (status === 'ready') {
			// @ts-ignore - Order type inference
			orders = orders.filter(order => order.id !== orderId);
		} else {
			// Update status in place
			// @ts-ignore - Order type inference
			orders = orders.map(order =>
				order.id === orderId
					? { ...order, status: status as any }
					: order
			);
		}
	}
</script>

<div class="px-4 py-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
				<svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Kitchen View</h1>
				<p class="text-sm text-gray-600">Manage orders in preparation</p>
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
			<h3 class="text-lg font-semibold text-gray-900 mb-2">No Orders to Prepare</h3>
			<p class="text-gray-500">All orders are either ready or delivered. Great job!</p>
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
