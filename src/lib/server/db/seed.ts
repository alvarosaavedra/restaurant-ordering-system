import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';
import * as schema from './schema';

const db = drizzle(createClient({ url: process.env.DATABASE_URL || 'file:local.db' }), { schema });

// Sample categories
const categories = [
	{ id: nanoid(), name: 'Bakery Items', displayOrder: 1 },
	{ id: nanoid(), name: 'Beverages', displayOrder: 2 },
	{ id: nanoid(), name: 'Sandwiches', displayOrder: 3 },
	{ id: nanoid(), name: 'Pastries', displayOrder: 4 }
];

// Sample menu items
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

// Sample users (passwords should be hashed in real application)
const users = [
	{ id: nanoid(), name: 'John Doe', email: 'john@bakery.com', passwordHash: 'password123', role: 'order_taker' as const },
	{ id: nanoid(), name: 'Jane Smith', email: 'jane@bakery.com', passwordHash: 'password123', role: 'kitchen' as const },
	{ id: nanoid(), name: 'Mike Johnson', email: 'mike@bakery.com', passwordHash: 'password123', role: 'delivery' as const },
	{ id: nanoid(), name: 'Admin User', email: 'admin@bakery.com', passwordHash: 'password123', role: 'admin' as const }
];

const clients = [
	{ id: nanoid(), name: 'Alice Johnson', phone: '555-1234', address: '123 Main St' },
	{ id: nanoid(), name: 'Bob Smith', phone: '555-5678', address: '456 Oak Ave' },
	{ id: nanoid(), name: 'Carol Williams', phone: '555-9012', address: '789 Pine Rd' },
	{ id: nanoid(), name: 'David Brown', phone: '555-3456', address: '321 Elm St' },
	{ id: nanoid(), name: 'Emma Davis', phone: '555-6789', address: '654 Maple Ave' },
	{ id: nanoid(), name: 'Frank Miller', phone: '555-4321', address: '987 Cedar Ln' }
];

export async function seedDatabase() {
	console.log('Seeding database...');
	
	try {
		// Insert categories
		console.log('Inserting categories...');
		const insertedCategories = await db.insert(schema.category).values(categories.map(cat => ({
			...cat,
			createdAt: new Date()
		}))).returning();
		
		// Insert menu items with IDs
		console.log('Inserting menu items...');
		const menuItemsWithIds = menuItems.map(item => ({
			id: nanoid(),
			...item,
			createdAt: new Date()
		}));
		await db.insert(schema.menuItem).values(menuItemsWithIds);
		
		// Insert users
		console.log('Inserting users...');
		await db.insert(schema.user).values(users.map(u => ({
			...u,
			createdAt: new Date(),
			updatedAt: new Date()
		})));

		// Insert clients
		console.log('Inserting clients...');
		await db.insert(schema.client).values(clients.map(c => ({
			...c,
			createdAt: new Date(),
			updatedAt: new Date()
		})));
		
		// Insert sample orders for testing
		console.log('Inserting sample orders...');
		const now = new Date();
		const order1Id = nanoid();
		const order2Id = nanoid();
		const order3Id = nanoid();
		const order4Id = nanoid();
		
		await db.insert(schema.order).values([
			{
				id: order1Id,
				customerName: 'Alice Johnson',
				customerPhone: '555-1234',
				totalAmount: 12.47,
				status: 'ready',
				employeeId: users[0].id,
				deliveryDateTime: new Date(now.getTime() + 60 * 60 * 1000),
				address: '123 Main St',
				comment: 'Leave at door',
				createdAt: new Date(now.getTime() - 2 * 60 * 1000),
				updatedAt: new Date(now.getTime() - 2 * 60 * 1000)
			},
			{
				id: order2Id,
				customerName: 'Bob Smith',
				customerPhone: '555-5678',
				totalAmount: 8.99,
				status: 'ready',
				employeeId: users[0].id,
				deliveryDateTime: new Date(now.getTime() + 90 * 60 * 1000),
				address: '456 Oak Ave',
				createdAt: new Date(now.getTime() - 5 * 60 * 1000),
				updatedAt: new Date(now.getTime() - 5 * 60 * 1000)
			},
			{
				id: order3Id,
				customerName: 'Carol Williams',
				customerPhone: '555-9012',
				totalAmount: 15.98,
				status: 'pending',
				employeeId: users[0].id,
				deliveryDateTime: new Date(now.getTime() + 120 * 60 * 1000),
				comment: 'Allergic to nuts',
				createdAt: new Date(now.getTime() - 10 * 60 * 1000),
				updatedAt: new Date(now.getTime() - 10 * 60 * 1000)
			},
			{
				id: order4Id,
				customerName: 'David Brown',
				customerPhone: '555-3456',
				totalAmount: 3.99,
				status: 'preparing',
				employeeId: users[0].id,
				deliveryDateTime: new Date(now.getTime() + 30 * 60 * 1000),
				createdAt: new Date(now.getTime() - 15 * 60 * 1000),
				updatedAt: new Date(now.getTime() - 15 * 60 * 1000)
			}
		]);
		
		// Insert order items for the orders using index-based references
		await db.insert(schema.orderItem).values([
			// Order 1 items (Alice Johnson - ready)
			{ id: nanoid(), orderId: order1Id, menuItemId: menuItemsWithIds[1].id, quantity: 1, unitPrice: 3.49, createdAt: now },
			{ id: nanoid(), orderId: order1Id, menuItemId: menuItemsWithIds[2].id, quantity: 1, unitPrice: 3.99, createdAt: now },
			{ id: nanoid(), orderId: order1Id, menuItemId: menuItemsWithIds[3].id, quantity: 1, unitPrice: 4.99, createdAt: now },
			// Order 2 items (Bob Smith - ready)
			{ id: nanoid(), orderId: order2Id, menuItemId: menuItemsWithIds[6].id, quantity: 1, unitPrice: 8.99, createdAt: now },
			// Order 3 items (Carol Williams - pending)
			{ id: nanoid(), orderId: order3Id, menuItemId: menuItemsWithIds[0].id, quantity: 2, unitPrice: 4.99, createdAt: now },
			{ id: nanoid(), orderId: order3Id, menuItemId: menuItemsWithIds[4].id, quantity: 2, unitPrice: 2.99, createdAt: now },
			// Order 4 items (David Brown - preparing)
			{ id: nanoid(), orderId: order4Id, menuItemId: menuItemsWithIds[5].id, quantity: 1, unitPrice: 3.99, createdAt: now }
		]);
		
		console.log('Database seeded successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}

// Run seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase();
}