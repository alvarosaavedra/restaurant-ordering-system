<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { CreateOrderForm } from '$lib/types/orders';

	interface Props {
		customerName: string;
		customerPhone: string;
		onUpdate: (data: Partial<CreateOrderForm>) => void;
	}

	let { customerName, customerPhone, onUpdate }: Props = $props();

	function handleNameChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onUpdate({ customerName: target.value });
	}

	function handlePhoneChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onUpdate({ customerPhone: target.value });
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
					Customer Name
				</label>
				<Input
					id="customerName"
					name="customerName"
					type="text"
					required
					placeholder="Enter customer name"
					value={customerName}
					oninput={(e) => handleNameChange(e)}
					class="w-full"
				/>
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
				/>
			</div>
		</div>
	</div>
</Card>