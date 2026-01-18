<script lang="ts">
	interface Props {
		id?: string;
		name?: string;
		type?: 'text' | 'email' | 'password' | 'number';
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		value?: string;
		class?: string;
	}

	let {
		id,
		name,
		type = 'text',
		placeholder,
		required = false,
		disabled = false,
		value = $bindable(''),
		class: className = '',
		...rest
	}: Props = $props();

	const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:border-gray-300';
</script>

<input
	{id}
	{name}
	{type}
	{placeholder}
	{required}
	{disabled}
	bind:value
	class={`${baseClasses} ${className}`}
	{...rest}
/>