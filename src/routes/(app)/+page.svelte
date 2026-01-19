<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	interface User {
		id: string;
		name: string;
		email: string;
		role: string;
	}

	interface OrderStats {
		pending: number;
		preparing: number;
		ready: number;
		delivered: number;
		total: number;
	}

	interface OrderItem {
		id: string;
		quantity: number;
		unitPrice: number;
		menuItemId: string;
		menuItem: {
			id: string;
			name: string;
			description: string | null;
			price: number;
			categoryId: string;
			categoryName: string | null;
		} | null;
	}

	interface Order {
		id: string;
		customerName: string;
		customerPhone: string | null;
		totalAmount: number;
		status: 'pending' | 'preparing' | 'ready' | 'delivered';
		createdAt: Date;
		employee: {
			id: string;
			name: string;
			email: string;
		} | null;
		items: OrderItem[];
	}

	let { data }: { data: any } = $props();

	let user = $derived(data.user);
	let stats = $derived(data.stats);
	let recentOrders = $derived(data.recentOrders || []);

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	function getStatsColor(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'preparing':
				return 'bg-blue-100 text-blue-800';
			case 'ready':
				return 'bg-green-100 text-green-800';
			case 'delivered':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="px-4 py-6 max-w-7xl mx-auto">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gradient">Dashboard</h1>
		<p class="mt-2 text-lg text-gray-600">
			Welcome back, <span class="font-semibold text-primary-600">{user?.name}</span>! 👋
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
		<!-- Total Orders -->
		<Card class="p-6">
			<div class="flex flex-col">
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Orders</p>
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
					</div>
					<div class="text-3xl font-black text-gray-900">{stats?.total || 0}</div>
				</div>
			</div>
		</Card>

		<!-- Pending -->
		<Card class="p-6">
			<div class="flex flex-col">
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pending</p>
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div class="text-3xl font-black text-yellow-600">{stats?.pending || 0}</div>
				</div>
			</div>
		</Card>

		<!-- Preparing -->
		<Card class="p-6">
			<div class="flex flex-col">
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preparing</p>
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
						</svg>
					</div>
					<div class="text-3xl font-black text-blue-600">{stats?.preparing || 0}</div>
				</div>
			</div>
		</Card>

		<!-- Ready -->
		<Card class="p-6">
			<div class="flex flex-col">
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ready</p>
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<div class="text-3xl font-black text-green-600">{stats?.ready || 0}</div>
				</div>
			</div>
		</Card>

		<!-- Delivered -->
		<Card class="p-6">
			<div class="flex flex-col">
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivered</p>
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div class="text-3xl font-black text-gray-600">{stats?.delivered || 0}</div>
				</div>
			</div>
		</Card>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
		<!-- Quick Actions -->
		<Card class="p-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
					<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h2 class="text-lg font-bold text-gray-900">Quick Actions</h2>
			</div>
			<div class="space-y-3">
				{#if user?.role === 'order_taker'}
					<a href="/orders/new" class="block">
						<Button variant="primary" class="w-full">
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							Create New Order
						</Button>
					</a>
				{/if}
				<a href="/orders" class="block">
					<Button variant="secondary" class="w-full">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
						View All Orders
					</Button>
				</a>
				{#if user?.role === 'kitchen'}
					<a href="/kitchen" class="block">
						<Button variant="secondary" class="w-full">
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							Kitchen View
						</Button>
					</a>
				{/if}
				{#if user?.role === 'delivery'}
					<a href="/delivery" class="block">
						<Button variant="secondary" class="w-full">
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
							</svg>
							Delivery View
						</Button>
					</a>
				{/if}
			</div>
		</Card>

		<!-- Role Information -->
		<Card class="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
			<div class="p-6">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<h2 class="text-lg font-bold">Your Role</h2>
				</div>
				<div class="mb-4">
					<span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm">
						{user?.role?.toUpperCase()}
					</span>
				</div>
				<p class="text-sm text-primary-100">
					{#if user?.role === 'order_taker'}
						You can create and manage orders
					{:else if user?.role === 'kitchen'}
						You can prepare and manage orders
					{:else if user?.role === 'delivery'}
						You can manage deliveries
					{:else}
						You have full system access
					{/if}
				</p>
			</div>
		</Card>

		<!-- System Status -->
		<Card class="p-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
					<svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h2 class="text-lg font-bold text-gray-900">System Status</h2>
			</div>
			<div class="space-y-3">
				<div class="flex items-center justify-between p-3 bg-success-50 rounded-xl">
					<div class="flex items-center gap-3">
						<div class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
						<span class="text-sm font-medium text-success-700">System Online</span>
					</div>
					<svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<div class="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
					<div class="flex items-center gap-3">
						<div class="w-2 h-2 bg-primary-500 rounded-full"></div>
						<span class="text-sm font-medium text-primary-700">Database Connected</span>
					</div>
					<svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
			</div>
		</Card>
	</div>

	<!-- Recent Orders -->
	<Card class="p-6">
		<div class="flex items-center justify-between mb-6">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
					<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<h2 class="text-lg font-bold text-gray-900">Recent Orders</h2>
					<p class="text-sm text-gray-500">Latest {recentOrders.length} orders</p>
				</div>
			</div>
			<a href="/orders" class="text-primary-600 hover:text-primary-700 font-medium text-sm">View All</a>
		</div>

		{#if recentOrders.length === 0}
			<div class="text-center py-12">
				<div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
				</div>
				<p class="text-gray-500">No orders yet</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each recentOrders as order (order.id)}
					<div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onclick={() => goto(`/orders/${order.id}`)}>
						<div class="flex items-center gap-4 flex-1 min-w-0">
							<StatusBadge status={order.status} />
							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-gray-900 truncate">{order.customerName}</h3>
								<p class="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · ${order.totalAmount.toFixed(2)}</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-sm text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</span>
							<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card>
</div>
