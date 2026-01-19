<script lang="ts">
	import Toast from './Toast.svelte';
	import { toastStore, remove } from '$lib/stores/toast';
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
	{#each $toastStore as toast (toast.id)}
		<Toast
			id={toast.id}
			message={toast.message}
			type={toast.type}
			duration={toast.duration}
			onRemove={remove}
		/>
	{/each}
</div>
