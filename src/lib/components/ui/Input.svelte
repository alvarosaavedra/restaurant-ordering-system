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
		error?: string;
		'aria-label'?: string;
		'aria-describedby'?: string;
		autocomplete?: 'on' | 'off' | 'name' | 'email' | 'tel' | 'username' | 'given-name' | 'family-name';
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
		error,
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedby,
		autocomplete,
		...rest
	}: Props = $props();

	let errorId = $derived(error ? `${id}-error` : undefined);
	let combinedAriaDescribedby = $derived(ariaDescribedby && errorId ? `${ariaDescribedby} ${errorId}` : (ariaDescribedby || errorId));

	const baseClasses = 'block w-full px-4 py-2.5 min-h-[44px] border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400';

	const errorState = $derived.by(() => {
		if (error) {
			return 'border-error-500 focus:ring-error-500 focus:border-error-500';
		}
		return 'border-gray-200 focus:ring-primary-500 focus:border-transparent';
	});
</script>

<input
	{id}
	{name}
	{type}
	{placeholder}
	{required}
	{disabled}
	{oninput}
	aria-label={ariaLabel}
	aria-describedby={combinedAriaDescribedby}
	{autocomplete}
	aria-invalid={!!error}
	aria-required={required}
	bind:value
	class={`${baseClasses} ${errorState} ${className}`}
	{...rest}
/>
{#if error}
	<p id={errorId} class="mt-1.5 text-sm text-error-600" role="alert">{error}</p>
{/if}
