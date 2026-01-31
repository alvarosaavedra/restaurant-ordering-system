<script lang="ts">
	interface Props {
		discount: {
			type: 'fixed' | 'percentage';
			value: number;
			reason?: string;
		};
		size?: 'sm' | 'md';
		onClick?: () => void;
	}

	let { discount, size = 'sm', onClick }: Props = $props();

	let isClickable = $derived(!!onClick);
	let sizeClasses = $derived(
		size === 'sm'
			? 'text-xs px-2 py-0.5'
			: 'text-sm px-2.5 py-1'
	);

	let formattedValue = $derived(
		discount.type === 'fixed'
			? `$${discount.value.toFixed(2)}`
			: `${discount.value}%`
	);

	let ariaLabel = $derived(
		discount.reason
			? `Discount: ${formattedValue} - ${discount.reason}`
			: `Discount: ${formattedValue}`
	);
</script>

<button
	type="button"
	data-testid="discount-badge"
	class="inline-flex items-center gap-1 rounded-full font-medium transition-colors {sizeClasses} {
		isClickable
			? 'cursor-pointer hover:bg-success-100'
			: 'cursor-default'
	} bg-success-50 text-success-700 border border-success-200"
	aria-label={ariaLabel}
	onclick={onClick}
	disabled={!isClickable}
>
	<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
	</svg>
	<span class="font-semibold">{formattedValue}</span>
</button>
