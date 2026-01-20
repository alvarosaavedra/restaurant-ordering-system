<script lang="ts">
	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
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
		onclick,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedby,
		tabindex,
		...rest
	}: Props = $props();

	const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 button-shine min-h-[44px] min-w-[44px]';
	
	const variantClasses = {
		primary: 'gradient-bg text-white hover:shadow-lg hover:shadow-primary-500/30 focus:ring-primary-500',
		secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
		danger: 'bg-gradient-to-r from-error-600 to-error-700 text-white hover:shadow-lg hover:shadow-error-500/30 focus:ring-error-500'
	};

	const sizeClasses = {
		sm: 'px-4 py-2 text-xs',
		md: 'px-6 py-2.5 text-sm',
		lg: 'px-8 py-3 text-base'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	aria-label={ariaLabel}
	aria-describedby={ariaDescribedby}
	{tabindex}
	aria-disabled={disabled}
	class={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
	{...rest}
>
	{@render children()}
</button>