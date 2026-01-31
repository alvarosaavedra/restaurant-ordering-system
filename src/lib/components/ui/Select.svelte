<script lang="ts">
	interface SelectOption {
		value: string;
		label: string;
	}

	interface Props {
		id?: string;
		name?: string;
		value?: string;
		options: SelectOption[];
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		onchange?: (e: Event) => void;
		class?: string;
		'aria-label'?: string;
		'aria-describedby'?: string;
	}

	let {
		id,
		name,
		value = $bindable(''),
		options,
		placeholder = 'Select an option',
		required = false,
		disabled = false,
		error,
		onchange,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedby,
		...rest
	}: Props = $props();

	let errorId = $derived(error ? `${id}-error` : undefined);
	let combinedAriaDescribedby = $derived(ariaDescribedby && errorId ? `${ariaDescribedby} ${errorId}` : (ariaDescribedby || errorId));

	const baseClasses = 'appearance-none block w-full px-4 py-3 min-h-[48px] pr-10 border rounded-xl shadow-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 cursor-pointer text-[16px]';

	const errorState = $derived.by(() => {
		if (error) {
			return 'border-error-500 focus:ring-error-500 focus:border-error-500';
		}
		return 'border-gray-200 focus:ring-primary-500 focus:border-transparent';
	});
</script>

<style>
	select {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.75rem center;
		background-repeat: no-repeat;
		background-size: 1.5rem 1.5rem;
	}

	/* Mobile-specific fixes */
	@media (pointer: coarse) {
		select {
			background-position: right 0.75rem center;
			padding-right: 2.5rem;
			font-size: 16px !important; /* Prevent iOS zoom */
		}
	}

	/* Ensure select is clickable on mobile */
	select {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}
</style>

<select
	{id}
	{name}
	{required}
	{disabled}
	{onchange}
	aria-label={ariaLabel}
	aria-describedby={combinedAriaDescribedby}
	aria-invalid={!!error}
	aria-required={required}
	bind:value
	class={`${baseClasses} ${errorState} ${className}`}
	{...rest}
>
	<option value="">{placeholder}</option>
	{#each options as option (option.value)}
		<option value={option.value}>{option.label}</option>
	{/each}
</select>
{#if error}
	<p id={errorId} class="mt-1.5 text-sm text-error-600" role="alert">{error}</p>
{/if}
