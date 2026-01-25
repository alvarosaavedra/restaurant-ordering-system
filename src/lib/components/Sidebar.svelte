<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { page } from '$app/state';
	import { fade, fly, slide } from 'svelte/transition';

	interface NavItem {
		href: string;
		label: string;
		icon: string;
		roles: ('order_taker' | 'kitchen' | 'delivery' | 'admin')[];
	}

	interface Props {
		user: {
			name: string;
			role: 'order_taker' | 'kitchen' | 'delivery' | 'admin';
		};
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { user, isOpen, onClose }: Props = $props();

	let sidebarRef = $state<HTMLDivElement | null>(null);

	const navigationItems: NavItem[] = [
		{ href: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7-7', roles: ['order_taker', 'kitchen', 'delivery', 'admin'] },
		{ href: '/orders/new', label: 'New Order', icon: 'M12 4v16m8-8H4', roles: ['order_taker', 'admin'] },
		{ href: '/orders', label: 'Order History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2h2a2 2 0 012 2', roles: ['order_taker', 'kitchen', 'delivery', 'admin'] },
		{ href: '/kitchen', label: 'Kitchen', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: ['kitchen', 'admin'] },
		{ href: '/delivery', label: 'Delivery', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0', roles: ['delivery', 'admin'] },
		{ href: '/admin/menu', label: 'Admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roles: ['admin'] }
	];

	let filteredNavItems = $derived(navigationItems.filter((item) => item.roles.includes(user.role)));

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}

	function isPrefixActive(prefix: string): boolean {
		return page.url.pathname.startsWith(prefix);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen && onClose) {
			onClose();
		}
	}

	$effect(() => {
		if (isOpen && sidebarRef) {
			const firstLink = sidebarRef?.querySelector('a');
			firstLink?.focus();
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Mobile Overlay -->
{#if isOpen}
	<div
		class="fixed inset-0 bg-neutral-900/50 z-40 lg:hidden"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		aria-hidden="true"
	></div>
{/if}

<aside
	bind:this={sidebarRef}
	class="fixed top-0 left-0 h-full w-60 bg-white border-r border-neutral-200 z-50 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto {
			isOpen ? 'translate-x-0' : '-translate-x-full'
		}"
	role="navigation"
	aria-label="Main navigation"
>
	<!-- Logo Area -->
	<div class="gradient-bg p-6 border-b border-bakery-600">
		<div class="flex items-center justify-center gap-3">
			<div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center" aria-hidden="true">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
			</div>
			<div>
				<h1 class="text-xl font-bold text-white">Restaurant</h1>
				<p class="text-xs text-white/80">Ordering System</p>
			</div>
		</div>
	</div>

	<!-- User Info -->
	<div class="p-4 border-b border-neutral-200">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 bg-bakery-100 rounded-full flex items-center justify-center">
				<span class="text-sm font-bold text-bakery-700">{user.name.charAt(0).toUpperCase()}</span>
			</div>
			<div class="flex-1 min-w-0">
				<p class="font-medium text-neutral-900 truncate">{user.name}</p>
				<p class="text-sm text-neutral-500 capitalize">{user.role.replace('_', ' ')}</p>
			</div>
		</div>
	</div>

	<!-- Navigation Items -->
	<nav class="p-4 space-y-1" aria-label="Navigation menu">
		{#each filteredNavItems as item (item.href)}
			<a
				href={item.href}
				class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] {
					isActive(item.href)
						? 'bg-bakery-100 text-bakery-700 border-l-4 border-bakery-500'
						: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border-l-4 border-transparent'
				}"
				role="menuitem"
				aria-current={isActive(item.href) ? 'page' : undefined}
				onclick={onClose}
			>
				<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
				</svg>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>

	<!-- Logout -->
	<div class="p-4 border-t border-neutral-200 mt-auto">
		<form action="/logout" method="POST">
			<Button
				type="submit"
				variant="ghost"
				class="w-full justify-start"
				aria-label="Logout"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
				</svg>
				Logout
			</Button>
		</form>
	</div>
</aside>
