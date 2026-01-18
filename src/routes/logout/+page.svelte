<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/login');
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<p>Logging out...</p>
</div>