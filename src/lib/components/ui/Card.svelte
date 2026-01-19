<script lang="ts">
	interface Props {
		class?: string;
		children: import('svelte').Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<div class="bg-white shadow-lg border border-gray-100 rounded-2xl card-hover {className}">
	{@render children()}
</div>