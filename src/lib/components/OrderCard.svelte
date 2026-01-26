<script lang="ts">
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { toast } from '$lib/utils/toast';

	interface OrderItemWithType {
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

	interface OrderWithItemsType {
		id: string;
		customerName: string;
		customerPhone: string | null;
		deliveryDateTime: Date | string | null;
		address: string | null;
		comment: string | null;
		totalAmount: number;
		status: 'pending' | 'preparing' | 'ready' | 'delivered';
		createdAt: Date | string;
		items: OrderItemWithType[];
	}

	interface Props {
		order: OrderWithItemsType;
		onStatusUpdate?: (orderId: string, status: string) => void;
		showActions?: boolean;
	}

	let { order, onStatusUpdate, showActions = true }: Props = $props();

	let isUpdating = $state(false);
	let previousStatus = $state<'pending' | 'preparing' | 'ready' | 'delivered'>('pending');

	$effect(() => {
		previousStatus = order.status;
	});

	let createdAt = $derived(new Date(order.createdAt));
	let isoDate = $derived(createdAt.toISOString());

	async function updateStatus(status: string) {
		if (isUpdating) return;

		isUpdating = true;
		previousStatus = order.status;

		try {
			onStatusUpdate?.(order.id, status);

			const response = await fetch(`/api/orders/${order.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ orderId: order.id, status })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update status');
			}

			toast.success('Order status updated!');
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('Failed to update status');
			onStatusUpdate?.(order.id, previousStatus);
		} finally {
			isUpdating = false;
		}
	}

	function formatDate(date: Date): string {
		return date.toLocaleString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	let currentStatus = $derived(isUpdating ? previousStatus : order.status);

	let deliveryDate = $derived(order.deliveryDateTime ? new Date(order.deliveryDateTime) : null);
	let deliveryIsoDate = $derived(deliveryDate ? deliveryDate.toISOString() : '');
</script>

<div class="bg-white rounded-lg shadow-md shadow-warm-glow border border-neutral-200 flex flex-col h-full card-hover" role="article" aria-labelledby={`order-${order.id}-title`}>
	<div class="p-4 sm:p-6 flex flex-col flex-1">
		<!-- Order Header -->
		<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 pb-4 border-b border-neutral-200 gap-3 sm:gap-0">
			<div class="flex-1 w-full sm:w-auto">
				<div class="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
					<h3 id={`order-${order.id}-title`} class="font-bold text-base sm:text-lg text-neutral-900">
						{order.customerName}
					</h3>
					<StatusBadge status={currentStatus} />
				</div>
				<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-500">
					{#if order.customerPhone}
						<div class="flex items-center gap-1">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
							</svg>
							<a
								href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
								target="_blank"
								rel="noopener noreferrer"
								class="text-bakery-600 hover:text-bakery-700 hover:underline focus:outline-none focus:underline break-all"
								aria-label={`Send WhatsApp message to ${order.customerName}`}
							>
								{order.customerPhone}
							</a>
						</div>
					{/if}
					<div class="flex items-center gap-1">
						<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<time datetime={isoDate}>{formatDate(createdAt)}</time>
					</div>
				</div>
			</div>
			<div class="text-right w-full sm:w-auto">
				<div class="text-xl sm:text-2xl font-black text-bakery-700">${order.totalAmount.toFixed(2)}</div>
				<div class="text-xs text-neutral-400">Order #{order.id.slice(-6)}</div>
			</div>
		</div>

		<!-- Delivery Information -->
		{#if deliveryDate || order.address || order.comment}
			<div class="mb-4 p-4 bg-neutral-50 rounded-lg space-y-2">
				{#if deliveryDate}
					<div class="flex items-center gap-2 text-sm">
						<svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="font-medium text-gray-700">Delivery:</span>
						<time datetime={deliveryIsoDate} class="text-gray-900">
							{deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {
							deliveryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
						</time>
					</div>
				{/if}
				{#if order.address}
					<div class="flex items-start gap-2 text-sm">
						<svg class="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
						</svg>
						<a
							href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:underline break-words"
							aria-label={`Open ${order.address} in Google Maps`}
						>
							{order.address}
						</a>
					</div>
				{/if}
				{#if order.comment}
					<div class="flex items-start gap-2 text-sm">
						<svg class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
						</svg>
						<span class="text-gray-700 italic">"{order.comment}"</span>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Order Items -->
		<div class="mb-4" role="list" aria-label="Order items">
			{#each order.items as item (item.id)}
				<div class="flex items-center justify-between py-2 text-sm" role="listitem">
					<div class="flex items-center gap-3">
						<span class="font-medium text-gray-600 w-6 text-center" aria-label={`Quantity: ${item.quantity}`}>×{item.quantity}</span>
						<span class="text-gray-900">{item.menuItem?.name || 'Unknown'}</span>
					</div>
					<span class="font-medium text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</span>
				</div>
			{/each}
		</div>

		<!-- Action Buttons -->
		{#if showActions}
			<div class="mt-auto pt-4 border-t border-neutral-200">
				{#if order.status === 'pending'}
				<Button 
					variant="primary" 
					class="w-full"
					onclick={() => updateStatus('preparing')}
					disabled={isUpdating}
					aria-label={`Start preparing order for ${order.customerName}`}
				>
					{#if isUpdating}
						<Spinner size="sm" />
					{:else}
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
						</svg>
						Start Preparing
					{/if}
				</Button>
			{:else if order.status === 'preparing'}
				<Button 
					variant="primary" 
					class="w-full"
					onclick={() => updateStatus('ready')}
					disabled={isUpdating}
					aria-label={`Mark order for ${order.customerName} as ready`}
				>
					{#if isUpdating}
						<Spinner size="sm" />
					{:else}
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Mark Ready
					{/if}
				</Button>
			{:else if order.status === 'ready'}
				<Button 
					variant="primary" 
					class="w-full"
					onclick={() => updateStatus('delivered')}
					disabled={isUpdating}
					aria-label={`Mark order for ${order.customerName} as delivered`}
				>
					{#if isUpdating}
						<Spinner size="sm" />
					{:else}
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Mark Delivered
					{/if}
				</Button>
			{:else}
				<div class="w-full text-center py-3 text-sm text-neutral-500 bg-neutral-50 rounded-lg" role="status" aria-live="polite">
					Order completed
				</div>
			{/if}
		</div>
		{/if}
	</div>
</div>
