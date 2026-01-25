<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		color?: 'bakery' | 'white' | 'gray' | 'success' | 'warning' | 'error';
	}

	let { size = 'md', class: className = '', color = 'bakery' }: Props = $props();

	const sizeClasses = {
		sm: 'w-4 h-4 border-2',
		md: 'w-8 h-8 border-3',
		lg: 'w-12 h-12 border-4'
	};

	const colorClasses = {
		bakery: 'border-bakery-500 border-t-transparent',
		white: 'border-white border-t-transparent',
		gray: 'border-neutral-300 border-t-transparent',
		success: 'border-success-500 border-t-transparent',
		warning: 'border-warning-500 border-t-transparent',
		error: 'border-error-500 border-t-transparent'
	};
</script>

<div
	class="animate-spin rounded-full {sizeClasses[size]} {colorClasses[color]} {className}"
	role="status"
	aria-label="Loading"
></div>
