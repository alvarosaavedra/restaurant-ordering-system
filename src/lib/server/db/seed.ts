import { db } from './index';
import { category, menuItem, user } from './schema';
import { nanoid } from 'nanoid';

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
	{ id: nanoid(), name: 'John Doe', email: 'john@bakery.com', passwordHash: 'hashed_password_here', role: 'order_taker' as const },
	{ id: nanoid(), name: 'Jane Smith', email: 'jane@bakery.com', passwordHash: 'hashed_password_here', role: 'kitchen' as const },
	{ id: nanoid(), name: 'Mike Johnson', email: 'mike@bakery.com', passwordHash: 'hashed_password_here', role: 'delivery' as const },
	{ id: nanoid(), name: 'Admin User', email: 'admin@bakery.com', passwordHash: 'hashed_password_here', role: 'admin' as const }
];

export async function seedDatabase() {
	console.log('Seeding database...');
	
	try {
		// Insert categories
		console.log('Inserting categories...');
		await db.insert(category).values(categories.map(cat => ({
			...cat,
			createdAt: new Date()
		})));
		
		// Insert menu items
		console.log('Inserting menu items...');
		await db.insert(menuItem).values(menuItems.map(item => ({
			id: nanoid(),
			...item,
			createdAt: new Date()
		})));
		
		// Insert users
		console.log('Inserting users...');
		await db.insert(user).values(users.map(u => ({
			...u,
			createdAt: new Date(),
			updatedAt: new Date()
		})));
		
		console.log('Database seeded successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}

// Run seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase();
}