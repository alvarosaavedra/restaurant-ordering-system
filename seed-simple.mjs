import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { category, menuItem, user } from './src/lib/server/db/schema.js';
import { nanoid } from 'nanoid';

const db = drizzle(createClient({ url: process.env.DATABASE_URL || 'file:local.db' }));

async function seedDatabase() {
	console.log('Seeding database...');
	
	try {
		// Sample categories
		const categories = [
			{ id: nanoid(), name: 'Bakery Items', displayOrder: 1, createdAt: new Date() },
			{ id: nanoid(), name: 'Beverages', displayOrder: 2, createdAt: new Date() },
			{ id: nanoid(), name: 'Sandwiches', displayOrder: 3, createdAt: new Date() },
			{ id: nanoid(), name: 'Pastries', displayOrder: 4, createdAt: new Date() }
		];
		
		// Sample menu items
		const menuItems = [
			// Bakery Items
			{ id: nanoid(), categoryId: categories[0].id, name: 'Fresh Bread', description: 'Artisan sourdough bread baked daily', price: 4.99, isAvailable: true, createdAt: new Date() },
			{ id: nanoid(), categoryId: categories[0].id, name: 'Croissant', description: 'Buttery French croissant', price: 3.49, isAvailable: true, createdAt: new Date() },
			{ id: nanoid(), categoryId: categories[0].id, name: 'Baguette', description: 'Classic French baguette', price: 3.99, isAvailable: true, createdAt: new Date() },
			
			// Beverages
			{ id: nanoid(), categoryId: categories[1].id, name: 'Coffee', description: 'Freshly brewed coffee', price: 2.99, isAvailable: true, createdAt: new Date() },
			{ id: nanoid(), categoryId: categories[1].id, name: 'Tea', description: 'Selection of hot teas', price: 2.49, isAvailable: true, createdAt: new Date() },
			{ id: nanoid(), categoryId: categories[1].id, name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 3.99, isAvailable: true, createdAt: new Date() },
			
			// Sandwiches
			{ id: nanoid(), categoryId: categories[2].id, name: 'Turkey Club', description: 'Turkey, bacon, lettuce, tomato on sourdough', price: 8.99, isAvailable: true, createdAt: new Date() },
			{ id: nanoid(), categoryId: categories[2].id, name: 'BLT', description: 'Bacon, lettuce, tomato on toast', price: 7.99, isAvailable: true, createdAt: new Date() },
			{ id: nanoid(), categoryId: categories[2].id, name: 'Grilled Cheese', description: 'Classic grilled cheese sandwich', price: 6.99, isAvailable: true, createdAt: new Date() },
			
			// Pastries
			{ id: nanoid(), categoryId: categories[3].id, name: 'Chocolate Cake', description: 'Rich chocolate cake with frosting', price: 5.99, isAvailable: true, createdAt: new Date() },
			{ id: nanoid(), categoryId: categories[3].id, name: 'Apple Pie', description: 'Traditional apple pie with cinnamon', price: 4.99, isAvailable: true, createdAt: new Date() },
			{ id: nanoid(), categoryId: categories[3].id, name: 'Cookies', description: 'Assorted fresh baked cookies', price: 2.99, isAvailable: true, createdAt: new Date() }
		];
		
		// Sample users
		const users = [
			{ 
				id: nanoid(), 
				name: 'John Doe', 
				email: 'john@bakery.com', 
				passwordHash: 'password123', // Plain text for MVP - use proper hashing in production
				role: 'order_taker',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{ 
				id: nanoid(), 
				name: 'Jane Smith', 
				email: 'jane@bakery.com', 
				passwordHash: 'password123',
				role: 'kitchen',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{ 
				id: nanoid(), 
				name: 'Mike Johnson', 
				email: 'mike@bakery.com', 
				passwordHash: 'password123',
				role: 'delivery',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		];
		
		// Insert categories
		console.log('Inserting categories...');
		await db.insert(category).values(categories);
		
		// Insert menu items
		console.log('Inserting menu items...');
		await db.insert(menuItem).values(menuItems);
		
		// Insert users
		console.log('Inserting users...');
		await db.insert(user).values(users);
		
		console.log('Database seeded successfully!');
		console.log('\\nSample users created:');
		console.log('- Order Taker: john@bakery.com (password: password123)');
		console.log('- Kitchen: jane@bakery.com (password: password123)');
		console.log('- Delivery: mike@bakery.com (password: password123)');
		
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}

seedDatabase();