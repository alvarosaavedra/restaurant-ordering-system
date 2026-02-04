<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { formatCurrency } from '$lib/utils/formatting';
	import type { SalesReportItem, SalesSummary } from '$lib/server/reports/sales-reports';

	interface DateRange {
		range: 'today' | 'week' | 'month' | 'custom';
		startDate: string;
		endDate: string;
	}

	let { data } = $props<{
		data: {
			summary: SalesSummary;
			report: SalesReportItem[];
			startDate: string;
			endDate: string;
		};
	}>();

	let summary = $derived(data.summary);
	let report = $derived(data.report);

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
		// Update URL with new date range
		const url = new URL($page.url);
		url.searchParams.set('startDate', range.startDate);
		url.searchParams.set('endDate', range.endDate);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url.toString(), { keepFocus: true });
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6">
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<button
			onclick={() => goto('/admin/reports')}
			class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Back to Reports
		</button>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
		<div class="flex items-center gap-3 mb-6">
			<div class="bg-green-50 p-3 rounded-lg">
				<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Sales & Revenue Report</h1>
		</div>

		<div class="max-w-2xl mb-8">
			<DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
		</div>

		{#if summary.totalOrders === 0}
			<div class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
				<div class="bg-gray-50 p-4 rounded-full mb-4">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
					</svg>
				</div>
				<p class="text-gray-500 text-lg font-medium">No data for selected date range</p>
				<p class="text-gray-400 text-sm mt-2">Try selecting a different date range</p>
			</div>
		{:else}
			<!-- Summary Cards -->
			<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Total Revenue</div>
					<div class="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</div>
				</Card>
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Net Revenue</div>
					<div class="text-2xl font-bold text-green-600">{formatCurrency(summary.netRevenue)}</div>
				</Card>
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Total Discounts</div>
					<div class="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDiscounts)}</div>
				</Card>
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Total Orders</div>
					<div class="text-2xl font-bold text-gray-900">{summary.totalOrders.toLocaleString()}</div>
				</Card>
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Average Order Value</div>
					<div class="text-2xl font-bold text-gray-900">{formatCurrency(summary.avgOrderValue)}</div>
				</Card>
				<Card variant="elevated" class="p-4">
					<div class="text-sm text-gray-600 mb-1">Items Sold</div>
					<div class="text-2xl font-bold text-gray-900">{summary.totalItemsSold.toLocaleString()}</div>
				</Card>
			</div>

			<!-- Data Table -->
			{#if report.length > 1}
				<div class="overflow-x-auto">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h2>
					<table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discounts</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Revenue</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Order</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each report as item (item.date)}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(item.grossRevenue)}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">{formatCurrency(item.totalDiscounts)}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{formatCurrency(item.netRevenue)}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{item.orderCount}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(item.avgOrderValue)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/if}
	</div>
</div>
