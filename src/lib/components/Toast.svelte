<script lang="ts">
	interface Props {
		id: string;
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
		duration?: number;
		onRemove: (id: string) => void;
	}

	let { id, message, type, duration = 5000, onRemove }: Props = $props();

	const iconContent = {
		success: 'M5 13l4 4L19 7',
		error: 'M6 18L18 6M6 6l12 12',
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
		warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
	};

	const typeStyles = {
		success: 'bg-green-50 border-green-500 text-green-800',
		error: 'bg-red-50 border-red-500 text-red-800',
		info: 'bg-blue-50 border-blue-500 text-blue-800',
		warning: 'bg-yellow-50 border-yellow-500 text-yellow-800'
	};

	let isVisible = $state(true);
	let isLeaving = $state(false);

	let timer: ReturnType<typeof setTimeout> | null = null;

	function remove() {
		if (timer) clearTimeout(timer);
		isLeaving = true;
		timer = setTimeout(() => {
			isVisible = false;
			onRemove(id);
		}, 300);
	}

	$effect(() => {
		if (duration > 0) {
			timer = setTimeout(remove, duration);
		}
		return () => {
			if (timer) clearTimeout(timer);
		};
	});
</script>

{#if isVisible}
	<div
		class="flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 {isLeaving
			? 'opacity-0 translate-x-full'
			: 'opacity-100 translate-x-0'} {typeStyles[type]}"
	>
		<div class="flex-shrink-0">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d={iconContent[type]}
				/>
			</svg>
		</div>
		<div class="flex-1 text-sm font-medium">{message}</div>
		<button
			onclick={remove}
			class="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
			aria-label="Close"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
{/if}
