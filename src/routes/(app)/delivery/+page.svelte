<script lang="ts">
	import OrderCard from '$lib/components/OrderCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';

	interface Order {
		id: string;
		customerName: string;
		customerPhone: string | null;
		deliveryDateTime: Date | string | null;
		address: string | null;
		comment: string | null;
		totalAmount: number;
		status: 'pending' | 'preparing' | 'ready' | 'delivered';
		createdAt: Date | string;
		// Discount fields
		discountAmount: number | null;
		discountType: 'fixed' | 'percentage' | null;
		discountValue: number | null;
		discountReason: string | null;
		items: Array<{
			id: string;
			quantity: number;
			unitPrice: number;
			menuItemId: string;
			// Item discount fields
			discountAmount: number | null;
			discountType: 'fixed' | 'percentage' | null;
			discountValue: number | null;
			discountReason: string | null;
			menuItem: {
				id: string;
				name: string;
				categoryId: string;
			} | null;
		}>;
	}

	let { data }: { data: PageData } = $props();

	let orders = $state<Order[]>([]);
	let isRefreshing = $state(false);
	let lastUpdated = $state<Date | null>(null);

	$effect(() => {
		console.log('Initial orders from server load:', data.orders?.length);
		orders = (data.orders || []).map((order: Order) => ({
			...order,
			deliveryDateTime: order.deliveryDateTime || null,
			address: order.address || null,
			comment: order.comment || null
		}));
	});
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let abortController: AbortController | null = null;
 
	async function fetchOrders() {
		if (isRefreshing) return;

		isRefreshing = true;
		abortController = new AbortController();

		try {
			console.log('Fetching orders from /api/delivery/orders');
			const response = await fetch('/api/delivery/orders', {
				signal: abortController.signal
			});

			console.log('Response status:', response.status);
			console.log('Response ok:', response.ok);

			if (response.ok) {
				const newOrders = await response.json();
				console.log('Orders received:', newOrders.length);
				orders = newOrders.map((order: Order) => ({
					...order,
					deliveryDateTime: order.deliveryDateTime || null,
					address: order.address || null,
					comment: order.comment || null
				}));
				lastUpdated = new Date();
			} else {
				const errorData = await response.json();
				console.error('API error:', errorData);
			}
		} catch (error) {
			if (error instanceof Error && error.name !== 'AbortError') {
				console.error('Error fetching orders:', error);
			}
		} finally {
			abortController = null;
			isRefreshing = false;
		}
	}
 
	onMount(() => {
		console.log('Delivery page mounted - initial orders:', data.orders?.length);
		fetchOrders();

		intervalId = setInterval(() => {
			fetchOrders();
		}, 30000);
	});
 
	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	});
 
	async function manualRefresh() {
		await fetchOrders();
	}
 
	function handleStatusUpdate(orderId: string, status: string) {
		if (status === 'delivered') {
			orders = orders.filter(order => order.id !== orderId);
		}
	}
 </script>
  
<div class="px-4 py-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 bg-bakery-100 rounded-xl flex items-center justify-center shadow-warm-glow-sm" aria-hidden="true">
					<svg class="w-6 h-6 text-bakery-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
					</svg>
				</div>
				<div>
					<h1 class="text-2xl font-bold text-neutral-900 font-display">Delivery Orders</h1>
					<p class="text-sm text-neutral-600">Manage orders ready for delivery</p>
				</div>
			</div>
			<Button
				variant="secondary" 
				onclick={manualRefresh}
				disabled={isRefreshing}
				class="gap-2 w-full sm:w-auto"
				aria-label="Refresh orders"
			>
				{#if isRefreshing}
					<Spinner size="sm" />
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					Refresh
				{/if}
			</Button>
		</div>
		{#if lastUpdated}
			<p class="text-xs text-neutral-500">
				Last updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
			</p>
		{/if}
	</div>
 
	<!-- Orders Grid -->
	{#if orders.length === 0}
		<div class="text-center py-16">
			<div class="w-20 h-20 mx-auto mb-4 bg-neutral-100 rounded-2xl flex items-center justify-center shadow-warm-glow-sm">
				<svg class="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707-.707h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-neutral-900 mb-2 font-display">No Orders for Delivery</h3>
			<p class="text-neutral-500">All ready orders have been delivered or there are no orders yet.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
			{#each orders as order (order.id)}
				<OrderCard
					order={order}
					onStatusUpdate={handleStatusUpdate}
				/>
			{/each}
		</div>
	{/if}
 </div>
