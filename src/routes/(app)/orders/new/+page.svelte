<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import MenuItem from '$lib/components/MenuItem.svelte';
	import CustomerInfo from '$lib/components/CustomerInfo.svelte';
	import DiscountPanel from '$lib/components/DiscountPanel.svelte';
	import MobileDiscountSheet from '$lib/components/MobileDiscountSheet.svelte';
	import { cartStore, type CartItem, type ItemDiscount, type OrderDiscount } from '$lib/stores/cart';
	import { toast } from '$lib/utils/toast';
	import type { MenuItemWithCategory } from '$lib/types/orders';

	interface CategoryWithItems {
		id: string;
		name: string;
		displayOrder: number;
		createdAt: Date;
		items: MenuItemWithCategory[];
	}

	let { data }: { data: { categories: CategoryWithItems[] } } = $props();

	// Subscribe to cart store using Svelte 5 store syntax
	let cart = $state<CartItem[]>([]);
	let orderDiscount = $state<OrderDiscount | null>(null);
	let cartTotals = $state({ subtotal: 0, itemDiscounts: 0, orderDiscount: 0, totalDiscount: 0, finalTotal: 0 });
	
	// Store subscriptions
	$effect(() => {
		cartStore.items.subscribe((value: CartItem[]) => cart = value);
	});
	
	$effect(() => {
		cartStore.orderDiscount.subscribe((value: OrderDiscount | null) => orderDiscount = value);
	});
	
	$effect(() => {
		cartStore.totals.subscribe((value: typeof cartTotals) => cartTotals = value);
	});

	let customerName: string = $state('');
	let customerPhone: string = $state('');
	let deliveryDateTime: string = $state('');
	let address: string = $state('');
	let comment: string = $state('');
	let categories = $derived(data.categories || []);
	let isSubmitting: boolean = $state(false);
	let showValidationErrors: boolean = $state(false);
	let searchQuery: string = $state('');

	// Filtered categories based on search query with items sorted by name
	let filteredCategories = $derived(() => {
		if (!searchQuery.trim()) {
			return categories.map(cat => ({
				...cat,
				items: [...cat.items].sort((a, b) => a.name.localeCompare(b.name))
			}));
		}
		
		const query = searchQuery.toLowerCase().trim();
		return categories
			.map(cat => ({
				...cat,
				items: cat.items
					.filter(item => 
						item.name.toLowerCase().includes(query) ||
						(item.description?.toLowerCase().includes(query) ?? false)
					)
					.sort((a, b) => a.name.localeCompare(b.name))
			}))
			.filter(cat => cat.items.length > 0);
	});

	// Mobile discount sheet state
	let showDiscountSheet: boolean = $state(false);
	let discountSheetMode: 'item' | 'total' = $state('total');
	let selectedItemIdForDiscount: string | null = $state(null);
	let editingDiscount: ItemDiscount | OrderDiscount | null = $state(null);

	function addToOrder(item: MenuItemWithCategory, quantity: number) {
		cartStore.addItem(item, quantity);
	}

	function getTotalItems(): number {
		return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
	}

	function removeFromCart(itemId: string) {
		cartStore.removeItem(itemId);
	}

	function updateCartQuantity(itemId: string, newQuantity: number) {
		cartStore.updateQuantity(itemId, newQuantity);
	}

	function handleAddDiscount() {
		discountSheetMode = 'total';
		selectedItemIdForDiscount = null;
		editingDiscount = orderDiscount;
		showDiscountSheet = true;
	}

	function handleAddItemDiscount(itemId: string) {
		discountSheetMode = 'item';
		selectedItemIdForDiscount = itemId;
		const item = cart.find(c => c.item.id === itemId);
		editingDiscount = item?.discount || null;
		showDiscountSheet = true;
	}

	function handleSaveDiscount(discount: { type: 'fixed' | 'percentage'; value: number; reason?: string; itemId?: string }) {
		if (discountSheetMode === 'item' && discount.itemId) {
			const itemDiscount: ItemDiscount = {
				type: discount.type,
				value: discount.value,
				reason: discount.reason
			};
			cartStore.addItemDiscount(discount.itemId, itemDiscount);
			toast.success('Item discount applied');
		} else {
			const orderDisc: OrderDiscount = {
				type: discount.type,
				value: discount.value,
				reason: discount.reason
			};
			cartStore.setOrderDiscount(orderDisc);
			toast.success('Order discount applied');
		}
		showDiscountSheet = false;
	}

	function handleRemoveItemDiscount(itemId: string) {
		cartStore.removeItemDiscount(itemId);
		toast.info('Item discount removed');
	}

	function handleRemoveOrderDiscount() {
		cartStore.clearOrderDiscount();
		toast.info('Order discount removed');
	}

	function handleCloseDiscountSheet() {
		showDiscountSheet = false;
		selectedItemIdForDiscount = null;
		editingDiscount = null;
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
			const deliveryDateObj = new Date(deliveryDateTime);
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					customerName,
					customerPhone,
					deliveryDateTime: deliveryDateObj.toISOString(),
					address,
					comment,
					items: cart.map(cartItem => ({
						menuItemId: cartItem.item.id,
						quantity: cartItem.quantity,
						discount: cartItem.discount
					})),
					orderDiscount: orderDiscount
				})
			});

			if (response.ok) {
				toast.success('Order created successfully!');
				cartStore.clearCart();
				customerName = '';
				customerPhone = '';
				deliveryDateTime = '';
				address = '';
				comment = '';
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				await goto('/orders', { replaceState: false });
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
	<div class="mb-6">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 bg-bakery-100 rounded-lg flex items-center justify-center" aria-hidden="true">
				<svg class="w-5 h-5 text-bakery-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-neutral-900 font-display">New Order</h1>
		</div>
	</div>

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
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-bakery-100 rounded-lg flex items-center justify-center" aria-hidden="true">
							<svg class="w-5 h-5 text-bakery-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
						</div>
						<h2 class="text-xl font-bold text-neutral-900 font-display">Menu</h2>
					</div>
					
					<!-- Search Input -->
					<div class="relative w-full sm:w-72">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg class="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search products..."
							class="w-full pl-10 pr-10 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:border-transparent transition-all"
							aria-label="Search menu items"
						/>
						{#if searchQuery}
							<button
								type="button"
								class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
								onclick={() => searchQuery = ''}
								aria-label="Clear search"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						{/if}
					</div>
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
					{#if filteredCategories().length === 0}
						<div class="text-center py-12">
							<div class="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-2xl flex items-center justify-center">
								<svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<h3 class="text-lg font-semibold text-neutral-900 mb-2">No products found</h3>
							<p class="text-neutral-500 font-medium">Try adjusting your search terms</p>
						</div>
					{:else}
					<div class="space-y-6">
						{#each filteredCategories() as category (category.id)}
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
							{@const displayPrice = cartItem.discount 
								? Math.max(0, (cartItem.item.price * cartItem.quantity) - (cartItem.discount.type === 'percentage' 
									? (cartItem.item.price * cartItem.quantity) * (cartItem.discount.value / 100)
									: cartItem.discount.value))
								: cartItem.item.price * cartItem.quantity}
							<Card variant="subtle" class="p-3">
								<div class="flex flex-col gap-3">
									<!-- Top Row: Item Info and Price -->
									<div class="flex items-start justify-between gap-2">
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 flex-wrap">
												<h4 class="font-semibold text-neutral-900 text-sm">{cartItem.item.name}</h4>
												{#if cartItem.discount}
													<span class="text-xs font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded shrink-0">
														{cartItem.discount.type === 'percentage' ? `${cartItem.discount.value}%` : `$${cartItem.discount.value.toFixed(2)}`} off
													</span>
												{/if}
											</div>
											{#if cartItem.item.category}
												<p class="text-xs text-neutral-500 mt-0.5">{cartItem.item.category.name}</p>
											{/if}
											{#if cartItem.discount}
												{@const originalPrice = cartItem.item.price * cartItem.quantity}
												{@const discountAmount = cartItem.discount.type === 'percentage' 
													? originalPrice * (cartItem.discount.value / 100)
													: cartItem.discount.value}
												{@const finalPrice = Math.max(0, originalPrice - discountAmount)}
												<p class="text-xs text-success-600 mt-0.5">
													<span class="line-through text-neutral-400">${originalPrice.toFixed(2)}</span>
													<span class="font-medium">${finalPrice.toFixed(2)}</span>
													<span class="text-success-600">(-${discountAmount.toFixed(2)})</span>
												</p>
											{/if}
										</div>
										<span class="font-bold text-neutral-900 text-sm shrink-0">${displayPrice.toFixed(2)}</span>
									</div>
									
									<!-- Bottom Row: Controls -->
									<div class="flex items-center justify-between">
										<button
											type="button"
											class="p-1.5 text-bakery-500 hover:text-bakery-700 hover:bg-bakery-50 rounded-lg transition-colors"
											onclick={() => handleAddItemDiscount(cartItem.item.id)}
											aria-label={cartItem.discount ? `Edit discount for ${cartItem.item.name}` : `Add discount for ${cartItem.item.name}`}
											title={cartItem.discount ? 'Edit discount' : 'Add discount'}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" />
											</svg>
										</button>
										<div class="flex items-center gap-2">
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
												<button
													type="button"
													class="p-1.5 text-error-500 hover:text-error-700 hover:bg-error-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
													onclick={() => removeFromCart(cartItem.item.id)}
													aria-label={`Remove ${cartItem.item.name} from order`}
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
													</svg>
												</button>
											</div>
										</div>
									</div>
								</Card>
						{/each}
					</div>

					<!-- Discount Panel -->
					<div class="mb-6">
						<DiscountPanel
							cartItems={cart}
							orderDiscount={orderDiscount}
							totals={cartTotals}
							onAddDiscount={handleAddDiscount}
							onRemoveItemDiscount={handleRemoveItemDiscount}
							onRemoveOrderDiscount={handleRemoveOrderDiscount}
						/>
					</div>

					<div class="flex flex-col sm:flex-row gap-3">
						<Button
							variant="secondary"
							class="flex-1"
							onclick={() => cartStore.clearCart()}
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

<!-- Mobile Discount Sheet -->
<MobileDiscountSheet
	isOpen={showDiscountSheet}
	mode={discountSheetMode}
	cartItems={cart}
	selectedItemId={selectedItemIdForDiscount}
	initialDiscount={editingDiscount}
	onSave={handleSaveDiscount}
	onClose={handleCloseDiscountSheet}
/>
