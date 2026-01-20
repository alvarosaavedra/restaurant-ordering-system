<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

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
		updatedAt: Date;
		employeeId: string;
		employee: {
			id: string;
			name: string;
			email: string;
			role: string;
		} | null;
		items: OrderItem[];
	}

	let { data }: { data: any } = $props();

	let order = $derived(data.order);

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	function formatTime(date: Date): string {
		return new Date(date).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}
</script>

<div class="px-4 py-6 max-w-7xl mx-auto">
	<div class="mb-6">
	<div class="flex items-center gap-3 mb-2">
		<button
			onclick={() => goto('/orders')}
			class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
			aria-label="Back to orders"
		>
			<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
		<div>
				<h1 class="text-2xl font-bold text-gray-900">Order Details</h1>
				<p class="text-sm text-gray-600">Order #{order.id.slice(-6)}</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Main Order Details -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Customer Information -->
			<Card>
				<div class="p-6">
					<div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
						<div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
							<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<h2 class="text-lg font-bold text-gray-900">Customer Information</h2>
					</div>

					<div class="space-y-3">
						<div>
							<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</p>
							<p class="text-gray-900 font-medium">{order.customerName}</p>
						</div>

						{#if order.customerPhone}
							<div>
								<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
								<p class="text-gray-900 font-medium">{order.customerPhone}</p>
							</div>
						{/if}

						<div>
							<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Order Date</p>
							<p class="text-gray-900 font-medium">{formatDate(order.createdAt)}</p>
						</div>
					</div>
				</div>
			</Card>

			<!-- Order Items -->
			<Card>
				<div class="p-6">
					<div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
						<div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
							<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<div class="flex-1">
							<h2 class="text-lg font-bold text-gray-900">Order Items</h2>
							<p class="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
						</div>
					</div>

					<div class="space-y-3">
						{#each order.items as item}
							<div class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between mb-1">
										<h3 class="font-semibold text-gray-900">{item.menuItem?.name || 'Unknown'}</h3>
										<span class="font-bold text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</span>
									</div>
									{#if item.menuItem?.description}
										<p class="text-sm text-gray-500 line-clamp-2">{item.menuItem.description}</p>
									{/if}
									{#if item.menuItem?.categoryName}
										<div class="flex items-center gap-2 mt-1">
											<span class="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
												{item.menuItem.categoryName}
											</span>
											<span class="text-xs text-gray-500">×{item.quantity}</span>
											<span class="text-xs text-gray-500">@ ${item.unitPrice.toFixed(2)}</span>
										</div>
									{:else}
										<div class="flex items-center gap-2 mt-1">
											<span class="text-xs text-gray-500">×{item.quantity}</span>
											<span class="text-xs text-gray-500">@ ${item.unitPrice.toFixed(2)}</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-6 pt-4 border-t border-gray-200">
						<div class="flex items-center justify-between">
							<span class="text-lg font-bold text-gray-900">Total</span>
							<span class="text-2xl font-black text-gradient">${order.totalAmount.toFixed(2)}</span>
						</div>
					</div>
				</div>
			</Card>
		</div>

		<!-- Order Status -->
		<div class="space-y-6">
			<!-- Status Card -->
			<Card>
				<div class="p-6">
					<div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
						<div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
							<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 class="text-lg font-bold text-gray-900">Order Status</h2>
					</div>

					<div class="mb-6">
						<StatusBadge status={order.status} />
					</div>

					<div class="space-y-3 text-sm">
						{#if order.status === 'pending'}
							<div class="flex items-center gap-3 text-gray-600">
								<div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
								<p>Order is waiting to be prepared</p>
							</div>
						{:else if order.status === 'preparing'}
							<div class="flex items-center gap-3 text-gray-600">
								<div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
								<p>Order is currently being prepared</p>
							</div>
						{:else if order.status === 'ready'}
							<div class="flex items-center gap-3 text-gray-600">
								<div class="w-2 h-2 bg-green-500 rounded-full"></div>
								<p>Order is ready for delivery</p>
							</div>
						{:else if order.status === 'delivered'}
							<div class="flex items-center gap-3 text-gray-600">
								<div class="w-2 h-2 bg-gray-500 rounded-full"></div>
								<p>Order has been delivered</p>
							</div>
						{/if}
					</div>
				</div>
			</Card>

			<!-- Employee Information -->
			{#if order.employee}
				<Card>
					<div class="p-6">
						<div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
							<div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
								<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
								</svg>
							</div>
							<h2 class="text-lg font-bold text-gray-900">Processed By</h2>
						</div>

						<div class="space-y-3">
							<div>
								<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</p>
								<p class="text-gray-900 font-medium">{order.employee.name}</p>
							</div>

							<div>
								<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</p>
								<p class="text-gray-900 font-medium capitalize">{order.employee.role.replace('_', ' ')}</p>
							</div>
						</div>
					</div>
				</Card>
			{/if}

			<!-- Order Timeline -->
			<Card>
				<div class="p-6">
					<div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
						<div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
							<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 class="text-lg font-bold text-gray-900">Timeline</h2>
					</div>

					<div class="space-y-4">
						<div class="flex gap-3">
							<div class="flex flex-col items-center">
								<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
									<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div class="w-0.5 h-8 bg-gray-200"></div>
							</div>
							<div>
								<p class="font-medium text-gray-900">Order Placed</p>
								<p class="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
							</div>
						</div>

						{#if order.updatedAt && order.updatedAt !== order.createdAt}
							<div class="flex gap-3">
								<div class="flex flex-col items-center">
									<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
										<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
									</div>
								</div>
								<div>
									<p class="font-medium text-gray-900">Last Updated</p>
									<p class="text-sm text-gray-500">{formatTime(order.updatedAt)}</p>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</Card>
		</div>
	</div>
</div>
