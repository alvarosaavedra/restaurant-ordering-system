<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';

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
		finalPrice: number | null;
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
		deliveryDateTime: Date | null;
		address: string | null;
		comment: string | null;
		totalAmount: number;
		status: 'pending' | 'preparing' | 'ready' | 'delivered';
		createdAt: Date;
		updatedAt: Date;
		employeeId: string;
		deletedAt?: Date | null;
		// Discount fields
		discountAmount: number | null;
		discountType: 'fixed' | 'percentage' | null;
		discountValue: number | null;
		discountReason: string | null;
		employee: {
			id: string;
			name: string;
			email: string;
			role: string;
		} | null;
		items: OrderItem[];
	}

	interface PageData {
		order: Order;
		isAdmin: boolean;
		menuItems: {
			id: string;
			name: string;
			price: number;
		}[];
	}

	let { data, form }: { data: PageData; form: { error?: string; message?: string } } = $props();

	let order = $derived(data.order);
	let isAdmin = $derived(data.isAdmin);

	let showEditOrderModal = $state(false);
	let showEditItemsModal = $state(false);
	let showDeleteOrderModal = $state(false);

	let orderFormData = $state({
		id: '',
		customerName: '',
		customerPhone: '',
		deliveryDateTime: '',
		address: '',
		comment: '',
		status: 'pending' as 'pending' | 'preparing' | 'ready' | 'delivered'
	});

	let itemsFormData = $state<
		{
			menuItemId: string;
			name: string;
			quantity: number;
			unitPrice: number;
		}[]
	>([]);

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

	function openEditOrderModal() {
		orderFormData = {
			id: order.id,
			customerName: order.customerName,
			customerPhone: order.customerPhone || '',
			deliveryDateTime: new Date(order.deliveryDateTime || Date.now()).toISOString().slice(0, 16),
			address: order.address || '',
			comment: order.comment || '',
			status: order.status
		};
		showEditOrderModal = true;
	}

	function openEditItemsModal() {
		itemsFormData = order.items.map((item) => ({
			menuItemId: item.menuItemId,
			name: item.menuItem?.name || 'Unknown Item',
			quantity: item.quantity,
			unitPrice: item.unitPrice
		}));
		showEditItemsModal = true;
	}

	function openDeleteOrderModal() {
		showDeleteOrderModal = true;
	}

	function removeItem(index: number) {
		itemsFormData.splice(index, 1);
	}

	function addItem(menuItemId: string) {
		const menuItem = data.menuItems.find((m) => m.id === menuItemId);
		if (menuItem) {
			itemsFormData.push({
				menuItemId: menuItem.id,
				name: menuItem.name,
				quantity: 1,
				unitPrice: menuItem.price
			});
		}
	}

	function calculateTotal(): number {
		return itemsFormData.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
	}

	function closeAllModals() {
		showEditOrderModal = false;
		showEditItemsModal = false;
		showDeleteOrderModal = false;
	}

	function handleFormSuccess() {
		closeAllModals();
		invalidateAll();
	}

	// Discount calculation helpers
	function calculateItemOriginalTotal(item: OrderItem): number {
		return item.quantity * item.unitPrice;
	}

	function calculateItemDiscountAmount(item: OrderItem): number {
		if (!item.discountAmount) return 0;
		return item.discountAmount * item.quantity;
	}

	function calculateSubtotal(): number {
		return order.items.reduce((sum, item) => sum + calculateItemOriginalTotal(item), 0);
	}

	function calculateTotalItemDiscounts(): number {
		return order.items.reduce((sum, item) => sum + calculateItemDiscountAmount(item), 0);
	}

	function calculateOrderDiscountAmount(): number {
		if (!order.discountAmount) return 0;
		return order.discountAmount;
	}

	function calculateTotalSavings(): number {
		return calculateTotalItemDiscounts() + calculateOrderDiscountAmount();
	}

	function hasDiscounts(): boolean {
		return calculateTotalSavings() > 0;
	}

	function formatDiscountLabel(type: 'fixed' | 'percentage' | null, value: number | null): string {
		if (!type || !value) return '';
		if (type === 'percentage') return `${value}% off`;
		return `$${value.toFixed(2)} off`;
	}
</script>

<div class="px-4 py-6 max-w-7xl mx-auto">
	<div class="mb-6">
		<div class="flex items-center gap-3 mb-2">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href="/orders" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back to orders">
				<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</a>
			<div class="flex-1">
				<h1 class="text-2xl font-bold text-gray-900">Order Details</h1>
				<p class="text-sm text-gray-600">Order #{order.id.slice(-6)}</p>
			</div>
			{#if isAdmin}
				<div class="flex items-center gap-2">
					<Button variant="secondary" size="sm" onclick={openEditOrderModal}>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit Order
					</Button>
					<Button variant="secondary" size="sm" onclick={openEditItemsModal}>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						Edit Items
					</Button>
					<Button variant="danger" size="sm" onclick={openDeleteOrderModal}>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Delete
					</Button>
				</div>
			{/if}
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
								<a
									href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
									target="_blank"
									rel="noopener noreferrer"
									class="text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:underline font-medium"
									aria-label={`Send WhatsApp message to ${order.customerName}`}
								>
									{order.customerPhone}
								</a>
							</div>
						{/if}

						<div>
							<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Order Date</p>
							<p class="text-gray-900 font-medium">{formatDate(order.createdAt)}</p>
						</div>
					</div>
				</div>
			</Card>

			<!-- Delivery Information -->
			{#if order.deliveryDateTime || order.address || order.comment}
				<Card>
					<div class="p-6">
						<div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
							<div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
								<svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
								</svg>
							</div>
							<h2 class="text-lg font-bold text-gray-900">Delivery Information</h2>
						</div>

						<div class="space-y-3">
							{#if order.deliveryDateTime}
								<div>
									<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Delivery Date/Time</p>
									<p class="text-gray-900 font-medium">{formatDate(order.deliveryDateTime)}</p>
								</div>
							{/if}

							{#if order.address}
								<div>
									<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
									<a
										href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
										target="_blank"
										rel="noopener noreferrer"
										class="text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:underline break-words font-medium"
										aria-label={`Open ${order.address} in Google Maps`}
									>
										{order.address}
									</a>
								</div>
							{/if}

							{#if order.comment}
								<div>
									<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special Instructions</p>
									<p class="text-gray-900 font-medium italic">"{order.comment}"</p>
								</div>
							{/if}
						</div>
					</div>
				</Card>
			{/if}

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
						{#each order.items as item (item.id)}
							<div class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between mb-1">
										<h3 class="font-semibold text-gray-900">{item.menuItem?.name || 'Unknown'}</h3>
										<div class="text-right">
											{#if item.discountAmount && item.discountAmount > 0}
												<div class="flex flex-col items-end">
													<span class="text-sm text-gray-400 line-through">
														${calculateItemOriginalTotal(item).toFixed(2)}
													</span>
													<span class="font-bold text-gray-900">
														${(calculateItemOriginalTotal(item) - calculateItemDiscountAmount(item)).toFixed(2)}
													</span>
												</div>
											{:else}
												<span class="font-bold text-gray-900">
													${calculateItemOriginalTotal(item).toFixed(2)}
												</span>
											{/if}
										</div>
									</div>
									{#if item.menuItem?.description}
										<p class="text-sm text-gray-500 line-clamp-2">{item.menuItem.description}</p>
									{/if}
									<div class="flex items-center gap-2 mt-1 flex-wrap">
										{#if item.menuItem?.categoryName}
											<span class="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
												{item.menuItem.categoryName}
											</span>
										{/if}
										<span class="text-xs text-gray-500">×{item.quantity}</span>
										<span class="text-xs text-gray-500">@ ${item.unitPrice.toFixed(2)}</span>
										{#if item.discountAmount && item.discountAmount > 0}
											<span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
												{formatDiscountLabel(item.discountType, item.discountValue)}
											</span>
											{#if item.discountReason}
												<span class="text-xs text-gray-400 italic">({item.discountReason})</span>
											{/if}
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Discount Breakdown -->
					{#if hasDiscounts()}
						<div class="mt-6 pt-4 border-t border-gray-200">
							<div class="space-y-2">
								<div class="flex items-center justify-between text-sm">
									<span class="text-gray-600">Subtotal</span>
									<span class="font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</span>
								</div>
								
								{#if calculateTotalItemDiscounts() > 0}
									<div class="flex items-center justify-between text-sm">
										<span class="text-gray-600">Item Discounts</span>
										<span class="font-medium text-green-600">-${calculateTotalItemDiscounts().toFixed(2)}</span>
									</div>
								{/if}
								
								{#if order.discountAmount && order.discountAmount > 0}
									<div class="flex items-center justify-between text-sm">
										<span class="text-gray-600">
											Order Discount
											{#if order.discountReason}
												<span class="text-gray-400">({order.discountReason})</span>
											{/if}
										</span>
										<span class="font-medium text-green-600">-${order.discountAmount.toFixed(2)}</span>
									</div>
								{/if}
								
								<div class="flex items-center justify-between text-sm pt-2 border-t border-dashed border-gray-200">
									<span class="font-semibold text-green-700">You Saved</span>
									<span class="font-bold text-green-700">-${calculateTotalSavings().toFixed(2)}</span>
								</div>
							</div>
						</div>
					{/if}

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

<!-- Edit Order Modal -->
<Modal title="Edit Order" open={showEditOrderModal} onclose={closeAllModals}>
	<form method="POST" action="?/updateOrder" use:enhance={handleFormSuccess}>
		<input type="hidden" name="id" value={orderFormData.id} />
		<div class="space-y-4">
			<div>
				<label for="customerName" class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
				<Input
					id="customerName"
					name="customerName"
					type="text"
					placeholder="Enter customer name"
					required
					bind:value={orderFormData.customerName}
				/>
			</div>
			<div>
				<label for="customerPhone" class="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
				<Input
					id="customerPhone"
					name="customerPhone"
					type="text"
					placeholder="Enter phone number"
					bind:value={orderFormData.customerPhone}
				/>
			</div>
			<div>
				<label for="deliveryDateTime" class="block text-sm font-medium text-gray-700 mb-1">Delivery Date/Time</label>
				<input
					id="deliveryDateTime"
					name="deliveryDateTime"
					type="datetime-local"
					required
					bind:value={orderFormData.deliveryDateTime}
					class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
				/>
			</div>
			<div>
				<label for="address" class="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
				<Input
					id="address"
					name="address"
					type="text"
					placeholder="Enter delivery address"
					bind:value={orderFormData.address}
				/>
			</div>
			<div>
				<label for="comment" class="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
				<textarea
					id="comment"
					name="comment"
					rows="3"
					class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px]"
					placeholder="Special instructions (optional)"
					bind:value={orderFormData.comment}
				></textarea>
			</div>
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
				<Select
					id="status"
					name="status"
					options={[
						{ value: 'pending', label: 'Pending' },
						{ value: 'preparing', label: 'Preparing' },
						{ value: 'ready', label: 'Ready' },
						{ value: 'delivered', label: 'Delivered' }
					]}
					placeholder="Select status"
					required
					bind:value={orderFormData.status}
				/>
			</div>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit">Update Order</Button>
			</div>
		</div>
	</form>
</Modal>

<!-- Edit Items Modal -->
<Modal title="Edit Order Items" open={showEditItemsModal} onclose={closeAllModals}>
	<form method="POST" action="?/updateOrderItems" use:enhance={handleFormSuccess}>
		<input type="hidden" name="id" value={order.id} />
		<input type="hidden" name="itemsJson" value={JSON.stringify(itemsFormData)} />

		<div class="space-y-4 max-h-[60vh] overflow-y-auto">
			<div class="space-y-2">
				{#each itemsFormData as item, index (index)}
					<div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
						<span class="flex-1 font-medium">{item.name}</span>
						<input
							type="number"
							min="1"
							class="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
							bind:value={itemsFormData[index].quantity}
						/>
						<span class="text-sm text-gray-500">@ ${item.unitPrice.toFixed(2)}</span>
						<button
							type="button"
							onclick={() => removeItem(index)}
							class="p-1 text-red-600 hover:bg-red-50 rounded"
							aria-label="Remove item"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}
			</div>

			<div>
				<label for="add-item-select" class="block text-sm font-medium text-gray-700 mb-1">Add Item</label>
				<select
					id="add-item-select"
					class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
					onchange={(e: Event) => addItem((e.target as HTMLSelectElement).value)}
				>
					<option value="">Select an item...</option>
					{#each data.menuItems as menuItem (menuItem.id)}
						<option value={menuItem.id}>{menuItem.name}</option>
					{/each}
				</select>
			</div>

			<div class="pt-4 border-t border-gray-200">
				<div class="flex justify-between items-center">
					<span class="font-medium">Total</span>
					<span class="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
				</div>
			</div>

			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit">Update Items</Button>
			</div>
		</div>
	</form>
</Modal>

<!-- Delete Order Modal -->
<Modal title="Delete Order" open={showDeleteOrderModal} onclose={closeAllModals}>
	<form method="POST" action="?/deleteOrder" use:enhance={handleFormSuccess}>
		<input type="hidden" name="id" value={order.id} />
		<div class="space-y-4">
			<div class="p-4 bg-warning-50 border border-warning-200 rounded-lg">
				<div class="flex gap-3">
					<svg class="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<div>
						<p class="font-medium text-warning-800">This action will archive this order</p>
						<p class="text-sm text-warning-700 mt-1">The order will be hidden from all views but will remain in the database for audit purposes.</p>
					</div>
				</div>
			</div>

			<p class="text-gray-700">
				Are you sure you want to delete order <strong>#{order.id.slice(-6)}</strong> for <strong>{order.customerName}</strong>?
			</p>

			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={closeAllModals}>Cancel</Button>
				<Button type="submit" variant="danger">Delete Order</Button>
			</div>
		</div>
	</form>
</Modal>

 {#if form?.error}
	<div class="fixed top-20 right-4 max-w-sm p-4 bg-error-50 border border-error-200 rounded-xl shadow-lg z-[60] animate-in slide-in-from-right duration-300" role="alert">
		<div class="flex items-center gap-3">
			<svg class="w-5 h-5 text-error-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<p class="text-sm font-medium text-error-800">{form.error}</p>
		</div>
	</div>
 {/if}

 {#if form?.message}
	<div class="fixed top-20 right-4 max-w-sm p-4 bg-green-50 border border-green-200 rounded-xl shadow-lg z-[60] animate-in slide-in-from-right duration-300" role="alert">
		<div class="flex items-center gap-3">
			<svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			<p class="text-sm font-medium text-green-800">{form.message}</p>
		</div>
	</div>
 {/if}
