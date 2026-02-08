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
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	// Discount fields
	discountAmount: real('discount_amount'),
	discountType: text('discount_type', { enum: ['fixed', 'percentage'] }),
	discountValue: real('discount_value'),
	discountReason: text('discount_reason'),
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
	// Discount fields
	discountAmount: real('discount_amount'),
	discountType: text('discount_type', { enum: ['fixed', 'percentage'] }),
	discountValue: real('discount_value'),
	discountReason: text('discount_reason'),
	finalPrice: real('final_price'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// ==================== VARIATIONS & MODIFIERS SYSTEM ====================

// Variation groups - for mutually exclusive choices (e.g., "Protein Choice", "Cooking Preference")
export const variationGroup = sqliteTable('variation_group', {
	id: text('id').primaryKey(),
	menuItemId: text('menu_item_id').notNull().references(() => menuItem.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	displayOrder: integer('display_order').notNull().$default(() => 0),
	isRequired: integer('is_required', { mode: 'boolean' }).notNull().$default(() => true),
	minSelections: integer('min_selections').notNull().$default(() => 1),
	maxSelections: integer('max_selections').notNull().$default(() => 1),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Variations - individual options within a group (e.g., "Chicken", "Beef", "Rare", "Medium")
export const variation = sqliteTable('variation', {
	id: text('id').primaryKey(),
	groupId: text('group_id').notNull().references(() => variationGroup.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	priceAdjustment: real('price_adjustment').notNull().$default(() => 0),
	isDefault: integer('is_default', { mode: 'boolean' }).notNull().$default(() => false),
	displayOrder: integer('display_order').notNull().$default(() => 0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Modifier groups - reusable categories (e.g., "Extra Toppings", "Sauces")
export const modifierGroup = sqliteTable('modifier_group', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	displayOrder: integer('display_order').notNull().$default(() => 0),
	minSelections: integer('min_selections').notNull().$default(() => 0),
	maxSelections: integer('max_selections'), // null = unlimited
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Modifiers - individual add-ons (e.g., "Extra Wasabi", "Extra Cheese")
export const modifier = sqliteTable('modifier', {
	id: text('id').primaryKey(),
	groupId: text('group_id').notNull().references(() => modifierGroup.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	price: real('price').notNull(),
	isAvailable: integer('is_available', { mode: 'boolean' }).notNull().$default(() => true),
	displayOrder: integer('display_order').notNull().$default(() => 0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Junction table - links modifier groups to menu items with per-item configuration
export const menuItemModifierGroup = sqliteTable('menu_item_modifier_group', {
	id: text('id').primaryKey(),
	menuItemId: text('menu_item_id').notNull().references(() => menuItem.id, { onDelete: 'cascade' }),
	modifierGroupId: text('modifier_group_id').notNull().references(() => modifierGroup.id, { onDelete: 'cascade' }),
	isRequired: integer('is_required', { mode: 'boolean' }).notNull().$default(() => false),
	minSelections: integer('min_selections').notNull().$default(() => 0),
	maxSelections: integer('max_selections'), // null = unlimited
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Order item variations - stores which variation was selected per order
export const orderItemVariation = sqliteTable('order_item_variation', {
	id: text('id').primaryKey(),
	orderItemId: text('order_item_id').notNull().references(() => orderItem.id, { onDelete: 'cascade' }),
	variationGroupId: text('variation_group_id').notNull().references(() => variationGroup.id),
	variationId: text('variation_id').notNull().references(() => variation.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// Order item modifiers - stores which modifiers were added per order
export const orderItemModifier = sqliteTable('order_item_modifier', {
	id: text('id').primaryKey(),
	orderItemId: text('order_item_id').notNull().references(() => orderItem.id, { onDelete: 'cascade' }),
	modifierId: text('modifier_id').notNull().references(() => modifier.id),
	quantity: integer('quantity').notNull(),
	priceAtOrder: real('price_at_order').notNull(), // Snapshot of price when ordered
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date())
});

// ==================== TYPE EXPORTS ====================

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

// Variations & Modifiers types
export type VariationGroup = typeof variationGroup.$inferSelect;
export type Variation = typeof variation.$inferSelect;
export type ModifierGroup = typeof modifierGroup.$inferSelect;
export type Modifier = typeof modifier.$inferSelect;
export type MenuItemModifierGroup = typeof menuItemModifierGroup.$inferSelect;
export type OrderItemVariation = typeof orderItemVariation.$inferSelect;
export type OrderItemModifier = typeof orderItemModifier.$inferSelect;

export type InsertVariationGroup = typeof variationGroup.$inferInsert;
export type InsertVariation = typeof variation.$inferInsert;
export type InsertModifierGroup = typeof modifierGroup.$inferInsert;
export type InsertModifier = typeof modifier.$inferInsert;
export type InsertMenuItemModifierGroup = typeof menuItemModifierGroup.$inferInsert;
export type InsertOrderItemVariation = typeof orderItemVariation.$inferInsert;
export type InsertOrderItemModifier = typeof orderItemModifier.$inferInsert;
