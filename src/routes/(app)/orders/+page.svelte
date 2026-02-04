<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { formatCurrency } from '$lib/utils/formatting';

	interface OrderItem {
		id: string;
		quantity: number;
		unitPrice: number;
		menuItemId: string;
		// Discount fields
		discountAmount: number | null;
		discountType: 'fixed' | 'percentage' | null;
		discountValue: number | null;
		discountReason: string | null;
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
		// Discount fields
		discountAmount: number | null;
		discountType: 'fixed' | 'percentage' | null;
		discountValue: number | null;
		discountReason: string | null;
		employee: {
			id: string;
			name: string;
			email: string;
		} | null;
		items: OrderItem[];
	}

	let { data }: { data: { orders: Order[]; totalCount: number; currentPage: number; limit: number; search: string; status: string; sort: string } } = $props();

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

	function updateUrl() {
		const params = new URL(window.location.href).searchParams;
		if (search) params.set('search', search);
		else params.delete('search');
		if (statusFilter) params.set('status', statusFilter);
		else params.delete('status');
		if (sort !== 'newest') params.set('sort', sort);
		else params.delete('sort');
		params.set('page', '1');
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/orders?${params.toString()}`, { replaceState: true });
	}

	function changePage(page: number) {
		const params = new URL(window.location.href).searchParams;
		if (search) params.set('search', search);
		if (statusFilter) params.set('status', statusFilter);
		if (sort !== 'newest') params.set('sort', sort);
		params.set('page', page.toString());
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/orders?${params.toString()}`);
	}

	function formatDate(date: Date): string {
		const d = new Date(date);
		// Shorter format for mobile displays
		return d.toLocaleDateString('en-US', {
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	// Discount helper functions
	function hasOrderDiscount(order: Order): boolean {
		return !!(order.discountAmount && order.discountAmount > 0);
	}

	function hasItemDiscounts(order: Order): boolean {
		return order.items?.some(item => item.discountAmount && item.discountAmount > 0) ?? false;
	}

	function hasAnyDiscount(order: Order): boolean {
		return hasOrderDiscount(order) || hasItemDiscounts(order);
	}

	function calculateTotalItemDiscounts(order: Order): number {
		if (!order.items) return 0;
		return order.items.reduce((sum, item) => {
			if (item.discountAmount && item.discountAmount > 0) {
				return sum + (item.discountAmount * item.quantity);
			}
			return sum;
		}, 0);
	}

	function calculateTotalSavings(order: Order): number {
		const itemDiscounts = calculateTotalItemDiscounts(order);
		const orderDiscount = order.discountAmount ?? 0;
		return itemDiscounts + orderDiscount;
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
	<Card variant="elevated" class="mb-6 shadow-warm-glow-sm">
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
					<Button variant="secondary" onclick={() => { search = ''; statusFilter = ''; sort = 'newest'; updateUrl(); }} class="w-full md:w-auto">
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
			<Card variant="elevated" class="text-center py-16 shadow-warm-glow-sm">
				<div class="flex flex-col items-center">
					<div class="w-20 h-20 mb-4 bg-neutral-100 rounded-2xl flex items-center justify-center">
						<svg class="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 002 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01.293-.707V16a1 1 0 01-1h-1m-6-1a1 0 001 15.357 2m15.357 2H15" />
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
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
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
		<Card variant="elevated" class="p-6 shadow-warm-glow-sm">
			<div class="space-y-3">
		{#each orders as order (order.id)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={`/orders/${order.id}`} class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer gap-3 w-full text-left">
					<div class="flex items-center gap-4 flex-1 min-w-0">
						<StatusBadge status={order.status} />
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<h3 class="font-semibold text-neutral-900 truncate">{order.customerName}</h3>
								{#if hasAnyDiscount(order)}
											<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
												</svg>
												Saved {formatCurrency(calculateTotalSavings(order))}
											</span>
										{/if}
									</div>
									<p class="text-sm text-neutral-500">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} · {formatCurrency(order.totalAmount || 0)}</p>
						</div>
					</div>
					<div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
						<span class="text-sm text-neutral-500">{formatDate(order.createdAt)}</span>
						<svg class="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
					</a>
				{/each}
			</div>
		</Card>
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
