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

const users: any[] = [];
const clients = [
	{ id: nanoid(), name: 'Alice Johnson', phone: '555-1234', address: '123 Main St' },
	{ id: nanoid(), name: 'Bob Smith', phone: '555-5678', address: '456 Oak Ave' },
	{ id: nanoid(), name: 'Carol Williams', phone: '555-9012', address: '789 Pine Rd' },
	{ id: nanoid(), name: 'David Brown', phone: '555-3456', address: '321 Elm St' },
	{ id: nanoid(), name: 'Emma Davis', phone: '555-6789', address: '654 Maple Ave' },
	{ id: nanoid(), name: 'Frank Miller', phone: '555-4321', address: '987 Cedar Ln' }
];

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
		
		// Insert clients
		console.log('Inserting clients...');
		await db.insert(schema.client).values(clients.map(c => ({
			...c,
			createdAt: new Date(),
			updatedAt: new Date()
		})));

		console.log('Database seeded successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}