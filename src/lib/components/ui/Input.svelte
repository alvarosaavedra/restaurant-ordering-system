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
		success?: boolean;
		'aria-label'?: string;
		'aria-describedby'?: string;
		autocomplete?: 'on' | 'off' | 'name' | 'email' | 'tel' | 'username' | 'given-name' | 'family-name';
		step?: string;
		min?: string;
		max?: string;
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
		success,
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedby,
		autocomplete,
		step,
		min,
		max,
		...rest
	}: Props = $props();

	let errorId = $derived(error ? `${id}-error` : undefined);
	let successId = $derived(success ? `${id}-success` : undefined);
	let combinedAriaDescribedby = $derived(
		ariaDescribedby && errorId
			? `${ariaDescribedby} ${errorId}`
			: ariaDescribedby && successId
				? `${ariaDescribedby} ${successId}`
				: errorId || successId || ariaDescribedby
	);

	const baseClasses =
		'block w-full px-4 py-2.5 min-h-[44px] border rounded-lg shadow-sm placeholder:text-neutral-400 focus:outline-none transition-all duration-200';

	const stateClasses = $derived.by(() => {
		if (error) {
			return 'border-error-500 focus:ring-2 focus:ring-error-500 focus:border-error-500 text-neutral-500';
		}
		if (success) {
			return 'border-success-500 focus:ring-2 focus:ring-success-500 focus:border-success-500 text-neutral-500';
		}
		return 'border-neutral-200 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 text-neutral-500';
	});

	const disabledClasses = 'disabled:bg-neutral-100 disabled:border-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:shadow-none';
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
	{step}
	{min}
	{max}
	aria-invalid={!!error}
	aria-required={required}
	bind:value
	class={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
	{...rest}
/>
{#if error}
	<p id={errorId} class="mt-1.5 text-sm text-error-600" role="alert">{error}</p>
{/if}
