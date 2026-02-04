<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { formatCurrency } from '$lib/utils/formatting';
	import type { TopSellingItem, CategoryPerformance } from '$lib/server/reports/menu-reports';

	interface DateRange {
		range: 'today' | 'week' | 'month' | 'custom';
		startDate: string;
		endDate: string;
	}

	let { data } = $props<{
		data: {
			topItems: TopSellingItem[];
			categoryStats: CategoryPerformance[];
			startDate: string;
			endDate: string;
		};
	}>();

	let topItems = $derived(data.topItems);
	let categoryStats = $derived(data.categoryStats);

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
			<div class="bg-orange-50 p-3 rounded-lg">
				<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Menu Performance Report</h1>
		</div>

		<div class="max-w-2xl mb-8">
			<DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
		</div>

		{#if topItems.length === 0}
			<div class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
				<div class="bg-gray-50 p-4 rounded-full mb-4">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
				</div>
				<p class="text-gray-500 text-lg font-medium">No menu data for selected date range</p>
				<p class="text-gray-400 text-sm mt-2">Try selecting a different date range</p>
			</div>
		{:else}
			<!-- Top Selling Items -->
			<div class="mb-8">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h2>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each topItems as item, index (item.menuItemId)}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-medium mr-3">
												{index + 1}
											</span>
											<span class="text-sm font-medium text-gray-900">{item.name}</span>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.categoryName}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{item.quantity}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{formatCurrency(item.revenue)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Category Performance -->
			{#if categoryStats.length > 0}
				<div class="mb-8">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Category Performance</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each categoryStats as category (category.categoryId)}
							<Card variant="elevated" class="p-4">
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-medium text-gray-900">{category.categoryName}</span>
									<span class="text-xs text-gray-500">{category.itemCount} items</span>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div>
										<div class="text-xs text-gray-600 mb-1">Quantity Sold</div>
										<div class="text-lg font-semibold text-gray-900">{category.quantitySold}</div>
									</div>
									<div>
										<div class="text-xs text-gray-600 mb-1">Revenue</div>
										<div class="text-lg font-semibold text-green-600">{formatCurrency(category.revenue)}</div>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
