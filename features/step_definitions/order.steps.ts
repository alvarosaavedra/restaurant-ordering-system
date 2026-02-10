/**
 * Order Step Definitions
 * 
 * Steps for order creation, management, and cart operations
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { CustomWorld } from '../support/world';

// ==================== ORDER CREATION STEPS ====================

When('I create an order for {string} at {string}', function (this: CustomWorld, customerName: string, address: string) {
	const user = this.context.currentUser;
	if (!user) {
		throw new Error('No user logged in');
	}

	const order = this.mockDb.createOrder({
		customerName,
		customerPhone: this.context['formData']?.['Phone'] || '555-0000',
		totalAmount: 0,
		status: 'pending',
		employeeId: user.id,
		deliveryDateTime: new Date(),
		address,
		comment: null,
		deletedAt: null,
		discountAmount: null,
		discountType: null,
		discountValue: null,
		discountReason: null
	});

	this.trackEntity(order.id);
	this.context.currentOrder = {
		id: order.id,
		total: order.totalAmount,
		status: order.status
	};
});

When('I add {string} to the cart', function (this: CustomWorld, itemName: string) {
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	this.addToCart({
		menuItemId: menuItem.id,
		quantity: 1,
		variations: [],
		modifiers: []
	});
});

When('I add {string} with quantity {int} to the cart', function (this: CustomWorld, itemName: string, quantity: number) {
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	this.addToCart({
		menuItemId: menuItem.id,
		quantity,
		variations: [],
		modifiers: []
	});
});

When('I add {string} with variation {string}', function (this: CustomWorld, itemName: string, variationName: string) {
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	const variationGroups = this.mockDb.getVariationGroupsByMenuItem(menuItem.id);
	let variationId: string | undefined;

	for (const group of variationGroups) {
		const variations = this.mockDb.getVariationsByGroup(group.id);
		const variation = variations.find(v => v.name === variationName);
		if (variation) {
			variationId = variation.id;
			break;
		}
	}

	if (!variationId) {
		throw new Error(`Variation "${variationName}" not found for "${itemName}"`);
	}

	this.addToCart({
		menuItemId: menuItem.id,
		quantity: 1,
		variations: [variationId],
		modifiers: []
	});
});

When('I add {string} with modifier {string}', function (this: CustomWorld, itemName: string, modifierName: string) {
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	const allModifiers = this.mockDb.getAllModifierGroups().flatMap(g =>
		this.mockDb.getModifiersByGroup(g.id)
	);
	const modifier = allModifiers.find(m => m.name === modifierName);

	if (!modifier) {
		throw new Error(`Modifier "${modifierName}" not found`);
	}

	this.addToCart({
		menuItemId: menuItem.id,
		quantity: 1,
		variations: [],
		modifiers: [modifier.id]
	});
});

When('I remove {string} from the cart', function (this: CustomWorld, itemName: string) {
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	this.context.cartItems = this.context.cartItems.filter(
		item => item.menuItemId !== menuItem.id
	);
});

When('I update quantity of {string} to {int}', function (this: CustomWorld, itemName: string, quantity: number) {
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	const cartItem = this.context.cartItems.find(item => item.menuItemId === menuItem.id);
	if (cartItem) {
		cartItem.quantity = quantity;
	}
});

// ==================== DISCOUNT STEPS ====================

When('I apply a {string} discount of ${float} to the order', function (this: CustomWorld, discountType: string, amount: number) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}

	if (discountType !== 'fixed' && discountType !== 'percentage') {
		throw new Error(`Invalid discount type: ${discountType}`);
	}

	const order = this.mockDb.getOrder(this.context.currentOrder.id);
	if (order) {
		this.mockDb.updateOrder(order.id, {
			discountType: discountType as 'fixed' | 'percentage',
			discountValue: amount
		});
	}
});

When('I apply a {string} discount of ${float} to {string}', function (this: CustomWorld, discountType: string, amount: number, itemName: string) {
	// Find the order item
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	// Find order items with this menu item
	if (this.context.currentOrder) {
		const orderItems = this.mockDb.getOrderItemsByOrder(this.context.currentOrder.id);
		const orderItem = orderItems.find(oi => oi.menuItemId === menuItem.id);

		if (orderItem) {
			this.mockDb.updateOrderItem(orderItem.id, {
				discountType: discountType as 'fixed' | 'percentage',
				discountValue: amount
			});
		}
	}
});

// ==================== ORDER STATUS STEPS ====================

When('I mark the order as {string}', function (this: CustomWorld, status: string) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}

	const validStatuses = ['pending', 'preparing', 'ready', 'delivered'];
	if (!validStatuses.includes(status)) {
		throw new Error(`Invalid status: ${status}`);
	}

	this.mockDb.updateOrder(this.context.currentOrder.id, {
		status: status as 'pending' | 'preparing' | 'ready' | 'delivered'
	});
	this.context.currentOrder.status = status;
});

When('I start preparing the order', function (this: CustomWorld) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}
	this.mockDb.updateOrder(this.context.currentOrder.id, { status: 'preparing' });
	this.context.currentOrder.status = 'preparing';
});

When('I mark the order as ready', function (this: CustomWorld) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}
	this.mockDb.updateOrder(this.context.currentOrder.id, { status: 'ready' });
	this.context.currentOrder.status = 'ready';
});

When('I mark the order as delivered', function (this: CustomWorld) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}
	this.mockDb.updateOrder(this.context.currentOrder.id, { status: 'delivered' });
	this.context.currentOrder.status = 'delivered';
});

// ==================== VERIFICATION STEPS ====================

Then('the cart should contain {int} items', function (this: CustomWorld, count: number) {
	const totalItems = this.context.cartItems.reduce((sum, item) => sum + item.quantity, 0);
	assert.strictEqual(
		totalItems,
		count,
		`Expected cart to contain ${count} items, got ${totalItems}`
	);
});

Then('the cart should contain {int} line items', function (this: CustomWorld, count: number) {
	assert.strictEqual(
		this.context.cartItems.length,
		count,
		`Expected cart to contain ${count} line items, got ${this.context.cartItems.length}`
	);
});

Then('the order total should be ${float}', function (this: CustomWorld, expectedTotal: number) {
	const actualTotal = this.calculateCartTotal();
	
	// Allow for small floating point differences
	const diff = Math.abs(actualTotal - expectedTotal);
	assert.ok(
		diff < 0.01,
		`Expected order total to be $${expectedTotal}, got $${actualTotal}`
	);
});

Then('the order status should be {string}', function (this: CustomWorld, expectedStatus: string) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}

	const order = this.mockDb.getOrder(this.context.currentOrder.id);
	assert.ok(order, 'Order not found');
	assert.strictEqual(
		order.status,
		expectedStatus,
		`Expected order status to be "${expectedStatus}", got "${order.status}"`
	);
});

Then('the order should have status {string}', function (this: CustomWorld, expectedStatus: string) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}

	const order = this.mockDb.getOrder(this.context.currentOrder.id);
	assert.ok(order, 'Order not found');
	assert.strictEqual(
		order.status,
		expectedStatus,
		`Expected order status to be "${expectedStatus}", got "${order.status}"`
	);
});

Then('the order should contain {string}', function (this: CustomWorld, itemName: string) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}

	const orderItems = this.mockDb.getOrderItemsByOrder(this.context.currentOrder.id);
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	const found = orderItems.some(oi => oi.menuItemId === menuItem.id);
	assert.ok(found, `Expected order to contain "${itemName}"`);
});

Then('the order should show {string} with variation {string}', function (this: CustomWorld, itemName: string, variationName: string) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}

	const { items } = this.mockDb.getOrderWithDetails(this.context.currentOrder.id);
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	const orderItemWithVariation = items.find(({ item, variations }) => {
		if (item.menuItemId !== menuItem.id) return false;
		return variations.some(v => {
			const variation = this.mockDb.getVariation(v.variationId);
			return variation?.name === variationName;
		});
	});

	assert.ok(
		orderItemWithVariation,
		`Expected order to show "${itemName}" with variation "${variationName}"`
	);
});

Then('the order should show {string} with modifier {string}', function (this: CustomWorld, itemName: string, modifierName: string) {
	if (!this.context.currentOrder) {
		throw new Error('No current order');
	}

	const { items } = this.mockDb.getOrderWithDetails(this.context.currentOrder.id);
	const menuItem = this.mockDb.getMenuItemByName(itemName);
	
	if (!menuItem) {
		throw new Error(`Menu item "${itemName}" not found`);
	}

	const orderItemWithModifier = items.find(({ item, modifiers }) => {
		if (item.menuItemId !== menuItem.id) return false;
		return modifiers.some(m => {
			const modifier = this.mockDb.getModifier(m.modifierId);
			return modifier?.name === modifierName;
		});
	});

	assert.ok(
		orderItemWithModifier,
		`Expected order to show "${itemName}" with modifier "${modifierName}"`
	);
});

Then('I should see {int} orders in the {string} section', function (this: CustomWorld, count: number, section: string) {
	const statusMap: Record<string, string> = {
		'pending': 'pending',
		'preparing': 'preparing',
		'ready': 'ready',
		'delivered': 'delivered'
	};

	const status = statusMap[section.toLowerCase()];
	if (!status) {
		throw new Error(`Unknown section: ${section}`);
	}

	const orders = this.mockDb.getOrdersByStatus(status as 'pending' | 'preparing' | 'ready' | 'delivered');
	assert.strictEqual(
		orders.length,
		count,
		`Expected ${count} orders in "${section}" section, found ${orders.length}`
	);
});

Then('I should see the order for {string}', function (this: CustomWorld, customerName: string) {
	const orders = this.mockDb.getAllOrders();
	const order = orders.find(o => o.customerName === customerName);
	assert.ok(order, `Expected to see order for "${customerName}"`);
});
