<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import { page } from '$app/state';
	import '../layout.css';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let { data, children }: { data: any; children: import('svelte').Snippet } = $props();

	const user = $derived(data.user);
	const isLoggedIn = $derived(!!user);
	let isMobileMenuOpen = $state(false);
</script>

<!-- Only render if user is authenticated -->
{#if isLoggedIn}
	<div class="min-h-screen bg-neutral-50 flex">
		<!-- Mobile Header -->
		<header class="lg:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center" aria-hidden="true">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
					</svg>
				</div>
				<h1 class="text-lg font-bold text-neutral-900">Restaurant Ordering</h1>
			</div>
			<button
				onclick={() => isMobileMenuOpen = true}
				class="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
				aria-label="Open menu"
				aria-expanded={isMobileMenuOpen}
			>
				<svg class="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
		</header>

		<!-- Desktop Sidebar -->
		<Sidebar user={user} isOpen={isMobileMenuOpen} onClose={() => isMobileMenuOpen = false} />

		<!-- Main Content Area -->
		<main id="main-content" class="flex-1 lg:ml-60 py-6 px-4 sm:px-6 lg:px-8" tabindex="-1">
			{@render children()}
		</main>

		<!-- Mobile Bottom Navigation -->
		<MobileBottomNav user={user} />
	</div>
{:else}
	<!-- Redirect to login if not authenticated -->
	<div class="flex items-center justify-center min-h-screen">
		<p>Redirecting to login...</p>
	</div>
{/if}

<ToastContainer />
