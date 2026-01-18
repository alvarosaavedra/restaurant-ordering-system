<script lang="ts">
	let { data }: { data: any } = $props();
</script>

<div class="px-4 py-6">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-2 text-gray-600">
			Welcome to the Restaurant Ordering System, {data.user?.name}!
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="bg-white p-6 rounded-lg shadow border">
			<h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
			<div class="mt-4 space-y-2">
				{#if data.user?.role === 'order_taker'}
					<a href="/orders/new" class="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
						Create New Order
					</a>
				{/if}
				<a href="/orders" class="block w-full text-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
					View Orders
				</a>
			</div>
		</div>

		<div class="bg-white p-6 rounded-lg shadow border">
			<h3 class="text-lg font-medium text-gray-900">Your Role</h3>
			<div class="mt-4">
				<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
					{data.user?.role}
				</span>
			</div>
		</div>

		<div class="bg-white p-6 rounded-lg shadow border">
			<h3 class="text-lg font-medium text-gray-900">System Status</h3>
			<div class="mt-4">
				<div class="flex items-center">
					<div class="w-3 h-3 bg-green-400 rounded-full"></div>
					<span class="ml-2 text-sm text-gray-600">System Online</span>
				</div>
			</div>
		</div>
	</div>
</div>