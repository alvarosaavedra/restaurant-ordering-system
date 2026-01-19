<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { form } = $props<{ form: { error?: string } }>();
</script>

<div class="min-h-screen subtle-gradient flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<div class="w-16 h-16 gradient-bg rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary-500/30">
				<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gradient">Welcome Back</h1>
			<p class="mt-2 text-gray-600">Sign in to your account to continue</p>
		</div>

		<Card class="p-8">
			<form method="POST" class="space-y-5">
				<div>
					<label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
					<Input id="email" name="email" type="email" required placeholder="you@example.com" class="w-full" />
				</div>

				<div>
					<label for="password" class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
					<Input id="password" name="password" type="password" required placeholder="•••••••••" class="w-full" />
				</div>

				{#if form?.error}
					<div class="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl flex items-start gap-3">
						<svg class="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="text-sm font-medium">{form.error}</span>
					</div>
				{/if}

				<Button type="submit" class="w-full">Sign In</Button>
			</form>

			<div class="mt-8 pt-6 border-t border-gray-200">
				<h3 class="text-sm font-semibold text-gray-900 mb-3">Sample Accounts</h3>
				<div class="space-y-2">
					<div class="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
							<div>
								<div class="text-xs font-semibold text-primary-900">Order Taker</div>
								<div class="text-xs text-primary-600">john@bakery.com</div>
							</div>
						</div>
						<span class="text-xs font-mono bg-white px-2 py-1 rounded text-primary-700">password123</span>
					</div>

					<div class="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 bg-accent-200 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-accent-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
								</svg>
							</div>
							<div>
								<div class="text-xs font-semibold text-accent-900">Kitchen</div>
								<div class="text-xs text-accent-600">jane@bakery.com</div>
							</div>
						</div>
						<span class="text-xs font-mono bg-white px-2 py-1 rounded text-accent-700">password123</span>
					</div>

					<div class="flex items-center justify-between p-3 bg-success-50 rounded-lg">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 bg-success-200 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-success-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
								</svg>
							</div>
							<div>
								<div class="text-xs font-semibold text-success-900">Delivery</div>
								<div class="text-xs text-success-600">mike@bakery.com</div>
							</div>
						</div>
						<span class="text-xs font-mono bg-white px-2 py-1 rounded text-success-700">password123</span>
					</div>

					<div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM4 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
								</svg>
							</div>
							<div>
								<div class="text-xs font-semibold text-white">Admin</div>
								<div class="text-xs text-gray-300">admin@bakery.com</div>
							</div>
						</div>
						<span class="text-xs font-mono bg-gray-700 px-2 py-1 rounded text-white">password123</span>
					</div>
				</div>
			</div>
		</Card>
	</div>
</div>
