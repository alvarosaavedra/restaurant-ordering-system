<script lang="ts">
	import type { CartItem, ItemDiscount, OrderDiscount } from '$lib/stores/cart';
	import { validateDiscount } from '$lib/utils/discounts';

	interface Props {
		isOpen: boolean;
		mode: 'item' | 'total';
		cartItems: CartItem[];
		selectedItemId: string | null;
		initialDiscount: ItemDiscount | OrderDiscount | null;
		onSave: (discount: { type: 'fixed' | 'percentage'; value: number; reason?: string; itemId?: string }) => void;
		onClose: () => void;
	}

	let { isOpen, mode, cartItems, selectedItemId, initialDiscount, onSave, onClose }: Props = $props();

	// Form state
	let discountType: 'fixed' | 'percentage' = $state(initialDiscount?.type ?? 'fixed');
	let amount = $state(initialDiscount?.value ?? '');
	let reason = $state(initialDiscount?.reason ?? '');
	let selectedItem = $state(selectedItemId ?? (cartItems[0]?.item.id || null));
	let error = $state<string | null>(null);

	// Calculate base price for validation
	let basePrice = $derived(() => {
		if (mode === 'total') {
			return cartItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
		} else {
			const item = cartItems.find(i => i.item.id === selectedItem);
			return item ? item.item.price * item.quantity : 0;
		}
	});

	// Preview calculation
	let preview = $derived(() => {
		const numAmount = parseFloat(amount as string) || 0;
		if (numAmount <= 0) return null;

		const base = basePrice();
		if (discountType === 'fixed') {
			const final = Math.max(0, base - numAmount);
			return { original: base, discount: numAmount, final };
		} else {
			const discountAmount = (base * numAmount) / 100;
			const final = Math.max(0, base - discountAmount);
			return { original: base, discount: discountAmount, final };
		}
	});

	function handleSave() {
		error = null;
		
		const numAmount = parseFloat(amount as string);
		if (isNaN(numAmount) || numAmount <= 0) {
			error = 'Please enter a valid amount';
			return;
		}

		const base = basePrice();
		const validation = validateDiscount(base, discountType, numAmount, 50);
		
		if (!validation.valid) {
			error = validation.error || 'Invalid discount';
			return;
		}

		onSave({
			type: discountType,
			value: numAmount,
			reason: reason.trim() || undefined,
			itemId: mode === 'item' ? (selectedItem ?? undefined) : undefined
		});
	}

	function handleClose() {
		error = null;
		amount = '';
		reason = '';
		onClose();
	}

	function setType(type: 'fixed' | 'percentage') {
		discountType = type;
		error = null;
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black/50 z-50" onclick={handleClose} role="presentation">
		<div
			data-testid="mobile-discount-sheet"
			class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto"
			onclick={(e: MouseEvent) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-label="Add discount"
		>
			<!-- Drag handle -->
			<div class="flex justify-center pt-3 pb-2">
				<div class="w-10 h-1 bg-neutral-300 rounded-full"></div>
			</div>

			<div class="px-4 pb-6">
				<h2 class="text-lg font-bold text-neutral-900 mb-4">
					{initialDiscount ? 'Edit' : 'Add'} {mode === 'item' ? 'Item' : 'Order'} Discount
				</h2>

				<!-- Item Selector (only in item mode) -->
				{#if mode === 'item'}
					<div data-testid="item-selector" class="mb-4">
						<label class="block text-sm font-medium text-neutral-700 mb-1.5">
							Apply to
						</label>
						<div class="space-y-2 max-h-40 overflow-y-auto border border-neutral-200 rounded-lg p-2">
			{#each cartItems as cartItem (cartItem.item.id)}
				<label class="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-neutral-50 {selectedItem === cartItem.item.id ? 'bg-bakery-50 border border-bakery-200' : ''}">
									<input
										type="radio"
										name="item"
										value={cartItem.item.id}
										checked={selectedItem === cartItem.item.id}
										onchange={() => selectedItem = cartItem.item.id}
										class="w-4 h-4 text-bakery-600 focus:ring-bakery-500"
									/>
									<div class="flex-1">
										<span class="text-sm font-medium text-neutral-900">{cartItem.item.name}</span>
										<span class="text-xs text-neutral-500 ml-2">x{cartItem.quantity}</span>
									</div>
									<span class="text-sm font-medium text-neutral-700">
										${(cartItem.item.price * cartItem.quantity).toFixed(2)}
									</span>
								</label>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Discount Type -->
				<div class="mb-4">
					<label class="block text-sm font-medium text-neutral-700 mb-1.5">
						Discount Type
					</label>
					<div class="flex gap-2">
						<button
							type="button"
							data-testid="type-fixed"
							class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border-2 transition-all {discountType === 'fixed' ? 'border-bakery-500 bg-bakery-50 text-bakery-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}"
							onclick={() => setType('fixed')}
						>
							Fixed Amount
						</button>
						<button
							type="button"
							data-testid="type-percentage"
							class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border-2 transition-all {discountType === 'percentage' ? 'border-bakery-500 bg-bakery-50 text-bakery-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}"
							onclick={() => setType('percentage')}
						>
							Percentage
						</button>
					</div>
				</div>

				<!-- Amount Input -->
				<div class="mb-4">
					<label class="block text-sm font-medium text-neutral-700 mb-1.5">
						Amount {discountType === 'fixed' ? '($)' : '(%)'}
					</label>
					<div class="relative">
						{#if discountType === 'fixed'}
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
						{/if}
					<input
						type="number"
						name="amount"
						value={amount}
						oninput={(e: Event & { currentTarget: HTMLInputElement }) => amount = e.currentTarget.value}
						placeholder={discountType === 'fixed' ? '0.00' : '0'}
						step="0.01"
						min="0"
						class="w-full py-3 {discountType === 'fixed' ? 'pl-8' : 'pl-3'} pr-3 text-base border border-neutral-300 rounded-lg focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500"
					/>
						{#if discountType === 'percentage'}
							<span class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">%</span>
						{/if}
					</div>
					<p class="text-xs text-neutral-500 mt-1">
						Max {discountType === 'fixed' ? `$${basePrice().toFixed(2)}` : '50%'}
					</p>
				</div>

				<!-- Reason Input -->
				<div class="mb-4">
					<label class="block text-sm font-medium text-neutral-700 mb-1.5">
						Reason (optional)
					</label>
				<input
					type="text"
					value={reason}
					oninput={(e: Event & { currentTarget: HTMLInputElement }) => reason = e.currentTarget.value}
					placeholder="e.g., Loyalty discount"
					class="w-full py-3 px-3 text-base border border-neutral-300 rounded-lg focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500"
				/>
				</div>

				<!-- Error Message -->
				{#if error}
					<div data-testid="error-message" class="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
						<p class="text-sm text-error-700">{error}</p>
					</div>
				{/if}

			<!-- Preview -->
			{#if preview()}
				{@const p = preview()}
				{#if p}
					<div class="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
						<p class="text-sm text-neutral-600 mb-1">Preview:</p>
						<div class="flex items-center justify-between">
							<span class="text-sm text-neutral-500 line-through">${p.original.toFixed(2)}</span>
							<span class="text-sm font-medium text-success-600">-${p.discount.toFixed(2)}</span>
							<span class="text-base font-bold text-neutral-900">${p.final.toFixed(2)}</span>
						</div>
					</div>
				{/if}
			{/if}

				<!-- Actions -->
				<div class="flex gap-3 pt-2">
					<button
						type="button"
						data-testid="cancel-btn"
						class="flex-1 py-3.5 px-4 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
						onclick={handleClose}
					>
						Cancel
					</button>
					<button
						type="button"
						data-testid="save-btn"
						class="flex-1 py-3.5 px-4 text-sm font-medium text-white bg-bakery-600 hover:bg-bakery-700 rounded-lg transition-colors"
						onclick={handleSave}
					>
						Save Discount
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
