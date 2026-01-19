<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		color?: 'primary' | 'white' | 'gray';
	}

	let { size = 'md', class: className = '', color = 'primary' }: Props = $props();

	const sizeClasses = {
		sm: 'w-4 h-4 border-2',
		md: 'w-8 h-8 border-3',
		lg: 'w-12 h-12 border-4'
	};

	const colorClasses = {
		primary: 'border-primary-500 border-t-transparent',
		white: 'border-white border-t-transparent',
		gray: 'border-gray-300 border-t-transparent'
	};
</script>

<div
	class="animate-spin rounded-full {sizeClasses[size]} {colorClasses[color]} {className}"
	role="status"
	aria-label="Loading"
></div>
