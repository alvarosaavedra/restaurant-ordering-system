<script lang="ts">
	import { goto } from '$app/navigation';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';

	interface DateRange {
		range: 'today' | 'week' | 'month' | 'custom';
		startDate: string;
		endDate: string;
	}

	let dateRange = $state<DateRange>({
		range: 'today',
		startDate: new Date().toISOString().split('T')[0],
		endDate: new Date().toISOString().split('T')[0]
	});

	function handleDateRangeChange(range: DateRange) {
		dateRange = range;
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

		<div class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
			<div class="bg-gray-50 p-4 rounded-full mb-4">
				<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
			</div>
			<p class="text-gray-500 text-lg font-medium">Report coming soon</p>
			<p class="text-gray-400 text-sm mt-2">Top selling items and category analysis will be available here</p>
		</div>
	</div>
</div>
