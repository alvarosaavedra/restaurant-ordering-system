<script lang="ts">
	interface Props {
		id?: string;
		name?: string;
		type?: 'text' | 'email' | 'password' | 'number';
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		value?: string;
		oninput?: (e: Event) => void;
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
		oninput,
		class: className = '',
		...rest
	}: Props = $props();

	const baseClasses = 'block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400';
</script>

<input
	{id}
	{name}
	{type}
	{placeholder}
	{required}
	{disabled}
	{oninput}
	bind:value
	class={`${baseClasses} ${className}`}
	{...rest}
/>