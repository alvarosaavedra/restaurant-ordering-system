<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import MenuItem from '$lib/components/MenuItem.svelte';
	import CustomerInfo from '$lib/components/CustomerInfo.svelte';
	import type { MenuItemWithCategory, CreateOrderForm } from '$lib/types/orders';

	interface CartItem {
		item: MenuItemWithCategory;
		quantity: number;
	}

	let categories: MenuItemWithCategory[] = $state([]);
	let cart: CartItem[] = $state([]);
	let customerName: string = $state('');
	let customerPhone: string = $state('');
	let totalAmount: number = $derived(
		cart.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0)
	);

	onMount(async () => {
		try {
			const response = await fetch('/api/menu');
			if (response.ok) {
				const data = await response.json();
				categories = data.categories || [];
			} else {
				console.error('Failed to fetch menu:', response.statusText);
			}
		} catch (error) {
			console.error('Error fetching menu:', error);
		}
	});

	function addToOrder(item: MenuItemWithCategory, quantity: number) {
		const existingItem = cart.find(cartItem => cartItem.item.id === item.id);
		
		if (existingItem) {
			// Update quantity if item already in cart
			cart = cart.map(cartItem => 
				cartItem.item.id === item.id 
					? { ...cartItem, quantity: cartItem.quantity + quantity }
					: cartItem
			);
		} else {
			// Add new item to cart
			cart = [...cart, { item, quantity }];
		}
	}

	function removeFromCart(itemId: string) {
		cart = cart.filter(cartItem => cartItem.item.id !== itemId);
	}

	function updateQuantity(itemId: string, newQuantity: number) {
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

	function getTotalItems(): number {
		return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
	}

	async function createOrder() {
		if (cart.length === 0) {
			alert('Please add items to the order');
			return;
		}

		if (!customerName.trim()) {
			alert('Please enter customer name');
			return;
		}

		try {
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					customerName,
					customerPhone,
					items: cart.map(cartItem => ({
						menuItemId: cartItem.item.id,
						quantity: cartItem.quantity
					}))
				})
			});

			if (response.ok) {
				// Reset cart and form
				cart = [];
				customerName = '';
				customerPhone = '';
				
				// Redirect to order confirmation or dashboard
				await goto('/orders');
			} else {
				alert('Failed to create order. Please try again.');
			}
		} catch (error) {
			console.error('Error creating order:', error);
			alert('Failed to create order. Please try again.');
		}
	}
</script>

<div class="px-4 py-6 max-w-7xl mx-auto">
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Customer Information Form -->
		<div class="lg:col-span-1">
			<CustomerInfo 
				customerName={customerName}
				customerPhone={customerPhone}
				onUpdate={(data) => {
					if (data.customerName !== undefined) customerName = data.customerName;
					if (data.customerPhone !== undefined) customerPhone = data.customerPhone;
				}}
			/>
		</div>

		<!-- Menu Items -->
		<div class="lg:col-span-2">
			<Card>
				<div class="p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-6">Menu</h2>
					
					{#if categories.length === 0}
						<div class="text-center py-8">
							<p class="text-gray-500">Loading menu...</p>
						</div>
					{:else}
						<div class="space-y-6">
							{#each categories as category}
								<div>
									<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
										{category.name}
										<span class="text-sm text-gray-500">({getTotalItems()} items)</span>
									</h3>
									
									<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{#each category.items as item (item.id)}
											<MenuItem 
												item={item}
												onAdd={addToOrder}
											/>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</Card>
		</div>
	</div>

	<!-- Order Summary & Submit -->
	{#if cart.length > 0}
		<div class="mt-6">
			<Card class="max-w-md">
				<div class="p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
					
					<div class="space-y-2 mb-4">
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Total Items:</span>
							<span class="font-medium">{getTotalItems()}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Total Amount:</span>
							<span class="font-bold text-lg">${totalAmount.toFixed(2)}</span>
						</div>
					</div>

					<div class="flex gap-3">
						<Button 
							variant="secondary"
							class="flex-1"
							onClick={() => cart = []}
						>
							Clear Cart
						</Button>
						
						<Button 
							variant="primary"
							class="flex-1"
							onClick={createOrder}
						>
							Create Order
						</Button>
					</div>
				</div>
			</Card>
		</div>
	{/if}
</div>