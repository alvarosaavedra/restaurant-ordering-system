<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		user: {
			role: 'order_taker' | 'kitchen' | 'delivery' | 'admin';
		};
	}

	let { user }: Props = $props();

	let showNewOrder = $derived(user.role === 'order_taker' || user.role === 'admin');

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<!-- Mobile Bottom Navigation -->
<nav
	class="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 lg:hidden z-40"
	aria-label="Quick actions"
>
	<div class="flex justify-around max-w-7xl mx-auto">
		<!-- Dashboard Button -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/" class="flex flex-col items-center gap-1 text-xs font-medium transition-all {
			isActive('/')
				? 'text-bakery-700'
				: 'text-neutral-500 hover:text-neutral-900'
		}"
		role="menuitem"
		tabindex="0"
		aria-current={isActive('/') ? 'page' : undefined}
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
			</svg>
			<span>Dashboard</span>
		</a>

		<!-- New Order Button (order_taker and admin only) -->
		{#if showNewOrder}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href="/orders/new" class="flex flex-col items-center gap-1 text-xs font-medium transition-all {
				isActive('/orders/new')
					? 'text-bakery-700'
					: 'text-neutral-500 hover:text-neutral-900'
			}"
			role="menuitem"
			tabindex="0"
			aria-current={isActive('/orders/new') ? 'page' : undefined}
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				<span>New Order</span>
			</a>
		{/if}
	</div>
</nav>
