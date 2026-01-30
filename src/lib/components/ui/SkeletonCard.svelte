<script lang="ts">
	import Skeleton from './Skeleton.svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 {className}">
	<div class="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
		<div class="flex-1">
			<div class="flex items-center gap-3 mb-2">
				<Skeleton width="120px" height="24px" />
				<Skeleton width="80px" height="24px" variant="circle" />
			</div>
			<div class="flex items-center gap-4">
				<Skeleton width="100px" height="16px" />
				<Skeleton width="80px" height="16px" />
			</div>
		</div>
		<div class="text-right">
			<Skeleton width="80px" height="24px" />
			<Skeleton width="60px" height="14px" class="mt-1" />
		</div>
	</div>

	<div class="mb-4 space-y-3">
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each Array(3) as _, i (i)}
			<div class="flex items-center justify-between py-2">
				<Skeleton width="150px" height="16px" />
				<Skeleton width="60px" height="16px" />
			</div>
		{/each}
	</div>

	<Skeleton width="100%" height="40px" />
</div>


