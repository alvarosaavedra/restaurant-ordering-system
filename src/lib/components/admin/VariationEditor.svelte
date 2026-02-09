<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';

	interface Props {
		open: boolean;
		variation?: {
			id: string;
			name: string;
			priceAdjustment: number;
			isDefault: boolean;
			displayOrder: number;
		} | null;
		onSave: (data: {
			id?: string;
			name: string;
			priceAdjustment: number;
			isDefault: boolean;
			displayOrder: number;
		}) => void;
		onClose: () => void;
	}

	let { open, variation = null, onSave, onClose }: Props = $props();

	let formData = $state({
		name: '',
		priceAdjustment: 0,
		isDefault: false,
		displayOrder: 0
	});

	let isEditing = $derived(!!variation?.id);

	function handleSubmit() {
		onSave({
			...(variation?.id && { id: variation.id }),
			name: formData.name,
			priceAdjustment: formData.priceAdjustment,
			isDefault: formData.isDefault,
			displayOrder: formData.displayOrder
		});
		resetForm();
	}

	function handleClose() {
		resetForm();
		onClose();
	}

	function resetForm() {
		formData = {
			name: '',
			priceAdjustment: 0,
			isDefault: false,
			displayOrder: 0
		};
	}

	$effect(() => {
		if (open) {
			if (variation) {
				formData = {
					name: variation.name,
					priceAdjustment: variation.priceAdjustment,
					isDefault: variation.isDefault,
					displayOrder: variation.displayOrder
				};
			} else {
				resetForm();
			}
		}
	});
</script>

<Modal title={isEditing ? 'Edit Variation' : 'Add Variation'} {open} onclose={handleClose}>
	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
		<div class="space-y-4">
			<div>
				<label for="variation-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
				<Input
					id="variation-name"
					type="text"
					bind:value={formData.name}
					placeholder="e.g., Chicken, Beef, Rare"
					required
				/>
			</div>
			<div>
				<label for="variation-price" class="block text-sm font-medium text-gray-700 mb-1">Price Adjustment</label>
				<Input
					id="variation-price"
					type="number"
					step="0.01"
					bind:value={() => formData.priceAdjustment.toString(), (v) => formData.priceAdjustment = parseFloat(v) || 0}
					placeholder="0.00"
				/>
				<p class="mt-1 text-xs text-gray-500">Positive for extra charge, negative for discount</p>
			</div>
			<div>
				<label for="variation-order" class="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
				<Input
					id="variation-order"
					type="number"
					bind:value={() => formData.displayOrder.toString(), (v) => formData.displayOrder = parseInt(v) || 0}
					placeholder="0"
				/>
				<p class="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
			</div>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="variation-default"
					bind:checked={formData.isDefault}
					class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
				/>
				<label for="variation-default" class="text-sm font-medium text-gray-700">
					Set as default selection
				</label>
			</div>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={handleClose}>Cancel</Button>
				<Button type="submit">{isEditing ? 'Update' : 'Add'} Variation</Button>
			</div>
		</div>
	</form>
</Modal>
