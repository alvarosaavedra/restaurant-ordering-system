import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

// Users table - enhanced for restaurant staff
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	role: text('role', { enum: ['order_taker', 'kitchen', 'delivery', 'admin'] }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Session table for authentication
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Menu categories (e.g., Bakery Items, Beverages, Sandwiches)
export const category = sqliteTable('category', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	displayOrder: integer('display_order').notNull().$default(() => 0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Menu items
export const menuItem = sqliteTable('menu_item', {
	id: text('id').primaryKey(),
	categoryId: text('category_id').notNull().references(() => category.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	price: real('price').notNull(),
	isAvailable: integer('is_available', { mode: 'boolean' }).notNull().$default(() => true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Clients (customers)
export const client = sqliteTable('client', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	phone: text('phone').notNull().unique(),
	address: text('address'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Orders
export const order = sqliteTable('order', {
	id: text('id').primaryKey(),
	customerName: text('customer_name').notNull(),
	customerPhone: text('customer_phone'),
	totalAmount: real('total_amount').notNull(),
	status: text('status', { enum: ['pending', 'preparing', 'ready', 'delivered'] }).notNull().$default(() => 'pending'),
	employeeId: text('employee_id').notNull().references(() => user.id),
	deliveryDateTime: integer('delivery_date_time', { mode: 'timestamp' }).notNull(),
	address: text('address'),
	comment: text('comment'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Order items (line items)
export const orderItem = sqliteTable('order_item', {
	id: text('id').primaryKey(),
	orderId: text('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
	menuItemId: text('menu_item_id').notNull().references(() => menuItem.id),
	quantity: integer('quantity').notNull(),
	unitPrice: real('unit_price').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Category = typeof category.$inferSelect;
export type MenuItem = typeof menuItem.$inferSelect;
export type Client = typeof client.$inferSelect;
export type Order = typeof order.$inferSelect;
export type OrderItem = typeof orderItem.$inferSelect;

export type InsertUser = typeof user.$inferInsert;
export type InsertCategory = typeof category.$inferInsert;
export type InsertMenuItem = typeof menuItem.$inferInsert;
export type InsertClient = typeof client.$inferInsert;
export type InsertOrder = typeof order.$inferInsert;
export type InsertOrderItem = typeof orderItem.$inferInsert;
