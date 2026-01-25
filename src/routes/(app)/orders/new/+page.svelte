<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import MenuItem from '$lib/components/MenuItem.svelte';
	import CustomerInfo from '$lib/components/CustomerInfo.svelte';
	import { toast } from '$lib/utils/toast';
	import type { MenuItemWithCategory } from '$lib/types/orders';

	interface CartItem {
		item: MenuItemWithCategory;
		quantity: number;
	}

	interface CategoryWithItems {
		id: string;
		name: string;
		displayOrder: number;
		createdAt: Date;
		items: MenuItemWithCategory[];
	}

	let { data }: { data: { categories: CategoryWithItems[] } } = $props();

	let cart: CartItem[] = $state([]);
	let customerName: string = $state('');
	let customerPhone: string = $state('');
	let deliveryDateTime: string = $state('');
	let address: string = $state('');
	let comment: string = $state('');
	let categories = $derived(data.categories || []);
	let totalAmount: number = $derived(
		cart.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0)
	);
	let isSubmitting: boolean = $state(false);
	let showValidationErrors: boolean = $state(false);

	function addToOrder(item: MenuItemWithCategory, quantity: number) {
		const existingItem = cart.find(cartItem => cartItem.item.id === item.id);

		if (existingItem) {
			cart = cart.map(cartItem =>
				cartItem.item.id === item.id
					? { ...cartItem, quantity: cartItem.quantity + quantity }
					: cartItem
			);
		} else {
			cart = [...cart, { item, quantity }];
		}
	}

	function getTotalItems(): number {
		return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
	}

	function removeFromCart(itemId: string) {
		cart = cart.filter(cartItem => cartItem.item.id !== itemId);
	}

	function updateCartQuantity(itemId: string, newQuantity: number) {
		if (newQuantity <= 0) {
			cart = cart.filter(cartItem => cartItem.item.id !== itemId);
		} else {
			cart = cart.map(cartItem =>
				cartItem.item.id === itemId
					? { ...cartItem, quantity: newQuantity }
					: cartItem
			);
		}
	}

	async function createOrder() {
		if (cart.length === 0) {
			toast.warning('Please add items to order');
			return;
		}

		showValidationErrors = true;

		if (!customerName.trim()) {
			toast.warning('Please enter customer name');
			return;
		}

		if (!deliveryDateTime.trim()) {
			toast.warning('Please enter delivery date/time');
			return;
		}

		isSubmitting = true;
		try {
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					customerName,
					customerPhone,
					deliveryDateTime,
					address,
					comment,
					items: cart.map(cartItem => ({
						menuItemId: cartItem.item.id,
						quantity: cartItem.quantity
					}))
				})
			});

			if (response.ok) {
				toast.success('Order created successfully!');
				cart = [];
				customerName = '';
				customerPhone = '';
				deliveryDateTime = '';
				address = '';
				comment = '';
				await goto('/orders');
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || 'Failed to create order. Please try again.');
			}
		} catch (error) {
			console.error('Error creating order:', error);
			toast.error('Failed to create order. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="px-4 py-6 max-w-7xl mx-auto">
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
		<!-- Customer Information Form -->
		<div class="lg:col-span-1">
			<CustomerInfo
				customerName={customerName}
				customerPhone={customerPhone}
				deliveryDateTime={deliveryDateTime}
				address={address}
				comment={comment}
				onUpdate={(data) => {
					if (data.customerName !== undefined) customerName = data.customerName;
					if (data.customerPhone !== undefined) customerPhone = data.customerPhone;
					if (data.deliveryDateTime !== undefined) deliveryDateTime = data.deliveryDateTime;
					if (data.address !== undefined) address = data.address;
					if (data.comment !== undefined) comment = data.comment;
				}}
				showErrors={showValidationErrors}
			/>
		</div>

		<!-- Menu Items -->
		<div class="lg:col-span-2">
			<Card variant="elevated" class="p-6 shadow-warm-glow-sm">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-10 h-10 bg-bakery-100 rounded-lg flex items-center justify-center" aria-hidden="true">
						<svg class="w-5 h-5 text-bakery-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
					</div>
					<h2 class="text-xl font-bold text-neutral-900 font-display">Menu</h2>
				</div>

				{#if categories.length === 0}
					<div class="text-center py-12">
						<div class="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-2xl flex items-center justify-center">
							<svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-neutral-900 mb-2">Loading menu...</h3>
						<p class="text-neutral-500 font-medium">Please wait while we load the menu items</p>
					</div>
				{:else}
					<div class="space-y-6">
						{#each categories as category (category.id)}
							<div class="animate-slide-up">
								<div class="flex items-center gap-3 mb-3 pb-3 border-b border-neutral-200">
									<h3 class="text-base font-bold text-neutral-900 font-display">{category.name}</h3>
									<span class="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{category.items?.length || 0}</span>
								</div>
 
								<div class="space-y-3">
									{#each category.items as item (item.id)}
 										<MenuItem
 											item={item}
 												onAdd={(item, quantity) => addToOrder(item, quantity)}
 										/>
 									{/each}
 								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card>
		</div>
	</div>

	<!-- Order Summary & Submit -->
	{#if cart.length > 0}
		<div class="mt-6">
			<Card variant="elevated" class="max-w-md mx-auto lg:mx-0 shadow-warm-glow">
				<div class="p-6">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-10 h-10 bg-bakery-100 rounded-lg flex items-center justify-center" aria-hidden="true">
							<svg class="w-5 h-5 text-bakery-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l2.293 2.293c-.63.63-.184 1.707.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<h2 class="text-xl font-bold text-neutral-900 font-display">Order Summary</h2>
					</div>

					<!-- Cart Items List -->
					<div class="mb-6 space-y-3 max-h-64 overflow-y-auto pr-2">
						{#each cart as cartItem (cartItem.item.id)}
							<Card variant="subtle" class="p-3">
								<div class="flex items-center justify-between">
									<div class="flex-1 min-w-0">
										<h4 class="font-semibold text-neutral-900 text-sm truncate">{cartItem.item.name}</h4>
										{#if cartItem.item.category}
											<p class="text-xs text-neutral-500 mt-0.5">{cartItem.item.category.name}</p>
										{/if}
									</div>
									<div class="flex items-center gap-3 ml-3">
										<div class="flex items-center border border-neutral-200 rounded-lg" role="group" aria-label="Quantity selector">
											<Button variant="ghost" size="sm" onclick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)} disabled={cartItem.quantity <= 1} aria-label={`Decrease ${cartItem.item.name} quantity`}>
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
												</svg>
											</Button>
 
											<span class="px-2 text-sm font-medium text-neutral-700 min-w-[30px] text-center" aria-live="polite" aria-atomic="true">
												{cartItem.quantity}
											</span>
 
											<Button variant="ghost" size="sm" onclick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity + 1)} aria-label={`Increase ${cartItem.item.name} quantity`}>
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16m-8-8v8m0 0l8 8m8-8v8" />
												</svg>
											</Button>
										</div>
										<span class="font-bold text-neutral-900 text-sm w-16 text-right">${(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
										<button
											type="button"
											class="p-1.5 text-error-500 hover:text-error-700 hover:bg-error-50 rounded-lg transition-colors ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
											onclick={() => removeFromCart(cartItem.item.id)}
											aria-label={`Remove ${cartItem.item.name} from order`}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								</div>
							</Card>
						{/each}
					</div>

					<!-- Totals -->
					<div class="space-y-3 mb-6 border-t border-neutral-200 pt-4">
						<div class="flex justify-between items-center py-2 px-4 bg-neutral-50 rounded-lg">
							<span class="text-neutral-600 font-medium">Total Items:</span>
							<span class="font-bold text-neutral-900 text-lg">{getTotalItems()}</span>
						</div>
						<div class="flex justify-between items-center py-2 px-4 bg-bakery-50 rounded-lg">
							<span class="text-neutral-600 font-medium">Total Amount:</span>
							<span class="font-black text-xl text-bakery-700">${totalAmount.toFixed(2)}</span>
						</div>
					</div>

					<div class="flex flex-col sm:flex-row gap-3">
						<Button
							variant="secondary"
							class="flex-1"
							onclick={() => cart = []}
							aria-label="Clear all items from order"
						>
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1h4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Clear
						</Button>

						<Button
							variant="primary"
							size="sm"
							class="flex-1"
							onclick={() => createOrder()}
							disabled={cart.length === 0 || isSubmitting}
							aria-label="Create order with {getTotalItems()} items"
						>
							{#if isSubmitting}
								<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Creating...
							{:else}
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Create Order
							{/if}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	{/if}
</div>
