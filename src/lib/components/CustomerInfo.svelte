<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
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

<Card class="max-w-md">
	<div class="p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
		
		<div class="space-y-4">
			<div>
				<label for="customerName" class="block text-sm font-medium text-gray-700 mb-1">
					Customer Name *
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
				<label for="customerPhone" class="block text-sm font-medium text-gray-700 mb-1">
					Phone Number
				</label>
				<Input
					id="customerPhone"
					name="customerPhone"
					type="text"
					placeholder="Enter phone number"
					value={customerPhone}
					oninput={(e) => handlePhoneChange(e)}
					class="w-full"
				/>
			</div>

			<div>
				<label for="customerPhone" class="block text-sm font-medium text-gray-700 mb-1">
					Phone Number
				</label>
				<Input
					id="customerPhone"
					name="customerPhone"
					type="text"
					placeholder="Enter phone number"
					value={customerPhone}
					oninput={handlePhoneChange}
					class="w-full"
				/>
			</div>
		</div>
	</div>
</Card>