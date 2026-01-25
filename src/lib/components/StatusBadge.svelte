<script lang="ts">
	import type { OrderStatus } from '$lib/types/orders';

	interface Props {
		status: OrderStatus;
	}

	let { status }: Props = $props();

	const statusConfig: Record<
		OrderStatus,
		{ bgColor: string; textColor: string; borderColor: string; label: string }
	> = {
		pending: {
			bgColor: 'bg-warning-100',
			textColor: 'text-warning-700',
			borderColor: 'border-warning-200',
			label: 'Pending'
		},
		preparing: {
			bgColor: 'bg-bakery-100',
			textColor: 'text-bakery-700',
			borderColor: 'border-bakery-200',
			label: 'Preparing'
		},
		ready: {
			bgColor: 'bg-success-100',
			textColor: 'text-success-700',
			borderColor: 'border-success-200',
			label: 'Ready'
		},
		delivered: {
			bgColor: 'bg-sage-100',
			textColor: 'text-sage-700',
			borderColor: 'border-sage-200',
			label: 'Delivered'
		}
	};

	const config = $derived(statusConfig[status] || statusConfig.pending);
</script>

<span
	class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {config.bgColor} {config.textColor} {config.borderColor}"
>
	{config.label}
</span>
