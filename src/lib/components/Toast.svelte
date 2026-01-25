 <script lang="ts">
	import { fly, slide } from 'svelte/transition';

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
 		success: 'bg-success-50 border-success-200 text-success-700',
 		error: 'bg-error-50 border-error-200 text-error-700',
 		info: 'bg-info-50 border-info-200 text-info-700',
 		warning: 'bg-warning-50 border-warning-200 text-warning-700'
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
		transition:fly={{ x: 400, duration: 300 }}
		class="flex items-start gap-3 p-4 rounded-lg border shadow-lg {typeStyles[type]}"
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
			class="flex-shrink-0 p-1 rounded hover:bg-neutral-100 transition-colors"
			aria-label="Close"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
 {/if}
