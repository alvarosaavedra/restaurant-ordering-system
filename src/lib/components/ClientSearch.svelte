<script lang="ts">
	interface ClientResult {
		id: string;
		name: string;
		phone: string;
		address: string | null;
	}

	interface Props {
		customerName: string;
		onSelect: (client: ClientResult) => void;
		onClear: () => void;
		onUpdate: (name: string) => void;
		placeholder?: string;
		'aria-label'?: string;
	}

	let { customerName, onSelect, onClear, onUpdate, placeholder = 'Search clients by name...', 'aria-label': ariaLabel = 'Search existing clients' }: Props = $props();

	let searchQuery = $state(customerName);
	let results = $state<ClientResult[]>([]);
	let loading = $state(false);
	let selectedIndex = $state(-1);
	let showDropdown = $state(false);
	let inputRef: HTMLInputElement;

	$effect(() => {
		if (searchQuery !== customerName) {
			searchQuery = customerName;
		}
	});

	// Debounced search
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function performSearch(query: string) {
		if (!query || query.length < 2) {
			results = [];
			showDropdown = false;
			return;
		}

		loading = true;
		showDropdown = true;
		selectedIndex = -1;

		(async () => {
			try {
				const response = await fetch(`/api/clients/search?q=${encodeURIComponent(query)}`);
				if (!response.ok) {
					results = [];
					return;
				}
				results = await response.json();
			} catch (error) {
				console.error('Error searching clients:', error);
				results = [];
			} finally {
				loading = false;
			}
		})();
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		onUpdate(searchQuery);

		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// Set new timeout for debounced search
		searchTimeout = setTimeout(() => {
			performSearch(searchQuery);
		}, 300);
	}

	function selectClient(client: ClientResult) {
		onSelect(client);
		searchQuery = client.name;
		onUpdate(client.name);
		showDropdown = false;
		selectedIndex = -1;
	}

	function clearSelection() {
		onClear();
		searchQuery = '';
		onUpdate('');
		results = [];
		showDropdown = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showDropdown || results.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault();
			selectClient(results[selectedIndex]);
		} else if (event.key === 'Escape') {
			showDropdown = false;
			selectedIndex = -1;
		} else if (event.key === 'Tab') {
			showDropdown = false;
		}
	}

	function handleFocus() {
		if (results.length > 0) {
			showDropdown = true;
		}
	}

	function handleBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}
</script>

<div class="relative">
	<div class="relative">
		<input
			bind:this={inputRef}
			type="text"
			value={searchQuery}
			oninput={handleInput}
			onfocus={handleFocus}
			onblur={handleBlur}
			onkeydown={handleKeydown}
			placeholder={placeholder}
			aria-label={ariaLabel}
			class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors pr-10"
			autocomplete="off"
		/>
		{#if searchQuery}
			<button
				type="button"
				onclick={clearSelection}
				aria-label="Clear search"
				class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
		{#if loading}
			<div class="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
				<svg class="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
				</svg>
			</div>
		{/if}
	</div>

		{#if showDropdown && results.length > 0}
		<ul
			role="listbox"
			aria-label="Search results"
			class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
		>
			{#each results as client, index (client.id)}
				<li
					role="option"
					class={`px-4 py-3 cursor-pointer hover:bg-primary-50 transition-colors ${
						index === selectedIndex ? 'bg-primary-100' : ''
					}`}
					onclick={() => selectClient(client)}
					onmouseenter={() => selectedIndex = index}
					onkeydown={(e) => { if (e.key === 'Enter') selectClient(client); }}
					aria-selected={index === selectedIndex}
					tabindex="0"
				>
					<div class="font-semibold text-gray-900">{client.name}</div>
					{#if client.phone}
						<div class="text-sm text-gray-500">{client.phone}</div>
					{/if}
					{#if client.address}
						<div class="text-xs text-gray-400 mt-0.5 truncate">{client.address}</div>
					{/if}
				</li>
			{/each}
		</ul>
		{:else if showDropdown && searchQuery.length >= 2 && !loading && results.length === 0}
		<div
			role="status"
			class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500"
		>
			<svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<p class="text-sm">No clients found matching "{searchQuery}"</p>
		</div>
		{/if}
</div>
