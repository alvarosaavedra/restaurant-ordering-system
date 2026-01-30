<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { form } = $props<{ form: { error?: string; success?: boolean; redirectTo?: string } }>();
	let isLoading = $state(false);
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
			<form
				method="POST"
				use:enhance={() => {
					return async ({ result }: { result: { type: string; location?: string } }) => {
						if (result.type === 'redirect' && result.location) {
							// eslint-disable-next-line svelte/no-navigation-without-resolve
							await goto(result.location, { replaceState: true });
						} else {
							isLoading = false;
						}
					};
				}}
				onsubmit={() => isLoading = true}
				class="space-y-5"
			>
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

				<Button type="submit" disabled={isLoading} class="w-full">{isLoading ? 'Signing in...' : 'Sign In'}</Button>
			</form>
		</Card>
	</div>
</div>
