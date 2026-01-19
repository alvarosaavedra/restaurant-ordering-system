<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	let { data }: { data: any } = $props();
</script>

<div class="px-4 py-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gradient">Dashboard</h1>
		<p class="mt-2 text-lg text-gray-600">
			Welcome back, <span class="font-semibold text-primary-600">{data.user?.name}</span>! 👋
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
				<div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
			</div>
			<div class="space-y-3">
				{#if data.user?.role === 'order_taker'}
					<a href="/orders/new" class="block w-full">
						<Button variant="primary" class="w-full">Create New Order</Button>
					</a>
				{/if}
				<a href="/orders" class="block w-full">
					<Button variant="secondary" class="w-full">View Orders</Button>
				</a>
			</div>
		</div>

		<div class="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl shadow-lg card-hover text-white">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold">Your Role</h3>
				<div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
			</div>
			<div class="mt-4">
				<span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm">
					{data.user?.role?.toUpperCase()}
				</span>
			</div>
			<p class="mt-3 text-sm text-primary-100">
				{#if data.user?.role === 'order_taker'}
					You can create and manage orders
				{:else if data.user?.role === 'kitchen'}
					You can prepare and manage orders
				{:else if data.user?.role === 'delivery'}
					You can manage deliveries
				{/if}
			</p>
		</div>

		<div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">System Status</h3>
				<div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
			</div>
			<div class="mt-4 space-y-3">
				<div class="flex items-center justify-between p-3 bg-success-50 rounded-xl">
					<div class="flex items-center gap-3">
						<div class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
						<span class="text-sm font-medium text-success-700">System Online</span>
					</div>
					<svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<div class="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
					<div class="flex items-center gap-3">
						<div class="w-2 h-2 bg-primary-500 rounded-full"></div>
						<span class="text-sm font-medium text-primary-700">Database Connected</span>
					</div>
					<svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
			</div>
		</div>
	</div>
</div>