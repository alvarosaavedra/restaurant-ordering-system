<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	interface OrderItem {
		id: string;
		quantity: number;
		unitPrice: number;
		menuItemId: string;
		menuItem: {
			id: string;
			name: string;
			categoryId: string;
		} | null;
	}

	interface Order {
		id: string;
		customerName: string;
		customerPhone: string | null;
		totalAmount: number;
		status: 'pending' | 'preparing' | 'ready' | 'delivered';
		createdAt: Date;
		updatedAt: Date;
		employee: {
			id: string;
			name: string;
			email: string;
		} | null;
		items: OrderItem[];
	}

	let { data }: { data: any } = $props();

	let orders = $derived(data.orders || []);
	let totalCount = $derived(data.totalCount || 0);
	let currentPage = $derived(data.currentPage || 1);
	let limit = $derived(data.limit || 20);
	let search = $state('');
	let statusFilter = $state('');
	let sort = $state('newest');

	$effect(() => {
		search = data.search || '';
		statusFilter = data.status || '';
		sort = data.sort || 'newest';
	});

	let expandedOrderId = $state<string | null>(null);

	function toggleExpanded(orderId: string) {
		expandedOrderId = expandedOrderId === orderId ? null : orderId;
	}

	function updateUrl() {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (statusFilter) params.set('status', statusFilter);
		if (sort !== 'newest') params.set('sort', sort);
		params.set('page', '1');
		goto(`/orders?${params.toString()}`, { replaceState: true });
	}

	function changePage(page: number) {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (statusFilter) params.set('status', statusFilter);
		if (sort !== 'newest') params.set('sort', sort);
		params.set('page', page.toString());
		goto(`/orders?${params.toString()}`);
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			'year': 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	function handleViewOrder(orderId: string) {
		goto(`/orders/${orderId}`);
	}

	let totalPages = $derived(Math.ceil(totalCount / limit));
</script>

<div class="px-4 py-6 max-w-7xl mx-auto">
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-12 h-12 bg-bakery-100 rounded-xl flex items-center justify-center" aria-hidden="true">
				<svg class="w-6 h-6 text-bakery-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002 2V7a2 2 0 00-2 2h-2M9 5a2 2 0 002 2h10a2 2 0 012 2" />
				</svg>
			</div>
			<div>
				<h1 class="text-3xl font-display font-bold text-neutral-900">Order History</h1>
				<p class="text-sm text-neutral-600">View and search all orders</p>
			</div>
		</div>
	</div>

	<!-- Filters and Search -->
	<Card variant="elevated" class="mb-6">
		<div class="p-6">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1">
					<label for="search" class="block text-sm font-semibold text-neutral-700 mb-2">
						Search Orders
					</label>
					<Input
						id="search"
						name="search"
						type="text"
						placeholder="Search by customer name..."
						value={search}
						oninput={(e: Event) => {
							const target = e.target as HTMLInputElement;
							search = target.value;
							if (target.value.length === 0 || target.value.length >= 2) {
								updateUrl();
							}
						}}
						class="w-full"
					/>
				</div>

				<div class="md:w-48">
					<label for="status" class="block text-sm font-semibold text-neutral-700 mb-2">
						Status
					</label>
					<select
						id="status"
						bind:value={statusFilter}
						onchange={updateUrl}
						class="w-full px-4 py-2.5 min-h-[44px] border border-neutral-200 rounded-lg focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 transition-all text-sm font-medium text-neutral-700 bg-white"
					>
						<option value="">All Status</option>
						<option value="pending">Pending</option>
						<option value="preparing">Preparing</option>
						<option value="ready">Ready</option>
						<option value="delivered">Delivered</option>
					</select>
				</div>

				<div class="md:w-48">
					<label for="sort" class="block text-sm font-semibold text-neutral-700 mb-2">
						Sort By
					</label>
					<select
						id="sort"
						bind:value={sort}
						onchange={updateUrl}
						class="w-full px-4 py-2.5 min-h-[44px] border border-neutral-200 rounded-lg focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 transition-all text-sm font-medium text-neutral-700 bg-white"
					>
						<option value="newest">Newest First</option>
						<option value="oldest">Oldest First</option>
					</select>
				</div>

				<div class="flex items-end">
					<Button variant="secondary" onclick={() => goto('/orders')} class="w-full md:w-auto">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
						Clear Filters
					</Button>
				</div>
			</div>
		</Card>

	<!-- Orders List -->
	{#if orders.length === 0}
		<Card variant="elevated" class="text-center py-16">
			<div class="flex flex-col items-center">
				<div class="w-20 h-20 mb-4 bg-neutral-100 rounded-2xl flex items-center justify-center">
					<svg class="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2 2H6a2 2 0 002 2v7m16 0v5a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1h-1m-6-1a1 0 001 15.357 2m15.357 2H15" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-neutral-900 mb-2">No Orders Found</h3>
				<p class="text-neutral-500 mb-4">
					{#if search || statusFilter}
						Try adjusting your filters or search terms
					{:else}
						Start taking orders to see them appear here
					{/if}
				</p>
				{#if !search && !statusFilter}
					<a href="/orders/new" class="inline-flex items-center justify-center px-6 py-2.5 bg-bakery-600 text-white font-medium rounded-lg hover:bg-bakery-700 transition-colors min-h-[44px] min-w-[44px]">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						New Order
					</a>
				{/if}
			</div>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each orders as order (order.id)}
				<Card variant="elevated" class="p-6 animate-slide-up">
					<div class="flex items-start justify-between mb-4 pb-4 border-b border-neutral-200">
						<div class="flex items-center gap-1">
							<h3 class="font-bold text-lg text-neutral-900 font-display">{order.customerName}</h3>
							<StatusBadge status={order.status} />
						</div>
						<div class="flex items-center gap-4 text-sm text-neutral-500">
							<div class="flex items-center gap-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{formatDate(order.createdAt)}
							</div>
							{#if order.employee}
								<div class="flex items-center gap-1">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
									</svg>
									{order.employee.name}
								</div>
							{/if}
						</div>
					</div>
					<div class="flex items-center gap-6 text-sm">
						<div class="flex items-center gap-1 text-neutral-600">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002 2V7a2 2 0 00-2 2h-2M9 5a2 2 0 012 2h2a2 2 0 012 2" />
							</svg>
							<span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
						</div>
						<div class="flex items-center gap-1 font-bold text-bakery-700">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l2.293 2.293c-.63.63-.184 1.707.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
						</div>
					</div>
				</Card>

				<div class="mb-4">
					<Button
						variant="ghost"
						onclick={() => toggleExpanded(order.id)}
						class="text-sm text-bakery-600 hover:text-bakery-700 font-medium flex items-center gap-1"
					>
						{expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
						<svg
							class="w-4 h-4 transition-transform {expandedOrderId === order.id ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7" />
						</svg>
					</Button>
				</div>

				{#if expandedOrderId === order.id}
					<div class="space-y-2 mt-3">
						{#each order.items as item (item.id)}
							<div class="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
								<div class="flex items-center gap-3">
									<span class="font-medium text-neutral-600 w-6 text-center">×{item.quantity}</span>
									<span class="text-neutral-900">{item.menuItem?.name || 'Unknown'}</span>
								</div>
								<span class="font-medium text-neutral-900">${(item.quantity * item.unitPrice).toFixed(2)}</span>
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
		{/if}

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex items-center justify-center mt-6 px-4">
			<div class="text-sm text-neutral-600">
				Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} orders
			</div>
			<div class="flex gap-2">
				<Button
					variant="secondary"
					size="sm"
					disabled={currentPage === 1}
					onclick={() => changePage(currentPage - 1)}
					aria-label="Previous page"
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7 7-7" />
					</svg>
					Previous
				</Button>
				<Button
					variant="secondary"
					size="sm"
					disabled={currentPage === totalPages}
					onclick={() => changePage(currentPage + 1)}
					aria-label="Next page"
				>
					Next
					<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7" />
					</svg>
				</Button>
			</div>
		</div>
	{/if}
</div>
