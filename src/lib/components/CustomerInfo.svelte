<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ClientSearch from '$lib/components/ClientSearch.svelte';
	import type { CreateOrderForm } from '$lib/types/orders';

	interface ClientResult {
		id: string;
		name: string;
		phone: string;
		address: string | null;
	}

	interface Props {
		customerName: string;
		customerPhone: string;
		deliveryDateTime: string;
		address: string;
		comment: string;
		onUpdate: (data: Partial<CreateOrderForm>) => void;
		showErrors?: boolean;
	}

	let { customerName, customerPhone, deliveryDateTime, address, comment, onUpdate, showErrors = false }: Props = $props();

	const nameError = $derived.by(() => {
		if (showErrors && !customerName.trim()) {
			return 'Customer name is required';
		}
		return null;
	});

	const phoneError = $derived.by(() => {
		if (customerPhone && customerPhone.trim() && !/^\+?[\d\s\-()]+$/.test(customerPhone)) {
			return 'Please enter a valid phone number';
		}
		return null;
	});

	const deliveryDateTimeError = $derived.by(() => {
		if (showErrors && !deliveryDateTime.trim()) {
			return 'Delivery date/time is required';
		}
		if (deliveryDateTime.trim()) {
			const parsedDate = new Date(deliveryDateTime);
			if (isNaN(parsedDate.getTime())) {
				return 'Invalid date/time format';
			}
			if (parsedDate < new Date()) {
				return 'Delivery time must be in the future';
			}
		}
		return null;
	});

	function handlePhoneChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onUpdate({ customerPhone: target.value });
	}

	function handleDeliveryDateTimeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onUpdate({ deliveryDateTime: target.value });
	}

	function handleAddressChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		onUpdate({ address: target.value });
	}

	function handleCommentChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		onUpdate({ comment: target.value });
	}

	function selectClient(client: ClientResult) {
		onUpdate({
			customerName: client.name,
			customerPhone: client.phone,
			address: client.address || ''
		});
	}

	function handleClearName() {
		onUpdate({ customerName: '' });
	}
</script>

<Card>
	<div class="p-6">
		<div class="flex items-center gap-3 mb-6">
			<div class="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
				<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			</div>
			<h2 class="text-lg font-bold text-gray-900">Customer Information</h2>
		</div>
		
		<div class="space-y-4">
			<div>
				<label for="customerName" class="block text-sm font-semibold text-gray-700 mb-2">
					Customer Name <span class="text-xs font-normal text-gray-500">(or search existing clients)</span>
				</label>
				<ClientSearch
					customerName={customerName}
					onSelect={selectClient}
					onClear={handleClearName}
					onUpdate={(name) => onUpdate({ customerName: name })}
					placeholder="Search clients by name..."
					aria-label="Customer name or search existing clients"
				/>
				{#if nameError}
					<p class="mt-1 text-sm text-red-600" role="alert">{nameError}</p>
				{/if}
			</div>

			<div>
				<label for="customerPhone" class="block text-sm font-semibold text-gray-700 mb-2">
					Phone Number
				</label>
				<Input
					id="customerPhone"
					name="customerPhone"
					type="text"
					placeholder="Enter phone number (optional)"
					value={customerPhone}
					oninput={(e) => handlePhoneChange(e)}
					class="w-full"
					error={phoneError || undefined}
				/>
			</div>

			<div>
				<label for="deliveryDateTime" class="block text-sm font-semibold text-gray-700 mb-2">
					Delivery Date/Time <span class="text-red-500">*</span>
				</label>
				<input
					id="deliveryDateTime"
					name="deliveryDateTime"
					type="datetime-local"
					required
					value={deliveryDateTime}
					oninput={(e) => handleDeliveryDateTimeChange(e)}
					class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
					class:error={deliveryDateTimeError ? 'border-red-500 ring-1 ring-red-500' : ''}
				/>
				{#if deliveryDateTimeError}
					<p class="mt-1 text-sm text-red-600" role="alert">{deliveryDateTimeError}</p>
				{/if}
			</div>

			<div>
				<label for="address" class="block text-sm font-semibold text-gray-700 mb-2">
					Delivery Address (Optional)
				</label>
				<textarea
					id="address"
					name="address"
					placeholder="Enter delivery address (optional)"
					value={address}
					oninput={(e) => handleAddressChange(e)}
					rows="3"
					class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
				></textarea>
			</div>

			<div>
				<label for="comment" class="block text-sm font-semibold text-gray-700 mb-2">
					Special Instructions (Optional)
				</label>
				<textarea
					id="comment"
					name="comment"
					placeholder="Any special requests or instructions (optional)"
					value={comment}
					oninput={(e) => handleCommentChange(e)}
					rows="3"
					class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
				></textarea>
			</div>
		</div>
	</div>
</Card>