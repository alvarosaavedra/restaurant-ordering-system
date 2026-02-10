/**
 * Database Step Definitions
 * 
 * Steps for setting up test data (Given clauses)
 */

import { Given } from '@cucumber/cucumber';
import type { CustomWorld } from '../support/world';

// ==================== USER SETUP ====================

Given(
	'a user exists with email {string}, password {string}, and role {string}',
	function (this: CustomWorld, email: string, password: string, role: string) {
		const validRoles = ['order_taker', 'kitchen', 'delivery', 'admin'] as const;
		if (!validRoles.includes(role as any)) {
			throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
		}

		const user = this.mockDb.createUser({
			name: email.split('@')[0],
			email,
			passwordHash: password, // In real app, this would be hashed
			role: role as typeof validRoles[number]
		});

		this.trackEntity(user.id);
		return user;
	}
);

Given(
	'a user exists with name {string}, email {string}, password {string}, and role {string}',
	function (this: CustomWorld, name: string, email: string, password: string, role: string) {
		const validRoles = ['order_taker', 'kitchen', 'delivery', 'admin'] as const;
		const user = this.mockDb.createUser({
			name,
			email,
			passwordHash: password,
			role: role as typeof validRoles[number]
		});

		this.trackEntity(user.id);
		return user;
	}
);

// ==================== MENU SETUP ====================

Given('the menu has {string} priced at ${float}', function (this: CustomWorld, name: string, price: number) {
	// Create a default category if none exists
	let category = this.mockDb.getAllCategories()[0];
	if (!category) {
		category = this.mockDb.createCategory({
			name: 'General',
			displayOrder: 0
		});
		this.trackEntity(category.id);
	}

	const menuItem = this.mockDb.createMenuItem({
		categoryId: category.id,
		name,
		description: null,
		price,
		isAvailable: true
	});

	this.trackEntity(menuItem.id);
	this.context.currentMenuItem = { id: menuItem.id, name, price };
	return menuItem;
});

Given(
	'the menu has the following items:',
	function (this: CustomWorld, dataTable: { hashes: () => Array<{ name: string; price: string }> }) {
		// Create a default category
		let category = this.mockDb.getAllCategories()[0];
		if (!category) {
			category = this.mockDb.createCategory({
				name: 'General',
				displayOrder: 0
			});
			this.trackEntity(category.id);
		}

		const rows = dataTable.hashes();
		for (const row of rows) {
			const menuItem = this.mockDb.createMenuItem({
				categoryId: category.id,
				name: row.name,
				description: null,
				price: parseFloat(row.price),
				isAvailable: true
			});
			this.trackEntity(menuItem.id);
		}
	}
);

Given(
	'a category exists with name {string}',
	function (this: CustomWorld, name: string) {
		const category = this.mockDb.createCategory({
			name,
			displayOrder: 0
		});
		this.trackEntity(category.id);
		return category;
	}
);

// ==================== CLIENT SETUP ====================

Given(
	'a client exists with name {string} and phone {string}',
	function (this: CustomWorld, name: string, phone: string) {
		const client = this.mockDb.createClient({
			name,
			phone,
			address: null
		});
		this.trackEntity(client.id);
		this.context.currentClient = { id: client.id, name, phone };
		return client;
	}
);

Given(
	'a client exists with name {string}, phone {string}, and address {string}',
	function (this: CustomWorld, name: string, phone: string, address: string) {
		const client = this.mockDb.createClient({
			name,
			phone,
			address
		});
		this.trackEntity(client.id);
		this.context.currentClient = { id: client.id, name, phone };
		return client;
	}
);

// ==================== ORDER SETUP ====================

Given(
	'an order exists with status {string}',
	function (this: CustomWorld, status: string) {
		const validStatuses = ['pending', 'preparing', 'ready', 'delivered'] as const;
		if (!validStatuses.includes(status as any)) {
			throw new Error(`Invalid status: ${status}`);
		}

		// Need a user to be the employee
		let user = this.mockDb.getUserByEmail('test@test.com');
		if (!user) {
			user = this.mockDb.createUser({
				name: 'Test User',
				email: 'test@test.com',
				passwordHash: 'password',
				role: 'order_taker'
			});
			this.trackEntity(user.id);
		}

		const order = this.mockDb.createOrder({
			customerName: 'Test Customer',
			customerPhone: '555-0000',
			totalAmount: 0,
			status: status as typeof validStatuses[number],
			employeeId: user.id,
			deliveryDateTime: new Date(),
			address: null,
			comment: null,
			deletedAt: null,
			discountAmount: null,
			discountType: null,
			discountValue: null,
			discountReason: null
		});

		this.trackEntity(order.id);
		return order;
	}
);

Given(
	'the following orders exist:',
	function (
		this: CustomWorld,
		dataTable: { hashes: () => Array<{ customer: string; status: string; items: string }> }
	) {
		const user = this.mockDb.createUser({
			name: 'Test User',
			email: 'test@test.com',
			passwordHash: 'password',
			role: 'order_taker'
		});
		this.trackEntity(user.id);

		const rows = dataTable.hashes();
		for (const row of rows) {
			const order = this.mockDb.createOrder({
				customerName: row.customer,
				customerPhone: '555-0000',
				totalAmount: 0,
				status: row.status as 'pending' | 'preparing' | 'ready' | 'delivered',
				employeeId: user.id,
				deliveryDateTime: new Date(),
				address: null,
				comment: null,
				deletedAt: null,
				discountAmount: null,
				discountType: null,
				discountValue: null,
				discountReason: null
			});
			this.trackEntity(order.id);
		}
	}
);

// ==================== VARIATIONS & MODIFIERS SETUP ====================

Given(
	'the menu item {string} has the variation group {string} with options:',
	function (
		this: CustomWorld,
		itemName: string,
		groupName: string,
		dataTable: { hashes: () => Array<{ option: string; price_adjustment: string }> }
	) {
		const menuItem = this.mockDb.getMenuItemByName(itemName);
		if (!menuItem) {
			throw new Error(`Menu item "${itemName}" not found`);
		}

		const variationGroup = this.mockDb.createVariationGroup({
			menuItemId: menuItem.id,
			name: groupName,
			displayOrder: 0,
			isRequired: false,
			minSelections: 1,
			maxSelections: 1
		});
		this.trackEntity(variationGroup.id);

		const rows = dataTable.hashes();
		for (const row of rows) {
			const variation = this.mockDb.createVariation({
				groupId: variationGroup.id,
				name: row.option,
				priceAdjustment: parseFloat(row.price_adjustment) || 0,
				isDefault: false,
				displayOrder: 0
			});
			this.trackEntity(variation.id);
		}
	}
);

Given(
	'the menu item {string} has the modifier group {string} with options:',
	function (
		this: CustomWorld,
		itemName: string,
		groupName: string,
		dataTable: { hashes: () => Array<{ option: string; price: string }> }
	) {
		const menuItem = this.mockDb.getMenuItemByName(itemName);
		if (!menuItem) {
			throw new Error(`Menu item "${itemName}" not found`);
		}

		const modifierGroup = this.mockDb.createModifierGroup({
			name: groupName,
			displayOrder: 0,
			minSelections: 0,
			maxSelections: null
		});
		this.trackEntity(modifierGroup.id);

		const rows = dataTable.hashes();
		for (const row of rows) {
			const modifier = this.mockDb.createModifier({
				groupId: modifierGroup.id,
				name: row.option,
				price: parseFloat(row.price) || 0,
				isAvailable: true,
				displayOrder: 0
			});
			this.trackEntity(modifier.id);
		}

		// Link modifier group to menu item
		this.mockDb.createMenuItemModifierGroup({
			menuItemId: menuItem.id,
			modifierGroupId: modifierGroup.id,
			isRequired: false,
			minSelections: 0,
			maxSelections: null
		});
	}
);

// ==================== COMPLEX ORDER SETUP ====================

Given(
	'an order exists for {string} with:',
	function (
		this: CustomWorld,
		customerName: string,
		dataTable: { hashes: () => Array<{ item: string; variation: string; modifiers: string }> }
	) {
		const user = this.mockDb.createUser({
			name: 'Test User',
			email: 'test@test.com',
			passwordHash: 'password',
			role: 'order_taker'
		});
		this.trackEntity(user.id);

		const order = this.mockDb.createOrder({
			customerName,
			customerPhone: '555-0000',
			totalAmount: 0,
			status: 'pending',
			employeeId: user.id,
			deliveryDateTime: new Date(),
			address: null,
			comment: null,
			deletedAt: null,
			discountAmount: null,
			discountType: null,
			discountValue: null,
			discountReason: null
		});
		this.trackEntity(order.id);

		const rows = dataTable.hashes();
		for (const row of rows) {
			const menuItem = this.mockDb.getMenuItemByName(row.item);
			if (!menuItem) {
				throw new Error(`Menu item "${row.item}" not found`);
			}

			const orderItem = this.mockDb.createOrderItem({
				orderId: order.id,
				menuItemId: menuItem.id,
				quantity: 1,
				unitPrice: menuItem.price,
				discountAmount: null,
				discountType: null,
				discountValue: null,
				discountReason: null,
				finalPrice: null
			});
			this.trackEntity(orderItem.id);

			// Add variation if specified
			if (row.variation) {
				const variationGroups = this.mockDb.getVariationGroupsByMenuItem(menuItem.id);
				for (const group of variationGroups) {
					const variations = this.mockDb.getVariationsByGroup(group.id);
					const variation = variations.find(v => v.name === row.variation);
					if (variation) {
						this.mockDb.createOrderItemVariation({
							orderItemId: orderItem.id,
							variationGroupId: group.id,
							variationId: variation.id
						});
					}
				}
			}

			// Add modifiers if specified
			if (row.modifiers) {
				const modifierNames = row.modifiers.split(',').map(m => m.trim());
				for (const modifierName of modifierNames) {
					const allModifiers = this.mockDb.getAllModifierGroups().flatMap(g =>
						this.mockDb.getModifiersByGroup(g.id)
					);
					const modifier = allModifiers.find(m => m.name === modifierName);
					if (modifier) {
						this.mockDb.createOrderItemModifier({
							orderItemId: orderItem.id,
							modifierId: modifier.id,
							quantity: 1,
							priceAtOrder: modifier.price
						});
					}
				}
			}
		}

		// Recalculate order total
		const total = this.mockDb.calculateOrderTotal(order.id);
		this.mockDb.updateOrder(order.id, { totalAmount: total });
	}
);
