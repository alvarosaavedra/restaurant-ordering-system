import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';
import * as schema from './schema';

const db = drizzle(createClient({ url: process.env.DATABASE_URL || 'file:local.db' }), { schema });

const categories = [
	{ id: nanoid(), name: 'Bakery Items', displayOrder: 1 },
	{ id: nanoid(), name: 'Beverages', displayOrder: 2 },
	{ id: nanoid(), name: 'Sandwiches', displayOrder: 3 },
	{ id: nanoid(), name: 'Pastries', displayOrder: 4 }
];

const menuItems = [
	// Bakery Items
	{ categoryId: categories[0].id, name: 'Fresh Bread', description: 'Artisan sourdough bread baked daily', price: 4.99, isAvailable: true },
	{ categoryId: categories[0].id, name: 'Croissant', description: 'Buttery French croissant', price: 3.49, isAvailable: true },
	{ categoryId: categories[0].id, name: 'Baguette', description: 'Classic French baguette', price: 3.99, isAvailable: true },

	// Beverages
	{ categoryId: categories[1].id, name: 'Coffee', description: 'Freshly brewed coffee', price: 2.99, isAvailable: true },
	{ categoryId: categories[1].id, name: 'Tea', description: 'Selection of hot teas', price: 2.49, isAvailable: true },
	{ categoryId: categories[1].id, name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 3.99, isAvailable: true },

	// Sandwiches
	{ categoryId: categories[2].id, name: 'Turkey Club', description: 'Turkey, bacon, lettuce, tomato on sourdough', price: 8.99, isAvailable: true },
	{ categoryId: categories[2].id, name: 'BLT', description: 'Bacon, lettuce, tomato on toast', price: 7.99, isAvailable: true },
	{ categoryId: categories[2].id, name: 'Grilled Cheese', description: 'Classic grilled cheese sandwich', price: 6.99, isAvailable: true },

	// Pastries
	{ categoryId: categories[3].id, name: 'Chocolate Cake', description: 'Rich chocolate cake with frosting', price: 5.99, isAvailable: true },
	{ categoryId: categories[3].id, name: 'Apple Pie', description: 'Traditional apple pie with cinnamon', price: 4.99, isAvailable: true },
	{ categoryId: categories[3].id, name: 'Cookies', description: 'Assorted fresh baked cookies', price: 2.99, isAvailable: true }
];

const clients = [
	{ id: nanoid(), name: 'Alice Johnson', phone: '555-1234', address: '123 Main St' },
	{ id: nanoid(), name: 'Bob Smith', phone: '555-5678', address: '456 Oak Ave' },
	{ id: nanoid(), name: 'Carol Williams', phone: '555-9012', address: '789 Pine Rd' },
	{ id: nanoid(), name: 'David Brown', phone: '555-3456', address: '321 Elm St' },
	{ id: nanoid(), name: 'Emma Davis', phone: '555-6789', address: '654 Maple Ave' },
	{ id: nanoid(), name: 'Frank Miller', phone: '555-4321', address: '987 Cedar Ln' }
];

import type { MenuItem, Client } from './schema';

// Type definitions for seed data
type MenuItemWithId = MenuItem & { id: string };
type ClientWithId = Client & { id: string };

interface SampleOrder {
	id: string;
	customerName: string;
	customerPhone: string | null;
	totalAmount: number;
	status: 'pending' | 'preparing' | 'ready' | 'delivered';
	employeeId: string;
	deliveryDateTime: Date;
	address: string | null;
	comment: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface SampleOrderItem {
	id: string;
	orderId: string;
	menuItemId: string;
	quantity: number;
	unitPrice: number;
	createdAt: Date;
}

// Sample orders for testing
const createSampleOrders = (menuItemsWithIds: MenuItemWithId[], clientsWithIds: ClientWithId[], employeeId: string): SampleOrder[] => {
	const now = new Date();
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
	
	return [
		{
			id: nanoid(),
			customerName: clientsWithIds[0].name,
			customerPhone: clientsWithIds[0].phone,
			totalAmount: 18.47,
			status: 'delivered' as const,
			employeeId,
			deliveryDateTime: twoDaysAgo,
			address: clientsWithIds[0].address,
			comment: 'Please ring doorbell',
			createdAt: twoDaysAgo,
			updatedAt: twoDaysAgo
		},
		{
			id: nanoid(),
			customerName: clientsWithIds[1].name,
			customerPhone: clientsWithIds[1].phone,
			totalAmount: 24.96,
			status: 'delivered' as const,
			employeeId,
			deliveryDateTime: yesterday,
			address: clientsWithIds[1].address,
			comment: 'Extra napkins please',
			createdAt: yesterday,
			updatedAt: yesterday
		},
		{
			id: nanoid(),
			customerName: clientsWithIds[2].name,
			customerPhone: clientsWithIds[2].phone,
			totalAmount: 15.48,
			status: 'ready' as const,
			employeeId,
			deliveryDateTime: new Date(now.getTime() + 30 * 60 * 1000),
			address: clientsWithIds[2].address,
			comment: null,
			createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
			updatedAt: new Date(now.getTime() - 30 * 60 * 1000)
		},
		{
			id: nanoid(),
			customerName: clientsWithIds[3].name,
			customerPhone: clientsWithIds[3].phone,
			totalAmount: 32.94,
			status: 'preparing' as const,
			employeeId,
			deliveryDateTime: new Date(now.getTime() + 60 * 60 * 1000),
			address: clientsWithIds[3].address,
			comment: 'Allergic to nuts',
			createdAt: new Date(now.getTime() - 60 * 60 * 1000),
			updatedAt: new Date(now.getTime() - 45 * 60 * 1000)
		},
		{
			id: nanoid(),
			customerName: clientsWithIds[4].name,
			customerPhone: clientsWithIds[4].phone,
			totalAmount: 12.98,
			status: 'pending' as const,
			employeeId,
			deliveryDateTime: new Date(now.getTime() + 90 * 60 * 1000),
			address: clientsWithIds[4].address,
			comment: null,
			createdAt: new Date(now.getTime() - 15 * 60 * 1000),
			updatedAt: new Date(now.getTime() - 15 * 60 * 1000)
		}
	];
};

const createSampleOrderItems = (orders: SampleOrder[], menuItemsWithIds: MenuItemWithId[]): SampleOrderItem[] => {
	const orderItems = [];
	
	// Order 1: delivered - 3 items
	orderItems.push(
		{ id: nanoid(), orderId: orders[0].id, menuItemId: menuItemsWithIds[0].id, quantity: 1, unitPrice: menuItemsWithIds[0].price, createdAt: orders[0].createdAt },
		{ id: nanoid(), orderId: orders[0].id, menuItemId: menuItemsWithIds[2].id, quantity: 2, unitPrice: menuItemsWithIds[2].price, createdAt: orders[0].createdAt },
		{ id: nanoid(), orderId: orders[0].id, menuItemId: menuItemsWithIds[6].id, quantity: 1, unitPrice: menuItemsWithIds[6].price, createdAt: orders[0].createdAt }
	);
	
	// Order 2: delivered - 4 items
	orderItems.push(
		{ id: nanoid(), orderId: orders[1].id, menuItemId: menuItemsWithIds[6].id, quantity: 2, unitPrice: menuItemsWithIds[6].price, createdAt: orders[1].createdAt },
		{ id: nanoid(), orderId: orders[1].id, menuItemId: menuItemsWithIds[7].id, quantity: 1, unitPrice: menuItemsWithIds[7].price, createdAt: orders[1].createdAt },
		{ id: nanoid(), orderId: orders[1].id, menuItemId: menuItemsWithIds[3].id, quantity: 2, unitPrice: menuItemsWithIds[3].price, createdAt: orders[1].createdAt }
	);
	
	// Order 3: ready - 2 items
	orderItems.push(
		{ id: nanoid(), orderId: orders[2].id, menuItemId: menuItemsWithIds[8].id, quantity: 2, unitPrice: menuItemsWithIds[8].price, createdAt: orders[2].createdAt },
		{ id: nanoid(), orderId: orders[2].id, menuItemId: menuItemsWithIds[4].id, quantity: 1, unitPrice: menuItemsWithIds[4].price, createdAt: orders[2].createdAt }
	);
	
	// Order 4: preparing - 3 items
	orderItems.push(
		{ id: nanoid(), orderId: orders[3].id, menuItemId: menuItemsWithIds[9].id, quantity: 1, unitPrice: menuItemsWithIds[9].price, createdAt: orders[3].createdAt },
		{ id: nanoid(), orderId: orders[3].id, menuItemId: menuItemsWithIds[10].id, quantity: 2, unitPrice: menuItemsWithIds[10].price, createdAt: orders[3].createdAt },
		{ id: nanoid(), orderId: orders[3].id, menuItemId: menuItemsWithIds[5].id, quantity: 1, unitPrice: menuItemsWithIds[5].price, createdAt: orders[3].createdAt }
	);
	
	// Order 5: pending - 2 items
	orderItems.push(
		{ id: nanoid(), orderId: orders[4].id, menuItemId: menuItemsWithIds[1].id, quantity: 2, unitPrice: menuItemsWithIds[1].price, createdAt: orders[4].createdAt },
		{ id: nanoid(), orderId: orders[4].id, menuItemId: menuItemsWithIds[3].id, quantity: 2, unitPrice: menuItemsWithIds[3].price, createdAt: orders[4].createdAt }
	);
	
	return orderItems;
};

export async function seedDatabase() {
	if (process.env.NODE_ENV === 'production') {
		console.log('Skipping database seed in production environment');
		return;
	}

	console.log('Seeding database...');

	try {
		console.log('Seeding database...');

		// Insert categories
		console.log('Inserting categories...');
		await db.insert(schema.category).values(categories.map(cat => ({
			...cat,
			createdAt: new Date()
		})));

		// Insert menu items with IDs
		console.log('Inserting menu items...');
		const menuItemsWithIds = menuItems.map(item => ({
			id: nanoid(),
			...item,
			createdAt: new Date()
		}));
		await db.insert(schema.menuItem).values(menuItemsWithIds);
		
		// Insert clients
		console.log('Inserting clients...');
		const clientsWithIds = clients.map(c => ({
			...c,
			createdAt: new Date(),
			updatedAt: new Date()
		}));
		await db.insert(schema.client).values(clientsWithIds);

		// Check if admin user exists, if not create one for seeding orders
		interface AdminUser {
			id: string;
		}
		
		let adminUser: AdminUser | undefined = await db.query.user.findFirst({
			where: (users, { eq }) => eq(users.role, 'admin')
		});
		
		if (!adminUser) {
			console.log('Creating admin user for seeding orders...');
			const adminId = nanoid();
			await db.insert(schema.user).values({
				id: adminId,
				name: 'Admin',
				email: 'admin@restaurant.com',
				passwordHash: 'dummy_hash_for_seeding',
				role: 'admin',
				createdAt: new Date(),
				updatedAt: new Date()
			});
			adminUser = { id: adminId };
		}

		// Insert sample orders
		console.log('Inserting sample orders...');
		const sampleOrders = createSampleOrders(menuItemsWithIds, clientsWithIds, adminUser!.id);
		await db.insert(schema.order).values(sampleOrders);

		// Insert sample order items
		console.log('Inserting sample order items...');
		const sampleOrderItems = createSampleOrderItems(sampleOrders, menuItemsWithIds);
		await db.insert(schema.orderItem).values(sampleOrderItems);

		console.log('Database seeded successfully!');
		console.log(`  - ${categories.length} categories`);
		console.log(`  - ${menuItemsWithIds.length} menu items`);
		console.log(`  - ${clientsWithIds.length} clients`);
		console.log(`  - ${sampleOrders.length} sample orders`);
		console.log(`  - ${sampleOrderItems.length} order items`);
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}