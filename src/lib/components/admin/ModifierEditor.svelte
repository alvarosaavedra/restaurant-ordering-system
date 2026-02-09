<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';

	interface Props {
		open: boolean;
		modifier?: {
			id: string;
			name: string;
			price: number;
			isAvailable: boolean;
			displayOrder: number;
		} | null;
		onSave: (data: {
			id?: string;
			name: string;
			price: number;
			isAvailable: boolean;
			displayOrder: number;
		}) => void;
		onClose: () => void;
	}

	let { open, modifier = null, onSave, onClose }: Props = $props();

	let formData = $state({
		name: '',
		price: 0,
		isAvailable: true,
		displayOrder: 0
	});

	let isEditing = $derived(!!modifier?.id);

	function handleSubmit() {
		onSave({
			...(modifier?.id && { id: modifier.id }),
			name: formData.name,
			price: formData.price,
			isAvailable: formData.isAvailable,
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
			price: 0,
			isAvailable: true,
			displayOrder: 0
		};
	}

	$effect(() => {
		if (open) {
			if (modifier) {
				formData = {
					name: modifier.name,
					price: modifier.price,
					isAvailable: modifier.isAvailable,
					displayOrder: modifier.displayOrder
				};
			} else {
				resetForm();
			}
		}
	});
</script>

<Modal title={isEditing ? 'Edit Modifier' : 'Add Modifier'} {open} onclose={handleClose}>
	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
		<div class="space-y-4">
			<div>
				<label for="modifier-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
				<Input
					id="modifier-name"
					type="text"
					bind:value={formData.name}
					placeholder="e.g., Extra Wasabi, Extra Cheese"
					required
				/>
			</div>
			<div>
				<label for="modifier-price" class="block text-sm font-medium text-gray-700 mb-1">Price</label>
				<Input
					id="modifier-price"
					type="number"
					step="0.01"
					bind:value={() => formData.price.toString(), (v) => formData.price = parseFloat(v) || 0}
					placeholder="0.00"
					required
				/>
			</div>
			<div>
				<label for="modifier-order" class="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
				<Input
					id="modifier-order"
					type="number"
					bind:value={() => formData.displayOrder.toString(), (v) => formData.displayOrder = parseInt(v) || 0}
					placeholder="0"
				/>
				<p class="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
			</div>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="modifier-available"
					bind:checked={formData.isAvailable}
					class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
				/>
				<label for="modifier-available" class="text-sm font-medium text-gray-700">
					Available
				</label>
			</div>
			<div class="flex gap-3 pt-4">
				<Button type="button" variant="secondary" onclick={handleClose}>Cancel</Button>
				<Button type="submit">{isEditing ? 'Update' : 'Add'} Modifier</Button>
			</div>
		</div>
	</form>
</Modal>
