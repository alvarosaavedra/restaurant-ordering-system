<script lang="ts">
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	interface Props {
		open: boolean;
		title: string;
		onclose?: () => void;
		children: import('svelte').Snippet;
		class?: string;
	}

	let { open, title, onclose, children, class: className = '' }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget && onclose) {
			onclose();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && onclose) {
			onclose();
		}
	}

	function handleBackdropKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && onclose) {
			onclose();
		}
	}

	$effect(() => {
		if (browser && open) {
			window.addEventListener('keydown', handleKeyDown);
			return () => window.removeEventListener('keydown', handleKeyDown);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});
</script>

{#if open}
	<div
		tabindex="-1"
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
		onclick={handleBackdropClick}
		onkeydown={handleBackdropKeyDown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 {className}">
			<div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<h2 id="modal-title" class="text-xl font-semibold text-gray-900">{title}</h2>
				{#if onclose}
					<button
						type="button"
						onclick={onclose}
						class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
						aria-label="Close modal"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>
			<div class="px-6 py-4">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
