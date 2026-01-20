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
	let search = $state(data.search || '');
	let statusFilter = $state(data.status || '');
	let sort = $state(data.sort || 'newest');

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
			year: 'numeric',
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
			<div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
				<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
				</svg>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Order History</h1>
				<p class="text-sm text-gray-600">View and search all orders</p>
			</div>
		</div>
	</div>

	<!-- Filters and Search -->
	<Card class="mb-6">
		<div class="p-6">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1">
					<label for="search" class="block text-sm font-semibold text-gray-700 mb-2">
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
					<label for="status" class="block text-sm font-semibold text-gray-700 mb-2">
						Status
					</label>
					<select
						id="status"
						bind:value={statusFilter}
						onchange={updateUrl}
						class="w-full px-4 py-2.5 min-h-[44px] border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm font-medium text-gray-700 bg-white"
					>
						<option value="">All Status</option>
						<option value="pending">Pending</option>
						<option value="preparing">Preparing</option>
						<option value="ready">Ready</option>
						<option value="delivered">Delivered</option>
					</select>
				</div>

				<div class="md:w-48">
					<label for="sort" class="block text-sm font-semibold text-gray-700 mb-2">
						Sort By
					</label>
					<select
						id="sort"
						bind:value={sort}
						onchange={updateUrl}
						class="w-full px-4 py-2.5 min-h-[44px] border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm font-medium text-gray-700 bg-white"
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
		</div>
	</Card>

	<!-- Orders List -->
	{#if orders.length === 0}
		<Card class="text-center py-16">
			<div class="flex flex-col items-center">
				<div class="w-20 h-20 mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
					<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
				<p class="text-gray-500">
					{#if search || statusFilter}
						Try adjusting your filters or search terms
					{:else}
						Start taking orders to see them appear here
					{/if}
				</p>
			</div>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each orders as order (order.id)}
				<Card>
					<div class="p-6">
						<div class="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
							<div class="flex-1">
								<div class="flex items-center gap-3 mb-2">
									<h3 class="font-bold text-lg text-gray-900">{order.customerName}</h3>
									<StatusBadge status={order.status} />
								</div>
								<div class="flex items-center gap-4 text-sm text-gray-500">
									<div class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{formatDate(order.createdAt)}
									</div>
									{#if order.employee}
										<div class="flex items-center gap-1">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
											{order.employee.name}
										</div>
									{/if}
								</div>
							</div>
							<div class="text-right">
								<div class="text-2xl font-black text-gradient">${order.totalAmount.toFixed(2)}</div>
								<div class="text-xs text-gray-400">Order #{order.id.slice(-6)}</div>
							</div>
						</div>

						<div class="mb-4">
							<div class="flex items-center justify-between mb-2">
								<h4 class="text-sm font-semibold text-gray-700">Order Items</h4>
								<button
									onclick={() => toggleExpanded(order.id)}
									class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
								>
									{expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
									<svg
										class="w-4 h-4 transition-transform {expandedOrderId === order.id ? 'rotate-180' : ''}"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
							</div>

							{#if expandedOrderId === order.id}
								<div class="space-y-2 mt-3">
									{#each order.items as item}
										<div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
											<div class="flex items-center gap-3">
												<span class="font-medium text-gray-600 w-6 text-center">×{item.quantity}</span>
												<span class="text-gray-900">{item.menuItem?.name || 'Unknown'}</span>
											</div>
											<span class="font-medium text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</span>
										</div>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-gray-500">
									{order.items.length} item{order.items.length !== 1 ? 's' : ''} ·
									<span class="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</span>
								</p>
							{/if}
						</div>

						<div class="flex gap-3">
							<Button variant="secondary" onclick={() => handleViewOrder(order.id)}>
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
								View Details
							</Button>
						</div>
					</div>
				</Card>
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-between mt-6 px-4">
				<div class="text-sm text-gray-600">
					Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} orders
				</div>
				<div class="flex gap-2">
					<Button
						variant="secondary"
						size="sm"
						disabled={currentPage === 1}
						onclick={() => changePage(currentPage - 1)}
					>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
						Previous
					</Button>
					<Button
						variant="secondary"
						size="sm"
						disabled={currentPage === totalPages}
						onclick={() => changePage(currentPage + 1)}
					>
						Next
						<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
