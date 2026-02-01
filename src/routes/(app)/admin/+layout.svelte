<script lang="ts">
	import { page } from '$app/state';

	let { children }: { children: import('svelte').Snippet } = $props();

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}

	function isActiveSection(href: string): boolean {
		return page.url.pathname.startsWith(href);
	}

	const mainSections = [
		{
			href: '/admin/menu',
			label: 'Menu Management',
			icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
		},
		{
			href: '/admin/clients',
			label: 'Client Management',
			icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
		},
		{
			href: '/admin/reports',
			label: 'Reports',
			icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
		}
	];

	const reportSubsections = [
		{ href: '/admin/reports/sales', label: 'Sales' },
		{ href: '/admin/reports/orders', label: 'Orders' },
		{ href: '/admin/reports/menu', label: 'Menu' },
		{ href: '/admin/reports/clients', label: 'Clients' },
		{ href: '/admin/reports/employees', label: 'Employees' }
	];
</script>

<div class="flex flex-col lg:flex-row gap-6">
	<!-- Admin Sidebar -->
	<aside class="w-full lg:w-64 flex-shrink-0">
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			<!-- Header -->
			<div class="bg-gradient-to-r from-primary-600 to-primary-700 p-4 border-b border-primary-600">
				<div class="flex items-center gap-2">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<h2 class="text-lg font-bold text-white">Admin Panel</h2>
				</div>
			</div>

			<!-- Navigation -->
			<nav class="p-3 space-y-1" aria-label="Admin navigation">
				{#each mainSections as section (section.href)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={section.href}
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 {isActive(section.href)
						? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
						: isActiveSection(section.href)
							? 'bg-primary-50/50 text-primary-600 border-l-4 border-primary-400'
							: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
					}"
						aria-current={isActive(section.href) ? 'page' : undefined}
					>
						<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={section.icon} />
						</svg>
						<span>{section.label}</span>
					</a>

					<!-- Report subsections -->
					{#if section.href === '/admin/reports' && isActiveSection('/admin/reports')}
						<div class="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
							{#each reportSubsections as subsection (subsection.href)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={subsection.href}
								class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 {isActive(subsection.href)
									? 'bg-primary-100 text-primary-700 font-medium'
									: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
									}"
									aria-current={isActive(subsection.href) ? 'page' : undefined}
								>
									<span class="w-1.5 h-1.5 rounded-full {isActive(subsection.href) ? 'bg-primary-500' : 'bg-gray-300'}"></span>
									<span>{subsection.label}</span>
								</a>
							{/each}
						</div>
					{/if}
				{/each}
			</nav>
		</div>
	</aside>

	<!-- Content Area -->
	<main class="flex-1 min-w-0">
		{@render children()}
	</main>
</div>
