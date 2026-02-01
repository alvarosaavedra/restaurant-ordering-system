<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { OrderStatusCount, DailyOrderVolume, CompletionTimeMetrics } from '$lib/server/reports/order-reports';

	interface DateRange {
		range: 'today' | 'week' | 'month' | 'custom';
		startDate: string;
		endDate: string;
	}

	let { data } = $props<{
		data: {
			statusStats: OrderStatusCount[];
			dailyVolume: DailyOrderVolume[];
			completionTimes: CompletionTimeMetrics | null;
			startDate: string;
			endDate: string;
		};
	}>();

	let statusStats = $derived(data.statusStats);
	let dailyVolume = $derived(data.dailyVolume);
	let completionTimes = $derived(data.completionTimes);

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

	function getStatusColor(status: string): string {
		switch (status) {
			case 'pending': return 'text-yellow-600 bg-yellow-50';
			case 'preparing': return 'text-blue-600 bg-blue-50';
			case 'ready': return 'text-green-600 bg-green-50';
			case 'delivered': return 'text-gray-600 bg-gray-50';
			default: return 'text-gray-600 bg-gray-50';
		}
	}

	function getStatusLabel(status: string): string {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function formatMinutes(minutes: number): string {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	let totalOrders = $derived(statusStats.reduce((sum: number, s: OrderStatusCount) => sum + s.count, 0));
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
			<div class="bg-blue-50 p-3 rounded-lg">
				<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Order Statistics Report</h1>
		</div>

		<div class="max-w-2xl mb-8">
			<DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
		</div>

		{#if totalOrders === 0}
			<div class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
				<div class="bg-gray-50 p-4 rounded-full mb-4">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</div>
				<p class="text-gray-500 text-lg font-medium">No orders for selected date range</p>
				<p class="text-gray-400 text-sm mt-2">Try selecting a different date range</p>
			</div>
		{:else}
			<!-- Summary Cards -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				{#each statusStats as statusStat (statusStat.status)}
					<Card variant="elevated" class="p-4">
						<div class="flex items-center gap-2 mb-1">
							<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {getStatusColor(statusStat.status)}">
								{getStatusLabel(statusStat.status)}
							</span>
						</div>
						<div class="text-2xl font-bold text-gray-900">{statusStat.count.toLocaleString()}</div>
						<div class="text-sm text-gray-600">
							{((statusStat.count / totalOrders) * 100).toFixed(1)}% of orders
						</div>
					</Card>
				{/each}
			</div>

			{#if completionTimes}
				<div class="mb-8">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Completion Times</h2>
					<div class="grid grid-cols-3 gap-4">
						<Card variant="elevated" class="p-4">
							<div class="text-sm text-gray-600 mb-1">Average</div>
							<div class="text-2xl font-bold text-gray-900">{formatMinutes(completionTimes.averageMinutes)}</div>
						</Card>
						<Card variant="elevated" class="p-4">
							<div class="text-sm text-gray-600 mb-1">Fastest</div>
							<div class="text-2xl font-bold text-green-600">{formatMinutes(completionTimes.minMinutes)}</div>
						</Card>
						<Card variant="elevated" class="p-4">
							<div class="text-sm text-gray-600 mb-1">Slowest</div>
							<div class="text-2xl font-bold text-orange-600">{formatMinutes(completionTimes.maxMinutes)}</div>
						</Card>
					</div>
				</div>
			{/if}

			<!-- Daily Volume Table -->
			{#if dailyVolume.length > 1}
				<div class="overflow-x-auto">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Daily Order Volume</h2>
					<table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each dailyVolume as item (item.date)}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{item.count}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/if}
	</div>
</div>
