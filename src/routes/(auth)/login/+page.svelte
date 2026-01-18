<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { form } = $props<{ form: { error?: string } }>();
</script>

<Card class="max-w-md mx-auto mt-8">
	<div class="p-6">
		<h1 class="text-2xl font-bold text-center mb-6">Restaurant Ordering System</h1>
		
		<form 
			method="POST" 
			class="space-y-4"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						await goto('/');
					}
				};
			}}
		>
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
					Email
				</label>
				<Input
					id="email"
					name="email"
					type="email"
					required
					placeholder="Enter your email"
					class="w-full"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
					Password
				</label>
				<Input
					id="password"
					name="password"
					type="password"
					required
					placeholder="Enter your password"
					class="w-full"
				/>
			</div>

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{form.error}
				</div>
			{/if}

			<Button type="submit" class="w-full">
				Login
			</Button>
		</form>

		<div class="mt-6 text-sm text-gray-600">
			<h3 class="font-semibold mb-2">Sample Accounts:</h3>
			<div class="space-y-1 text-xs">
				<div><strong>Order Taker:</strong> john@bakery.com / password123</div>
				<div><strong>Kitchen:</strong> jane@bakery.com / password123</div>
				<div><strong>Delivery:</strong> mike@bakery.com / password123</div>
			</div>
		</div>
	</div>
</Card>