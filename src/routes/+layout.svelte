<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children }: { data: any; children: import('svelte').Snippet } = $props();

	const user = $derived(data.user);
	const isLoggedIn = $derived(!!user);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if !isLoggedIn}
	{@render children()}
{:else}
	<div class="min-h-screen bg-gray-100">
		<nav class="bg-white shadow-sm border-b">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center">
						<h1 class="text-xl font-semibold text-gray-900">Restaurant Ordering System</h1>
					</div>
					<div class="flex items-center space-x-4">
						<span class="text-sm text-gray-700">{user?.name} ({user?.role})</span>
						<a href="/logout" class="text-sm text-gray-500 hover:text-gray-700">Logout</a>
					</div>
				</div>
			</div>
		</nav>

		{#if user?.role}
			<nav class="bg-white border-b">
				<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div class="flex space-x-8">
						<a href="/" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-blue-500 text-gray-900">Dashboard</a>
						{#if user.role === 'order_taker'}
							<a href="/orders/new" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">New Order</a>
						{/if}
						{#if user.role === 'order_taker' || user.role === 'kitchen' || user.role === 'delivery'}
							<a href="/orders" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Order History</a>
						{/if}
						{#if user.role === 'kitchen'}
							<a href="/kitchen" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Kitchen</a>
						{/if}
						{#if user.role === 'delivery'}
							<a href="/delivery" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Delivery</a>
						{/if}
					</div>
				</div>
			</nav>
		{/if}

		<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
			{@render children()}
		</main>
	</div>
{/if}