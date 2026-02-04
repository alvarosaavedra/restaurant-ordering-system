<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { formatCurrency } from '$lib/utils/formatting';
	import type { EmployeePerformance } from '$lib/server/reports/employee-reports';

	interface DateRange {
		range: 'today' | 'week' | 'month' | 'custom';
		startDate: string;
		endDate: string;
	}

	let { data } = $props<{
		data: {
			performance: EmployeePerformance[];
			startDate: string;
			endDate: string;
		};
	}>();

	let performance = $derived(data.performance);

	// svelte-ignore state_referenced_locally
	let dateRange = $state<DateRange>({
		range: 'today',
		startDate: data.startDate,
		endDate: data.endDate
	});

	let currentUrl = $derived($page.url);
	let currentStartDate = $derived(currentUrl.searchParams.get('startDate'));
	let currentEndDate = $derived(currentUrl.searchParams.get('endDate'));

	let urlDateRange = $derived.by(() => {
		if (currentStartDate && currentEndDate) {
			let range: DateRange['range'] = 'custom';
			const today = new Date().toISOString().split('T')[0];
			if (currentStartDate === today && currentEndDate === today) {
				range = 'today';
			}
			return {
				range,
				startDate: currentStartDate,
				endDate: currentEndDate
			};
		}
		return null;
	});

	$effect(() => {
		if (urlDateRange && urlDateRange.startDate !== dateRange.startDate) {
			dateRange = urlDateRange;
		}
	});

	function handleDateRangeChange(range: DateRange) {
		dateRange = range;
		const url = new URL($page.url);
		url.searchParams.set('startDate', range.startDate);
		url.searchParams.set('endDate', range.endDate);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url.toString(), { keepFocus: true });
	}

	function getRoleLabel(role: string): string {
		return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
	}

	function getRoleColor(role: string): string {
		switch (role) {
			case 'order_taker': return 'text-blue-600 bg-blue-50';
			case 'kitchen': return 'text-orange-600 bg-orange-50';
			case 'delivery': return 'text-green-600 bg-green-50';
			case 'admin': return 'text-purple-600 bg-purple-50';
			default: return 'text-gray-600 bg-gray-50';
		}
	}

	let totalOrders = $derived(performance.reduce((sum: number, p: EmployeePerformance) => sum + p.orderCount, 0));
	let totalRevenue = $derived(performance.reduce((sum: number, p: EmployeePerformance) => sum + p.totalRevenue, 0));
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6">
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<button
			onclick={() => goto('/admin/reports')}
			class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
			Back to Reports
		</button>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
		<div class="flex items-center gap-3 mb-6">
			<div class="bg-indigo-50 p-3 rounded-lg">
				<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Employee Performance Report</h1>
		</div>

		<div class="max-w-2xl mb-8">
			<DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
		</div>

		{#if performance.length === 0}
			<div class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
				<div class="bg-gray-50 p-4 rounded-full mb-4">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
				</div>
				<p class="text-gray-500 text-lg font-medium">No employee data for selected date range</p>
				<p class="text-gray-400 text-sm mt-2">Try selecting a different date range</p>
			</div>
		{:else}
			<!-- Summary Cards -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Total Orders</div>
					<div class="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</div>
				</Card>
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Total Revenue</div>
					<div class="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
				</Card>
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Active Employees</div>
					<div class="text-2xl font-bold text-blue-600">{performance.length}</div>
				</Card>
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Avg Order Value</div>
					<div class="text-2xl font-bold text-gray-900">
						{formatCurrency(totalRevenue / (totalOrders || 1))}
					</div>
				</Card>
			</div>

			<!-- Employee Performance Table -->
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Order</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each performance as emp (emp.employeeId)}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
											<span class="text-sm font-medium text-indigo-600">
												{emp.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
											</span>
										</div>
										<span class="text-sm font-medium text-gray-900">{emp.name}</span>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {getRoleColor(emp.role)}">
										{getRoleLabel(emp.role)}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{emp.orderCount}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{formatCurrency(emp.totalRevenue)}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(emp.averageOrderValue)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
