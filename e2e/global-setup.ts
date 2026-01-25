import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';
import * as schema from '../src/lib/server/db/schema';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabaseSchema(testDbPath: string) {
	console.log('Setting up test database schema...');

	if (fs.existsSync(testDbPath)) {
		console.log('Removing old test database...');
		fs.unlinkSync(testDbPath);
	}

	console.log('Pushing schema to test database...');
	try {
		execSync('DATABASE_URL="file:' + testDbPath + '" npm run db:push -- --force', {
			stdio: 'inherit',
			env: { ...process.env, DATABASE_URL: 'file:' + testDbPath }
		});
		console.log('✅ Schema pushed successfully');
	} catch (error) {
		console.error('❌ Error pushing schema:', error);
		throw error;
	}
}

export async function seedDatabase(db: ReturnType<typeof drizzle>) {
	console.log('Seeding users...');
	const users = [
		{ id: nanoid(), name: 'John Doe', email: 'john@bakery.com', passwordHash: 'password123', role: 'order_taker' as const, createdAt: new Date(), updatedAt: new Date() },
		{ id: nanoid(), name: 'Jane Smith', email: 'jane@bakery.com', passwordHash: 'password123', role: 'kitchen' as const, createdAt: new Date(), updatedAt: new Date() },
		{ id: nanoid(), name: 'Mike Johnson', email: 'mike@bakery.com', passwordHash: 'password123', role: 'delivery' as const, createdAt: new Date(), updatedAt: new Date() },
		{ id: nanoid(), name: 'Admin User', email: 'admin@bakery.com', passwordHash: 'password123', role: 'admin' as const, createdAt: new Date(), updatedAt: new Date() }
	];

	await db.insert(schema.user).values(users);

	console.log('Seeding categories...');
	const categories = [
		{ id: nanoid(), name: 'Bakery Items', displayOrder: 1, createdAt: new Date() },
		{ id: nanoid(), name: 'Beverages', displayOrder: 2, createdAt: new Date() },
		{ id: nanoid(), name: 'Sandwiches', displayOrder: 3, createdAt: new Date() },
		{ id: nanoid(), name: 'Pastries', displayOrder: 4, createdAt: new Date() }
	];

	const insertedCategories = await db.insert(schema.category).values(categories).returning();

	console.log('Seeding menu items...');
	const menuItems = [
		{ categoryId: insertedCategories[0].id, name: 'Fresh Bread', description: 'Artisan sourdough bread baked daily', price: 4.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[0].id, name: 'Croissant', description: 'Buttery French croissant', price: 3.49, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[0].id, name: 'Baguette', description: 'Classic French baguette', price: 3.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[1].id, name: 'Coffee', description: 'Freshly brewed coffee', price: 2.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[1].id, name: 'Tea', description: 'Selection of hot teas', price: 2.49, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[1].id, name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 3.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[2].id, name: 'Turkey Club', description: 'Turkey, bacon, lettuce, tomato on sourdough', price: 8.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[2].id, name: 'BLT', description: 'Bacon, lettuce, tomato on toast', price: 7.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[2].id, name: 'Grilled Cheese', description: 'Classic grilled cheese sandwich', price: 6.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[3].id, name: 'Chocolate Cake', description: 'Rich chocolate cake with frosting', price: 5.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[3].id, name: 'Apple Pie', description: 'Traditional apple pie with cinnamon', price: 4.99, isAvailable: true, createdAt: new Date() },
		{ categoryId: insertedCategories[3].id, name: 'Cookies', description: 'Assorted fresh baked cookies', price: 2.99, isAvailable: true, createdAt: new Date() }
	];

	const menuItemsWithIds = menuItems.map(item => ({
		id: nanoid(),
		...item
	}));

	await db.insert(schema.menuItem).values(menuItemsWithIds);

	console.log('Seeding clients...');
	const clients = [
		{ id: nanoid(), name: 'Alice Johnson', phone: '555-1234', address: '123 Main St', createdAt: new Date(), updatedAt: new Date() },
		{ id: nanoid(), name: 'Bob Smith', phone: '555-5678', address: '456 Oak Ave', createdAt: new Date(), updatedAt: new Date() },
		{ id: nanoid(), name: 'Carol Williams', phone: '555-9012', address: '789 Pine Rd', createdAt: new Date(), updatedAt: new Date() },
		{ id: nanoid(), name: 'David Brown', phone: '555-3456', address: '321 Elm St', createdAt: new Date(), updatedAt: new Date() },
		{ id: nanoid(), name: 'Emma Davis', phone: '555-6789', address: '654 Maple Ave', createdAt: new Date(), updatedAt: new Date() },
		{ id: nanoid(), name: 'Frank Miller', phone: '555-4321', address: '987 Cedar Ln', createdAt: new Date(), updatedAt: new Date() }
	];

	await db.insert(schema.client).values(clients);

	console.log('Seeding sample orders...');
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

	console.log('Seeding order items...');
	await db.insert(schema.orderItem).values([
		{ id: nanoid(), orderId: order1Id, menuItemId: menuItemsWithIds[1].id, quantity: 1, unitPrice: 3.49, createdAt: now },
		{ id: nanoid(), orderId: order1Id, menuItemId: menuItemsWithIds[2].id, quantity: 1, unitPrice: 3.99, createdAt: now },
		{ id: nanoid(), orderId: order1Id, menuItemId: menuItemsWithIds[3].id, quantity: 1, unitPrice: 4.99, createdAt: now },
		{ id: nanoid(), orderId: order2Id, menuItemId: menuItemsWithIds[6].id, quantity: 1, unitPrice: 8.99, createdAt: now },
		{ id: nanoid(), orderId: order3Id, menuItemId: menuItemsWithIds[0].id, quantity: 2, unitPrice: 4.99, createdAt: now },
		{ id: nanoid(), orderId: order3Id, menuItemId: menuItemsWithIds[4].id, quantity: 2, unitPrice: 2.99, createdAt: now },
		{ id: nanoid(), orderId: order4Id, menuItemId: menuItemsWithIds[5].id, quantity: 1, unitPrice: 3.99, createdAt: now }
	]);
}

export default async function globalSetup() {
	console.log('🌱 Setting up test database...');

	try {
		const testDbPath = path.join(__dirname, '..', 'test.db');

		process.env.DATABASE_URL = `file:${testDbPath}`;

		console.log(`Test database: ${testDbPath}`);

		await setupDatabaseSchema(testDbPath);

		const db = drizzle(
			createClient({ url: process.env.DATABASE_URL }),
			{ schema }
		);

		await seedDatabase(db);

		console.log('✅ Database seeded successfully!');
	} catch (error) {
		console.error('❌ Error seeding database:', error);
		throw error;
	}
}
