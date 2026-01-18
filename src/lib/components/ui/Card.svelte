<script lang="ts">
	interface Props {
		class?: string;
		children: import('svelte').Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<div class="bg-white shadow-sm border border-gray-200 rounded-lg {className}">
	{@render children()}
</div>