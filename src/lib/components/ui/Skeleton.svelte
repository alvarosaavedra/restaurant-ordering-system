<script lang="ts">
	interface Props {
		class?: string;
		width?: string;
		height?: string;
		variant?: 'default' | 'circle';
	}

	let { class: className = '', width = '100%', height = '1rem', variant = 'default' }: Props = $props();

	const baseClasses = 'animate-pulse bg-gray-200 rounded';
	const variantClasses = {
		default: '',
		circle: 'rounded-full'
	};
</script>

<div
	class="{baseClasses} {variantClasses[variant]} {className}"
	style="width: {width}; height: {height};"
	role="status"
	aria-label="Loading"
></div>
