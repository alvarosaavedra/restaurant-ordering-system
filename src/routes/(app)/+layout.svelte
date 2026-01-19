<script lang="ts">
	import { page } from '$app/state';
	import '../layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children }: { data: any; children: import('svelte').Snippet } = $props();

	const user = $derived(data.user);
	const isLoggedIn = $derived(!!user);

	// Helper function to check if a path is active
	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

 <!-- Only render if user is authenticated -->
{#if isLoggedIn}
	<div class="min-h-screen subtle-gradient">
		<nav class="glass-effect sticky top-0 z-50 border-b border-gray-200/50">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
						</div>
						<h1 class="text-xl font-bold text-gradient">Restaurant Ordering</h1>
					</div>
					<div class="flex items-center gap-4">
						<div class="hidden sm:flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-full">
							<div class="w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
								<span class="text-xs font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
							</div>
							<span class="text-sm font-medium text-primary-700">{user?.name}</span>
							<span class="text-xs text-primary-400 ml-1">({user?.role})</span>
						</div>
						<form action="/logout" method="POST" class="inline">
							<button
								type="submit"
								class="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								Logout
							</button>
						</form>
					</div>
				</div>
			</div>
		</nav>

		{#if user?.role}
			<nav class="bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
				<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div class="flex space-x-1">
						<!-- Dashboard -->
						<a 
							href="/" 
							class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all {
								isActive('/')
									? 'bg-primary-100 text-primary-700 shadow-sm' 
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
							}"
						>
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
							</svg>
							Dashboard
						</a>
						
						<!-- New Order -->
						{#if user.role === 'order_taker'}
							<a 
								href="/orders/new" 
								class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all {
									isActive('/orders/new')
										? 'bg-primary-100 text-primary-700 shadow-sm' 
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
								}"
							>
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								New Order
							</a>
						{/if}
						
						<!-- Order History -->
						{#if user.role === 'order_taker' || user.role === 'kitchen' || user.role === 'delivery'}
							<a 
								href="/orders" 
								class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all {
									isActive('/orders')
										? 'bg-primary-100 text-primary-700 shadow-sm' 
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
								}"
							>
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
								Order History
							</a>
						{/if}
						
						<!-- Kitchen -->
						{#if user.role === 'kitchen'}
							<a 
								href="/kitchen" 
								class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all {
									isActive('/kitchen')
										? 'bg-primary-100 text-primary-700 shadow-sm' 
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
								}"
							>
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
								</svg>
								Kitchen
							</a>
						{/if}
						
						<!-- Delivery -->
						{#if user.role === 'delivery'}
							<a 
								href="/delivery" 
								class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all {
									isActive('/delivery')
										? 'bg-primary-100 text-primary-700 shadow-sm' 
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
								}"
							>
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
								</svg>
								Delivery
							</a>
						{/if}
					</div>
				</div>
			</nav>
		{/if}

		<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
			{@render children()}
		</main>
	</div>
{:else}
	<!-- Redirect to login if not authenticated -->
	<div class="flex items-center justify-center min-h-screen">
		<p>Redirecting to login...</p>
	</div>
{/if}