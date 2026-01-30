import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import type { User, Category, MenuItem, Order } from '../src/lib/server/db/schema';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConnections = new Map<number, ReturnType<typeof drizzle<typeof schema>>>();
let testCategories: Category[] | null = null;
let currentWorkerIndex: number = 0;

export function setCurrentWorkerIndex(workerIndex: number) {
	currentWorkerIndex = workerIndex;
}

export function getTestDb(workerIndex?: number) {
	const index = workerIndex ?? currentWorkerIndex;
	if (!dbConnections.has(index)) {
		// Use the same database path as playwright.config.ts and global-setup.ts
		const dbPath = path.join(__dirname, '..', 'test.db');
		const db = drizzle(createClient({ url: 'file:' + dbPath }), { schema });
		dbConnections.set(index, db);
	}
	return dbConnections.get(index)!;
}

export async function createTestUser(data: {
	name: string;
	email: string;
	passwordHash: string;
	role: 'order_taker' | 'kitchen' | 'delivery' | 'admin';
}): Promise<User> {
	const db = getTestDb();
	const id = nanoid();
	const now = new Date();

	const user: User = {
		id,
		name: data.name,
		email: data.email,
		passwordHash: data.passwordHash,
		role: data.role,
		createdAt: now,
		updatedAt: now
	};

	await db.insert(schema.user).values(user);
	return user;
}

export async function createTestUsers() {
	const users = await Promise.all([
		createTestUser({ name: 'John Doe', email: 'john@bakery.com', passwordHash: 'password123', role: 'order_taker' }),
		createTestUser({ name: 'Jane Smith', email: 'jane@bakery.com', passwordHash: 'password123', role: 'kitchen' }),
		createTestUser({ name: 'Mike Johnson', email: 'mike@bakery.com', passwordHash: 'password123', role: 'delivery' }),
		createTestUser({ name: 'Admin User', email: 'admin@bakery.com', passwordHash: 'password123', role: 'admin' })
	]);

	return users;
}

export async function createTestCategory(data: { name: string; displayOrder: number }): Promise<Category> {
	const db = 	getTestDb();
	const id = nanoid();

	const category: Category = {
		id,
		name: data.name,
		displayOrder: data.displayOrder,
		createdAt: new Date()
	};

	await db.insert(schema.category).values(category);
	return category;
}

export async function createTestCategories() {
	testCategories = await Promise.all([
		createTestCategory({ name: 'Bakery Items', displayOrder: 1 }),
		createTestCategory({ name: 'Beverages', displayOrder: 2 }),
		createTestCategory({ name: 'Sandwiches', displayOrder: 3 }),
		createTestCategory({ name: 'Pastries', displayOrder: 4 })
	]);

	return testCategories;
}

export async function createTestMenuItem(data: {
	categoryId: string;
	name: string;
	description: string;
	price: number;
	isAvailable: boolean;
}): Promise<MenuItem> {
	const db = 	getTestDb();
	const id = nanoid();

	const menuItem: MenuItem = {
		id,
		categoryId: data.categoryId,
		name: data.name,
		description: data.description,
		price: data.price,
		isAvailable: data.isAvailable,
		createdAt: new Date()
	};

	await db.insert(schema.menuItem).values(menuItem);
	return menuItem;
}

export async function createTestMenuItems(categories?: Category[]) {
	const cats = categories || testCategories;
	if (!cats) {
		throw new Error('No categories provided. Call createTestCategories() first or pass categories as argument.');
	}

	const menuItems = await Promise.all([
		createTestMenuItem({
			categoryId: cats![0].id,
			name: 'Fresh Bread',
			description: 'Artisan sourdough bread baked daily',
			price: 4.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![0].id,
			name: 'Croissant',
			description: 'Buttery French croissant',
			price: 3.49,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![0].id,
			name: 'Baguette',
			description: 'Classic French baguette',
			price: 3.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![1].id,
			name: 'Coffee',
			description: 'Freshly brewed coffee',
			price: 2.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![1].id,
			name: 'Tea',
			description: 'Selection of hot teas',
			price: 2.49,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![1].id,
			name: 'Orange Juice',
			description: 'Fresh squeezed orange juice',
			price: 3.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![2].id,
			name: 'Turkey Club',
			description: 'Turkey, bacon, lettuce, tomato on sourdough',
			price: 8.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![2].id,
			name: 'BLT',
			description: 'Bacon, lettuce, tomato on toast',
			price: 7.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![2].id,
			name: 'Grilled Cheese',
			description: 'Classic grilled cheese sandwich',
			price: 6.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![3].id,
			name: 'Chocolate Cake',
			description: 'Rich chocolate cake with frosting',
			price: 5.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![3].id,
			name: 'Apple Pie',
			description: 'Traditional apple pie with cinnamon',
			price: 4.99,
			isAvailable: true
		}),
		createTestMenuItem({
			categoryId: cats![3].id,
			name: 'Cookies',
			description: 'Assorted fresh baked cookies',
			price: 2.99,
			isAvailable: true
		})
	]);

	return menuItems;
}

export async function createTestOrder(data: {
	customerName: string;
	customerPhone: string;
	totalAmount: number;
	status: 'pending' | 'preparing' | 'ready' | 'delivered';
	employeeId: string;
	deliveryDateTime?: Date;
	address?: string;
	comment?: string;
}): Promise<Order> {
	const db = 	getTestDb();
	const id = nanoid();
	const now = new Date();

	const order: Order = {
		id,
		customerName: data.customerName,
		customerPhone: data.customerPhone,
		totalAmount: data.totalAmount,
		status: data.status,
		employeeId: data.employeeId,
		deliveryDateTime: data.deliveryDateTime || new Date(now.getTime() + 60 * 60 * 1000),
		address: data.address || '123 Main St',
		comment: data.comment || '',
		createdAt: new Date(now.getTime() - 10 * 60 * 1000),
		updatedAt: new Date(now.getTime() - 10 * 60 * 1000)
	};

	await db.insert(schema.order).values(order);
	return order;
}

export async function createTestOrderItems(orderId: string, items: Array<{ menuItemId: string; quantity: number; unitPrice: number }>) {
	const db = 	getTestDb();
	const now = new Date();

	const orderItems = items.map((item) => ({
		id: nanoid(),
		orderId,
		menuItemId: item.menuItemId,
		quantity: item.quantity,
		unitPrice: item.unitPrice,
		createdAt: now
	}));

	await db.insert(schema.orderItem).values(orderItems);
	return orderItems;
}

export async function createTestOrderWithItems(
	data: {
		customerName: string;
		customerPhone: string;
		totalAmount: number;
		status: 'pending' | 'preparing' | 'ready' | 'delivered';
		employeeId: string;
		deliveryDateTime?: Date;
		address?: string;
		comment?: string;
	},
	items: Array<{ menuItemId: string; quantity: number; unitPrice: number }>
) {
	const order = await createTestOrder(data);
	const orderItems = await createTestOrderItems(order.id, items);
	return { order, orderItems };
}

export async function cleanupAllTestData(workerIndex: number = 0) {
	const db = getTestDb(workerIndex);

	await db.delete(schema.orderItem);
	await db.delete(schema.order);
	await db.delete(schema.client);
	await db.delete(schema.menuItem);
	await db.delete(schema.category);
	await db.delete(schema.user);
	await db.delete(schema.session);
}

export async function deleteTestUser(userId: string, workerIndex: number = 0) {
	const db = getTestDb(workerIndex);
	await db.delete(schema.user).where(eq(schema.user.id, userId));
}

export async function deleteTestCategory(categoryId: string, workerIndex: number = 0) {
	const db = getTestDb(workerIndex);
	await db.delete(schema.category).where(eq(schema.category.id, categoryId));
}

export async function deleteTestMenuItem(menuItemId: string, workerIndex: number = 0) {
	const db = getTestDb(workerIndex);
	await db.delete(schema.menuItem).where(eq(schema.menuItem.id, menuItemId));
}

export async function deleteTestOrder(orderId: string, workerIndex: number = 0) {
	const db = getTestDb(workerIndex);
	await db.delete(schema.orderItem).where(eq(schema.orderItem.orderId, orderId));
	await db.delete(schema.order).where(eq(schema.order.id, orderId));
}
