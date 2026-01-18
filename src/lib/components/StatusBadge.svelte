<script lang="ts">
	import type { OrderStatus } from '$lib/types/orders';

	interface Props {
		status: OrderStatus;
	}

	let { status }: Props = $props();

	const statusConfig = {
		pending: {
			bgColor: 'bg-yellow-100',
			textColor: 'text-yellow-800',
			label: 'Pending'
		},
		preparing: {
			bgColor: 'bg-blue-100',
			textColor: 'text-blue-800',
			label: 'Preparing'
		},
		ready: {
			bgColor: 'bg-green-100',
			textColor: 'text-green-800',
			label: 'Ready'
		},
		delivered: {
			bgColor: 'bg-gray-100',
			textColor: 'text-gray-800',
			label: 'Delivered'
		}
	} as const;

	const config = statusConfig[status] || statusConfig.pending;
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {config.bgColor} {config.textColor}">
	{config.label}
</span>