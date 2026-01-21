import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';

const DATABASE_URL = process.env.DATABASE_URL || 'file:local.db';

const db = drizzle(createClient({ url: DATABASE_URL }));

// Schema definitions (copied from schema.ts to avoid import issues)
const category = {
	name: 'category',
	columns: {
		id: 'id',
		name: 'name',
		displayOrder: 'display_order',
		createdAt: 'created_at'
	}
};

const menuItem = {
	name: 'menu_item',
	columns: {
		id: 'id',
		categoryId: 'category_id',
		name: 'name',
		description: 'description',
		price: 'price',
		isAvailable: 'is_available',
		createdAt: 'created_at'
	}
};

const user = {
	name: 'user',
	columns: {
		id: 'id',
		name: 'name',
		email: 'email',
		passwordHash: 'password_hash',
		role: 'role',
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
};

// Sample data
const categories = [
	{ id: nanoid(), name: 'Bakery Items', display_order: 1, created_at: Date.now() },
	{ id: nanoid(), name: 'Beverages', display_order: 2, created_at: Date.now() },
	{ id: nanoid(), name: 'Sandwiches', display_order: 3, created_at: Date.now() },
	{ id: nanoid(), name: 'Pastries', display_order: 4, created_at: Date.now() }
];

const menuItems = [
	{ id: nanoid(), category_id: categories[0].id, name: 'Fresh Bread', description: 'Artisan sourdough bread baked daily', price: 4.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[0].id, name: 'Croissant', description: 'Buttery French croissant', price: 3.49, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[0].id, name: 'Baguette', description: 'Classic French baguette', price: 3.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[1].id, name: 'Coffee', description: 'Freshly brewed coffee', price: 2.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[1].id, name: 'Tea', description: 'Selection of hot teas', price: 2.49, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[1].id, name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 3.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[2].id, name: 'Turkey Club', description: 'Turkey, bacon, lettuce, tomato on sourdough', price: 8.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[2].id, name: 'BLT', description: 'Bacon, lettuce, tomato on toast', price: 7.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[2].id, name: 'Grilled Cheese', description: 'Classic grilled cheese sandwich', price: 6.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[3].id, name: 'Chocolate Cake', description: 'Rich chocolate cake with frosting', price: 5.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[3].id, name: 'Apple Pie', description: 'Traditional apple pie with cinnamon', price: 4.99, is_available: 1, created_at: Date.now() },
	{ id: nanoid(), category_id: categories[3].id, name: 'Cookies', description: 'Assorted fresh baked cookies', price: 2.99, is_available: 1, created_at: Date.now() }
];

const users = [
	{ id: nanoid(), name: 'John Doe', email: 'john@bakery.com', password_hash: 'password123', role: 'order_taker', created_at: Date.now(), updated_at: Date.now() },
	{ id: nanoid(), name: 'Jane Smith', email: 'jane@bakery.com', password_hash: 'password123', role: 'kitchen', created_at: Date.now(), updated_at: Date.now() },
	{ id: nanoid(), name: 'Mike Johnson', email: 'mike@bakery.com', password_hash: 'password123', role: 'delivery', created_at: Date.now(), updated_at: Date.now() },
	{ id: nanoid(), name: 'Admin User', email: 'admin@bakery.com', password_hash: 'password123', role: 'admin', created_at: Date.now(), updated_at: Date.now() }
];

const order = {
	name: 'order',
	columns: {
		id: 'id',
		customerName: 'customer_name',
		customerPhone: 'customer_phone',
		totalAmount: 'total_amount',
		status: 'status',
		employeeId: 'employee_id',
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
};

const orderItem = {
	name: 'order_item',
	columns: {
		id: 'id',
		orderId: 'order_id',
		menuItemId: 'menu_item_id',
		quantity: 'quantity',
		unitPrice: 'unit_price',
		createdAt: 'created_at'
	}
};

async function seedDatabase() {
	console.log('Seeding database...');
	
	try {
		const client = createClient({ url: DATABASE_URL });
		
		await client.execute({
			sql: 'CREATE TABLE IF NOT EXISTS category (id TEXT PRIMARY KEY, name TEXT NOT NULL, display_order INTEGER NOT NULL, created_at INTEGER NOT NULL)'
		});
		await client.execute({
			sql: 'CREATE TABLE IF NOT EXISTS menu_item (id TEXT PRIMARY KEY, category_id TEXT NOT NULL, name TEXT NOT NULL, description TEXT, price REAL NOT NULL, is_available INTEGER NOT NULL, created_at INTEGER NOT NULL, FOREIGN KEY (category_id) REFERENCES category(id) ON UPDATE NO ACTION ON DELETE CASCADE)'
		});
		await client.execute({
			sql: 'CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)'
		});
		await client.execute({
			sql: 'CREATE TABLE IF NOT EXISTS "order" (id TEXT PRIMARY KEY, customer_name TEXT NOT NULL, customer_phone TEXT, total_amount REAL NOT NULL, status TEXT NOT NULL, employee_id TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, FOREIGN KEY (employee_id) REFERENCES user(id) ON UPDATE NO ACTION ON DELETE NO ACTION)'
		});
		await client.execute({
			sql: 'CREATE TABLE IF NOT EXISTS order_item (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, menu_item_id TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price REAL NOT NULL, created_at INTEGER NOT NULL, FOREIGN KEY (order_id) REFERENCES "order"(id) ON UPDATE NO ACTION ON DELETE CASCADE, FOREIGN KEY (menu_item_id) REFERENCES menu_item(id) ON UPDATE NO ACTION ON DELETE NO ACTION)'
		});
		
		console.log('✓ Tables created');
		
		await client.execute({
			sql: 'INSERT INTO category (id, name, display_order, created_at) VALUES (?, ?, ?, ?)',
			args: [categories[0].id, categories[0].name, categories[0].display_order, categories[0].created_at]
		});
		await client.execute({
			sql: 'INSERT INTO category (id, name, display_order, created_at) VALUES (?, ?, ?, ?)',
			args: [categories[1].id, categories[1].name, categories[1].display_order, categories[1].created_at]
		});
		await client.execute({
			sql: 'INSERT INTO category (id, name, display_order, created_at) VALUES (?, ?, ?, ?)',
			args: [categories[2].id, categories[2].name, categories[2].display_order, categories[2].created_at]
		});
		await client.execute({
			sql: 'INSERT INTO category (id, name, display_order, created_at) VALUES (?, ?, ?, ?)',
			args: [categories[3].id, categories[3].name, categories[3].display_order, categories[3].created_at]
		});
		
		console.log('✓ Categories inserted');
		
		for (const item of menuItems) {
			await client.execute({
				sql: 'INSERT INTO menu_item (id, category_id, name, description, price, is_available, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
				args: [item.id, item.category_id, item.name, item.description, item.price, item.is_available, item.created_at]
			});
		}
		
		console.log('✓ Menu items inserted');
		
		for (const u of users) {
			await client.execute({
				sql: 'INSERT INTO user (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
				args: [u.id, u.name, u.email, u.password_hash, u.role, u.created_at, u.updated_at]
			});
		}
		
		console.log('✓ Users inserted');
		
		const now = Date.now();
		const order1Id = nanoid();
		const order2Id = nanoid();
		const order3Id = nanoid();
		const order4Id = nanoid();
		
		await client.execute({
			sql: 'INSERT INTO "order" (id, customer_name, customer_phone, total_amount, status, employee_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			args: [order1Id, 'Alice Johnson', '555-1234', 12.47, 'ready', users[0].id, now, now]
		});
		await client.execute({
			sql: 'INSERT INTO "order" (id, customer_name, customer_phone, total_amount, status, employee_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			args: [order2Id, 'Bob Smith', '555-5678', 8.99, 'ready', users[0].id, now, now]
		});
		await client.execute({
			sql: 'INSERT INTO "order" (id, customer_name, customer_phone, total_amount, status, employee_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			args: [order3Id, 'Carol Williams', '555-9012', 15.98, 'pending', users[0].id, now, now]
		});
		await client.execute({
			sql: 'INSERT INTO "order" (id, customer_name, customer_phone, total_amount, status, employee_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			args: [order4Id, 'David Brown', '555-3456', 3.99, 'preparing', users[0].id, now, now]
		});
		
		console.log('✓ Orders inserted');
		
		await client.execute({
			sql: 'INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?)',
			args: [nanoid(), order1Id, menuItems[2].id, 1, 3.49, now]
		});
		await client.execute({
			sql: 'INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?)',
			args: [nanoid(), order1Id, menuItems[3].id, 1, 3.99, now]
		});
		await client.execute({
			sql: 'INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?)',
			args: [nanoid(), order1Id, menuItems[4].id, 1, 4.99, now]
		});
		await client.execute({
			sql: 'INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?)',
			args: [nanoid(), order2Id, menuItems[8].id, 1, 8.99, now]
		});
		await client.execute({
			sql: 'INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?)',
			args: [nanoid(), order3Id, menuItems[1].id, 2, 4.99, now]
		});
		await client.execute({
			sql: 'INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?)',
			args: [nanoid(), order3Id, menuItems[5].id, 2, 2.99, now]
		});
		await client.execute({
			sql: 'INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?)',
			args: [nanoid(), order4Id, menuItems[6].id, 1, 3.99, now]
		});
		
		console.log('✓ Order items inserted');
		
		await client.close();
		
		console.log('\n✅ Database seeded successfully!');
		console.log('\nSample users created:');
		console.log('- Order Taker: john@bakery.com (password: password123)');
		console.log('- Kitchen: jane@bakery.com (password: password123)');
		console.log('- Delivery: mike@bakery.com (password: password123)');
		console.log('- Admin: admin@bakery.com (password: password123)');
		
	} catch (error) {
		console.error('❌ Error seeding database:', error);
		process.exit(1);
	}
}

seedDatabase();
