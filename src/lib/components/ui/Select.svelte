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

	const baseClasses = 'block w-full px-4 py-2.5 min-h-[44px] border rounded-xl shadow-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400';

	const errorState = $derived.by(() => {
		if (error) {
			return 'border-error-500 focus:ring-error-500 focus:border-error-500';
		}
		return 'border-gray-200 focus:ring-primary-500 focus:border-transparent';
	});
</script>

<select
	{id}
	{name}
	{placeholder}
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
		<option {value}>{option.label}</option>
	{/each}
</select>
{#if error}
	<p id={errorId} class="mt-1.5 text-sm text-error-600" role="alert">{error}</p>
{/if}
