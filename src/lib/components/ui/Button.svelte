<script lang="ts">
	import Spinner from './Spinner.svelte';

	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		onclick?: () => void;
		children: import('svelte').Snippet;
		class?: string;
		'aria-label'?: string;
		'aria-describedby'?: string;
		tabindex?: number;
	}

	let {
		type = 'button',
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		onclick,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedby,
		tabindex,
		...rest
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);

	const baseClasses =
		'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-bakery-200 button-shine min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 active:scale-95';

	const variantClasses = {
		primary:
			'bg-bakery-500 text-white hover:bg-bakery-600 hover:shadow-lg hover:-translate-y-1 hover:shadow-warm-glow active:translate-y-0 disabled:bg-bakery-300 disabled:text-bakery-600 disabled:shadow-none disabled:translate-y-0',
		secondary:
			'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-md hover:-translate-y-1 active:translate-y-0 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:shadow-none disabled:translate-y-0',
		success:
			'bg-success-500 text-white hover:bg-success-600 hover:shadow-lg hover:-translate-y-1 hover:shadow-success-500/20 active:translate-y-0 disabled:bg-success-300 disabled:text-success-700 disabled:shadow-none disabled:translate-y-0',
		warning:
			'bg-warning-500 text-white hover:bg-warning-600 hover:shadow-lg hover:-translate-y-1 hover:shadow-warning-500/20 active:translate-y-0 disabled:bg-warning-300 disabled:text-warning-700 disabled:shadow-none disabled:translate-y-0',
		danger:
			'bg-error-500 text-white hover:bg-error-600 hover:shadow-lg hover:-translate-y-1 hover:shadow-error-500/20 active:translate-y-0 disabled:bg-error-300 disabled:text-error-700 disabled:shadow-none disabled:translate-y-0',
		ghost:
			'bg-transparent text-bakery-700 hover:bg-bakery-100 hover:text-bakery-800 active:bg-bakery-200 disabled:text-neutral-400 disabled:bg-transparent'
	};

	const sizeClasses = {
		sm: 'px-4 py-2 text-xs rounded-md',
		md: 'px-6 py-2.5 text-sm rounded-lg',
		lg: 'px-8 py-3 text-base rounded-lg'
	};
</script>

<button
	{type}
	disabled={isDisabled}
	aria-label={ariaLabel}
	aria-describedby={ariaDescribedby}
	{tabindex}
	aria-disabled={isDisabled}
	aria-busy={loading}
	class={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
	onclick={onclick}
	{...rest}
>
	{#if loading}
		<Spinner size="sm" color="white" />
	{/if}
	{@render children()}
</button>
