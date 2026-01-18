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
	<div class="min-h-screen bg-gray-100">
		<nav class="bg-white shadow-sm border-b">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center">
						<h1 class="text-xl font-semibold text-gray-900">Restaurant Ordering System</h1>
					</div>
					<div class="flex items-center space-x-4">
						<span class="text-sm text-gray-700">{user?.name} ({user?.role})</span>
						<form action="/logout" method="POST" class="inline">
							<button
								type="submit"
								class="text-sm text-gray-500 hover:text-gray-700 hover:underline"
							>
								Logout
							</button>
						</form>
					</div>
				</div>
			</div>
		</nav>

		{#if user?.role}
			<nav class="bg-white border-b">
				<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div class="flex space-x-8">
						<!-- Dashboard -->
						<a 
							href="/" 
							class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {
								isActive('/')
									? 'border-blue-500 text-gray-900' 
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}"
						>
							Dashboard
						</a>
						
						<!-- New Order -->
						{#if user.role === 'order_taker'}
							<a 
								href="/orders/new" 
								class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {
									isActive('/orders/new')
										? 'border-blue-500 text-gray-900' 
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}"
							>
								New Order
							</a>
						{/if}
						
						<!-- Order History -->
						{#if user.role === 'order_taker' || user.role === 'kitchen' || user.role === 'delivery'}
							<a 
								href="/orders" 
								class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {
									isActive('/orders')
										? 'border-blue-500 text-gray-900' 
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}"
							>
								Order History
							</a>
						{/if}
						
						<!-- Kitchen -->
						{#if user.role === 'kitchen'}
							<a 
								href="/kitchen" 
								class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {
									isActive('/kitchen')
										? 'border-blue-500 text-gray-900' 
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}"
							>
								Kitchen
							</a>
						{/if}
						
						<!-- Delivery -->
						{#if user.role === 'delivery'}
							<a 
								href="/delivery" 
								class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {
									isActive('/delivery')
										? 'border-blue-500 text-gray-900' 
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}"
							>
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