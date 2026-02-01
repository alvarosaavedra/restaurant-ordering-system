<script lang="ts">
	interface DateRange {
		range: 'today' | 'week' | 'month' | 'custom';
		startDate: string;
		endDate: string;
	}

	interface Props {
		value?: DateRange;
		onChange: (range: DateRange) => void;
	}

	let { value, onChange }: Props = $props();

	// Initialize with default or provided value
	// Note: These only capture initial values, which is intentional behavior
	// svelte-ignore state_referenced_locally
	let selectedRange = $state(value?.range ?? 'today');
	// svelte-ignore state_referenced_locally
	let customStartDate = $state(value?.startDate ?? formatDate(new Date()));
	// svelte-ignore state_referenced_locally
	let customEndDate = $state(value?.endDate ?? formatDate(new Date()));

	const presets = [
		{ value: 'today', label: 'Today' },
		{ value: 'week', label: 'This Week' },
		{ value: 'month', label: 'This Month' },
		{ value: 'custom', label: 'Custom Range' }
	];

	function formatDate(date: Date): string {
		return date.toISOString().split('T')[0];
	}

	function getStartOfWeek(date: Date): Date {
		const d = new Date(date); // eslint-disable-line svelte/prefer-svelte-reactivity
		const day = d.getDay();
		const diff = d.getDate() - day;
		return new Date(d.setDate(diff));
	}

	function getEndOfWeek(date: Date): Date {
		const d = new Date(date); // eslint-disable-line svelte/prefer-svelte-reactivity
		const day = d.getDay();
		const diff = d.getDate() + (6 - day);
		return new Date(d.setDate(diff));
	}

	function getStartOfMonth(date: Date): Date {
		return new Date(date.getFullYear(), date.getMonth(), 1);
	}

	function getEndOfMonth(date: Date): Date {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0);
	}

	function calculateDateRange(range: string): { startDate: string; endDate: string } {
		const today = new Date();
		
		switch (range) {
			case 'today':
				return {
					startDate: formatDate(today),
					endDate: formatDate(today)
				};
			case 'week':
				return {
					startDate: formatDate(getStartOfWeek(today)),
					endDate: formatDate(getEndOfWeek(today))
				};
			case 'month':
				return {
					startDate: formatDate(getStartOfMonth(today)),
					endDate: formatDate(getEndOfMonth(today))
				};
			case 'custom':
				return {
					startDate: customStartDate,
					endDate: customEndDate
				};
			default:
				return {
					startDate: formatDate(today),
					endDate: formatDate(today)
				};
		}
	}

	function handlePresetChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedRange = target.value as DateRange['range'];
		
		const { startDate, endDate } = calculateDateRange(selectedRange);
		
		if (selectedRange === 'custom') {
			customStartDate = startDate;
			customEndDate = endDate;
		}
		
		onChange({
			range: selectedRange,
			startDate,
			endDate
		});
	}

	function handleCustomStartChange(event: Event) {
		const target = event.target as HTMLInputElement;
		customStartDate = target.value;
		
		// Ensure end date is not before start date
		if (customEndDate < customStartDate) {
			customEndDate = customStartDate;
		}
		
		// Limit to 365 days
		const start = new Date(customStartDate);
		const maxEnd = new Date(start); // eslint-disable-line svelte/prefer-svelte-reactivity
		maxEnd.setDate(maxEnd.getDate() + 365);
		const maxEndStr = formatDate(maxEnd);
		
		if (customEndDate > maxEndStr) {
			customEndDate = maxEndStr;
		}
		
		onChange({
			range: 'custom',
			startDate: customStartDate,
			endDate: customEndDate
		});
	}

	function handleCustomEndChange(event: Event) {
		const target = event.target as HTMLInputElement;
		let newEndDate = target.value;
		
		// Ensure end date is not before start date
		if (newEndDate < customStartDate) {
			newEndDate = customStartDate;
		}
		
		// Limit to 365 days from start
		const start = new Date(customStartDate);
		const maxEnd = new Date(start); // eslint-disable-line svelte/prefer-svelte-reactivity
		maxEnd.setDate(maxEnd.getDate() + 365);
		const maxEndStr = formatDate(maxEnd);
		
		if (newEndDate > maxEndStr) {
			newEndDate = maxEndStr;
		}
		
		customEndDate = newEndDate;
		
		onChange({
			range: 'custom',
			startDate: customStartDate,
			endDate: customEndDate
		});
	}

	function formatDisplayDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	let displayRange = $derived.by(() => {
		const { startDate, endDate } = calculateDateRange(selectedRange);
		
		if (startDate === endDate) {
			return formatDisplayDate(startDate);
		}
		
		const start = new Date(startDate);
		const end = new Date(endDate);
		
		// If same month and year, only show date range
		if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
			const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			const endFormatted = end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' });
			return `${startFormatted} - ${endFormatted}`;
		}
		
		// Different months
		return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
	});

	let showCustomInputs = $derived(selectedRange === 'custom');
</script>

<div class="space-y-4">
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
		<div class="flex-1 w-full sm:w-auto">
			<label for="date-range-select" class="block text-sm font-medium text-gray-700 mb-1">
				Time Period
			</label>
			<select
				id="date-range-select"
				aria-label="Time Period"
				value={selectedRange}
				onchange={handlePresetChange}
				class="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
			>
				{#each presets as preset (preset.value)}
					<option value={preset.value}>{preset.label}</option>
				{/each}
			</select>
		</div>
		
		<div class="flex-1 w-full sm:w-auto">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="block text-sm font-medium text-gray-700 mb-1">
				Selected Range
			</label>
			<div 
				data-testid="date-range-display"
				class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium"
			>
				{displayRange}
			</div>
		</div>
	</div>

	{#if showCustomInputs}
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1">
				<label for="custom-start-date" class="block text-sm font-medium text-gray-700 mb-1">
					Start Date
				</label>
				<input
					type="date"
					id="custom-start-date"
					aria-label="Start Date"
					value={customStartDate}
					oninput={handleCustomStartChange}
					class="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
				/>
			</div>
			
			<div class="flex-1">
				<label for="custom-end-date" class="block text-sm font-medium text-gray-700 mb-1">
					End Date
				</label>
				<input
					type="date"
					id="custom-end-date"
					aria-label="End Date"
					value={customEndDate}
					oninput={handleCustomEndChange}
					class="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
				/>
			</div>
		</div>
	{/if}
</div>
