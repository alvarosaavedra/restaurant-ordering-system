<script lang="ts">
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
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
		totalAmount: number;
		status: 'pending' | 'preparing' | 'ready' | 'delivered';
		createdAt: Date;
		employee?: {
			name: string;
			email: string;
		} | null;
		items: OrderItemWithType[];
	}

	interface Props {
		order: OrderWithItemsType;
		onStatusUpdate?: (orderId: string, status: string) => void;
		showActions?: boolean;
	}

	let { order, onStatusUpdate, showActions = true }: Props = $props();

	async function updateStatus(status: string) {
		try {
			const response = await fetch(`/api/orders/${order.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ orderId: order.id, status })
			});

			if (response.ok) {
				toast.success('Order status updated!');
				onStatusUpdate?.(order.id, status);
			} else {
				const error = await response.json();
				toast.error(error.error || 'Failed to update status');
			}
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('Failed to update status');
		}
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}
</script>

<div class="bg-white rounded-2xl shadow-lg border border-gray-100 card-hover">
	<div class="p-6">
		<!-- Order Header -->
		<div class="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
			<div class="flex-1">
				<div class="flex items-center gap-3 mb-2">
					<h3 class="font-bold text-lg text-gray-900">
						{order.customerName}
					</h3>
					<StatusBadge status={order.status} />
				</div>
				<div class="flex items-center gap-4 text-sm text-gray-500">
					{#if order.customerPhone}
						<div class="flex items-center gap-1">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
							</svg>
							{order.customerPhone}
						</div>
					{/if}
					<div class="flex items-center gap-1">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						{formatDate(order.createdAt)}
					</div>
				</div>
			</div>
			<div class="text-right">
				<div class="text-2xl font-black text-gradient">${order.totalAmount.toFixed(2)}</div>
				<div class="text-xs text-gray-400">Order #{order.id.slice(-6)}</div>
			</div>
		</div>

	<!-- Order Items -->
	<div class="mb-4">
			{#each order.items as item}
				<div class="flex items-center justify-between py-2 text-sm">
					<div class="flex items-center gap-3">
						<span class="font-medium text-gray-600 w-6 text-center">×{item.quantity}</span>
						<span class="text-gray-900">{item.menuItem?.name || 'Unknown'}</span>
					</div>
					<span class="font-medium text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</span>
				</div>
			{/each}
		</div>

		<!-- Action Buttons -->
		{#if showActions}
			{#if order.status === 'pending'}
				<Button 
					variant="primary" 
					class="w-full"
					onclick={() => updateStatus('preparing')}
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
					Start Preparing
				</Button>
			{:else if order.status === 'preparing'}
				<Button 
					variant="primary" 
					class="w-full"
					onclick={() => updateStatus('ready')}
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Mark Ready
				</Button>
			{:else if order.status === 'ready'}
				<Button 
					variant="primary" 
					class="w-full"
					onclick={() => updateStatus('delivered')}
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Mark Delivered
				</Button>
			{:else}
				<div class="w-full text-center py-3 text-sm text-gray-500 bg-gray-50 rounded-xl">
					Order completed
				</div>
			{/if}
		{/if}
	</div>
</div>
