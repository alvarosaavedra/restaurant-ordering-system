<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>

<div class="container mx-auto">
	{@render children()}
</div>
