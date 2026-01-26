<script lang="ts">
	interface Props {
		variant?: 'default' | 'elevated' | 'bordered' | 'subtle';
		class?: string;
		children: import('svelte').Snippet;
		clickable?: boolean;
		onclick?: () => void;
	}

	let { variant = 'default', class: className = '', children, clickable = false, onclick }: Props = $props();

	const baseClasses = 'rounded-lg transition-all duration-300';

	const variantClasses = {
		default: 'bg-white shadow-sm hover:shadow-md hover:-translate-y-1 active:shadow-sm active:translate-y-0',
		elevated: 'bg-white shadow-md hover:shadow-lg hover:-translate-y-1 active:shadow-md active:translate-y-0',
		bordered:
			'bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm hover:-translate-y-1 active:shadow-none active:translate-y-0',
		subtle: 'bg-neutral-50 hover:bg-neutral-100 hover:shadow-sm hover:-translate-y-1 active:shadow-none active:translate-y-0'
	};

	let clickableClasses = $derived(clickable ? 'cursor-pointer' : '');
</script>

{#if clickable}
	<div
		onclick={onclick}
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onclick?.();
			}
		}}
		class={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`}
		role="button"
		tabindex="0"
	>
		{@render children()}
	</div>
{:else}
	<div class={`${baseClasses} ${variantClasses[variant]} ${className}`}>
		{@render children()}
	</div>
{/if}
