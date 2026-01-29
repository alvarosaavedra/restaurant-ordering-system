<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let loading = $state(false);

	const handleLogout = async () => {
		loading = true;
		await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
	};
</script>

<Card class="max-w-md mx-auto mt-8">
	<div class="p-6">
		<h1 class="text-xl font-semibold text-center mb-4">Logout</h1>
		
		<form method="POST" use:enhance={handleLogout}>
			<p class="text-gray-600 mb-4 text-center">Are you sure you want to logout?</p>
			
			<Button 
				type="submit" 
				variant="primary" 
				class="w-full"
				disabled={loading}
			>
				{loading ? 'Logging out...' : 'Logout'}
			</Button>
		</form>

		<p class="mt-4 text-center">
			<button onclick={() => window.history.back()} class="text-blue-600 hover:text-blue-800 text-sm">
				Cancel
			</button>
		</p>
	</div>
</Card>