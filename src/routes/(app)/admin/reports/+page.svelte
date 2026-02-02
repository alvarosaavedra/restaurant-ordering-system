<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';

	const reportCategories = [
		{
			title: 'Sales & Revenue',
			description: 'Revenue trends, daily sales, and financial metrics',
			href: '/admin/reports/sales',
			icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
			color: 'text-green-600',
			bgColor: 'bg-green-50'
		},
		{
			title: 'Order Statistics',
			description: 'Order volume, status breakdown, and completion times',
			href: '/admin/reports/orders',
			icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
			color: 'text-blue-600',
			bgColor: 'bg-blue-50'
		},
		{
			title: 'Menu Performance',
			description: 'Top selling items, category analysis, and revenue by item',
			href: '/admin/reports/menu',
			icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
			color: 'text-orange-600',
			bgColor: 'bg-orange-50'
		},
		{
			title: 'Client Reports',
			description: 'Customer insights, top clients, and order frequency',
			href: '/admin/reports/clients',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
			color: 'text-purple-600',
			bgColor: 'bg-purple-50'
		},
		{
			title: 'Employee Performance',
			description: 'Staff productivity and order metrics by employee',
			href: '/admin/reports/employees',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
			color: 'text-indigo-600',
			bgColor: 'bg-indigo-50'
		}
	];

	function navigateToReport(href: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(href);
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Reports</h1>
			<p class="mt-2 text-gray-600">View comprehensive analytics and insights about your restaurant operations</p>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each reportCategories as category (category.href)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<Card clickable class="hover:shadow-lg transition-shadow" onclick={() => navigateToReport(category.href)}>
				<div class="p-6">
					<div class="flex items-start space-x-4">
						<div class="{category.bgColor} p-3 rounded-lg">
							<svg class="w-6 h-6 {category.color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={category.icon} />
							</svg>
						</div>
						<div class="flex-1">
							<h3 class="text-lg font-semibold text-gray-900">{category.title}</h3>
							<p class="mt-1 text-sm text-gray-600">{category.description}</p>
						</div>
					</div>
					<div class="mt-4 flex items-center text-sm text-primary-600 font-medium">
						<span>View Report</span>
						<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</Card>
		{/each}
	</div>
</div>
