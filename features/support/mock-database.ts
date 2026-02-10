/**
 * Mock Database for BDD Testing
 * 
 * Provides an in-memory database that mimics the Drizzle ORM interface
 * for fast, isolated BDD tests with parallel execution support.
 */

import { nanoid } from 'nanoid';

// ==================== TYPES ====================

export interface User {
	id: string;
	name: string;
	email: string;
	passwordHash: string;
	role: 'order_taker' | 'kitchen' | 'delivery' | 'admin';
	createdAt: Date;
	updatedAt: Date;
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

export interface Category {
	id: string;
	name: string;
	displayOrder: number;
	createdAt: Date;
}

export interface MenuItem {
	id: string;
	categoryId: string;
	name: string;
	description: string | null;
	price: number;
	isAvailable: boolean;
	createdAt: Date;
}

export interface Client {
	id: string;
	name: string;
	phone: string;
	address: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Order {
	id: string;
	customerName: string;
	customerPhone: string | null;
	totalAmount: number;
	status: 'pending' | 'preparing' | 'ready' | 'delivered';
	employeeId: string;
	deliveryDateTime: Date;
	address: string | null;
	comment: string | null;
	deletedAt: Date | null;
	discountAmount: number | null;
	discountType: 'fixed' | 'percentage' | null;
	discountValue: number | null;
	discountReason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface OrderItem {
	id: string;
	orderId: string;
	menuItemId: string;
	quantity: number;
	unitPrice: number;
	discountAmount: number | null;
	discountType: 'fixed' | 'percentage' | null;
	discountValue: number | null;
	discountReason: string | null;
	finalPrice: number | null;
	createdAt: Date;
}

export interface VariationGroup {
	id: string;
	menuItemId: string;
	name: string;
	displayOrder: number;
	isRequired: boolean;
	minSelections: number;
	maxSelections: number;
	createdAt: Date;
}

export interface Variation {
	id: string;
	groupId: string;
	name: string;
	priceAdjustment: number;
	isDefault: boolean;
	displayOrder: number;
	createdAt: Date;
}

export interface ModifierGroup {
	id: string;
	name: string;
	displayOrder: number;
	minSelections: number;
	maxSelections: number | null;
	createdAt: Date;
}

export interface Modifier {
	id: string;
	groupId: string;
	name: string;
	price: number;
	isAvailable: boolean;
	displayOrder: number;
	createdAt: Date;
}

export interface MenuItemModifierGroup {
	id: string;
	menuItemId: string;
	modifierGroupId: string;
	isRequired: boolean;
	minSelections: number;
	maxSelections: number | null;
	createdAt: Date;
}

export interface OrderItemVariation {
	id: string;
	orderItemId: string;
	variationGroupId: string;
	variationId: string;
	createdAt: Date;
}

export interface OrderItemModifier {
	id: string;
	orderItemId: string;
	modifierId: string;
	quantity: number;
	priceAtOrder: number;
	createdAt: Date;
}

// ==================== MOCK DATABASE CLASS ====================

export class MockDatabase {
	private users: Map<string, User> = new Map();
	private sessions: Map<string, Session> = new Map();
	private categories: Map<string, Category> = new Map();
	private menuItems: Map<string, MenuItem> = new Map();
	private clients: Map<string, Client> = new Map();
	private orders: Map<string, Order> = new Map();
	private orderItems: Map<string, OrderItem> = new Map();
	private variationGroups: Map<string, VariationGroup> = new Map();
	private variations: Map<string, Variation> = new Map();
	private modifierGroups: Map<string, ModifierGroup> = new Map();
	private modifiers: Map<string, Modifier> = new Map();
	private menuItemModifierGroups: Map<string, MenuItemModifierGroup> = new Map();
	private orderItemVariations: Map<string, OrderItemVariation> = new Map();
	private orderItemModifiers: Map<string, OrderItemModifier> = new Map();

	private workerId: string;

	constructor(workerId: string = '0') {
		this.workerId = workerId;
	}

	/**
	 * Generate a unique ID with worker prefix for parallel test isolation
	 */
	createId(): string {
		return `w${this.workerId}_${nanoid(12)}`;
	}

	/**
	 * Reset all data - call before each scenario
	 */
	reset(): void {
		this.users.clear();
		this.sessions.clear();
		this.categories.clear();
		this.menuItems.clear();
		this.clients.clear();
		this.orders.clear();
		this.orderItems.clear();
		this.variationGroups.clear();
		this.variations.clear();
		this.modifierGroups.clear();
		this.modifiers.clear();
		this.menuItemModifierGroups.clear();
		this.orderItemVariations.clear();
		this.orderItemModifiers.clear();
	}

	// ==================== USER OPERATIONS ====================

	createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
		const now = new Date();
		const user: User = {
			id: this.createId(),
			...data,
			createdAt: now,
			updatedAt: now
		};
		this.users.set(user.id, user);
		return user;
	}

	getUser(id: string): User | undefined {
		return this.users.get(id);
	}

	getUserByEmail(email: string): User | undefined {
		return Array.from(this.users.values()).find(u => u.email === email);
	}

	updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
		const user = this.users.get(id);
		if (!user) return undefined;
		const updated: User = {
			...user,
			...data,
			updatedAt: new Date()
		};
		this.users.set(id, updated);
		return updated;
	}

	deleteUser(id: string): boolean {
		return this.users.delete(id);
	}

	// ==================== SESSION OPERATIONS ====================

	createSession(data: Omit<Session, 'id'>): Session {
		const session: Session = {
			id: this.createId(),
			...data
		};
		this.sessions.set(session.id, session);
		return session;
	}

	getSession(id: string): Session | undefined {
		return this.sessions.get(id);
	}

	deleteSession(id: string): boolean {
		return this.sessions.delete(id);
	}

	deleteSessionsByUser(userId: string): void {
		for (const [id, session] of this.sessions) {
			if (session.userId === userId) {
				this.sessions.delete(id);
			}
		}
	}

	// ==================== CATEGORY OPERATIONS ====================

	createCategory(data: Omit<Category, 'id' | 'createdAt'>): Category {
		const category: Category = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.categories.set(category.id, category);
		return category;
	}

	getCategory(id: string): Category | undefined {
		return this.categories.get(id);
	}

	getAllCategories(): Category[] {
		return Array.from(this.categories.values()).sort((a, b) => a.displayOrder - b.displayOrder);
	}

	updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | undefined {
		const category = this.categories.get(id);
		if (!category) return undefined;
		const updated: Category = { ...category, ...data };
		this.categories.set(id, updated);
		return updated;
	}

	deleteCategory(id: string): boolean {
		return this.categories.delete(id);
	}

	// ==================== MENU ITEM OPERATIONS ====================

	createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt'>): MenuItem {
		const menuItem: MenuItem = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.menuItems.set(menuItem.id, menuItem);
		return menuItem;
	}

	getMenuItem(id: string): MenuItem | undefined {
		return this.menuItems.get(id);
	}

	getMenuItemByName(name: string): MenuItem | undefined {
		return Array.from(this.menuItems.values()).find(item => item.name === name);
	}

	getMenuItemsByCategory(categoryId: string): MenuItem[] {
		return Array.from(this.menuItems.values())
			.filter(item => item.categoryId === categoryId)
			.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
	}

	getAllMenuItems(): MenuItem[] {
		return Array.from(this.menuItems.values());
	}

	updateMenuItem(id: string, data: Partial<Omit<MenuItem, 'id' | 'createdAt'>>): MenuItem | undefined {
		const menuItem = this.menuItems.get(id);
		if (!menuItem) return undefined;
		const updated: MenuItem = { ...menuItem, ...data };
		this.menuItems.set(id, updated);
		return updated;
	}

	deleteMenuItem(id: string): boolean {
		return this.menuItems.delete(id);
	}

	// ==================== CLIENT OPERATIONS ====================

	createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
		const now = new Date();
		const client: Client = {
			id: this.createId(),
			...data,
			createdAt: now,
			updatedAt: now
		};
		this.clients.set(client.id, client);
		return client;
	}

	getClient(id: string): Client | undefined {
		return this.clients.get(id);
	}

	getClientByPhone(phone: string): Client | undefined {
		return Array.from(this.clients.values()).find(c => c.phone === phone);
	}

	getClientByName(name: string): Client | undefined {
		return Array.from(this.clients.values()).find(c => c.name === name);
	}

	getAllClients(): Client[] {
		return Array.from(this.clients.values());
	}

	updateClient(id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>): Client | undefined {
		const client = this.clients.get(id);
		if (!client) return undefined;
		const updated: Client = {
			...client,
			...data,
			updatedAt: new Date()
		};
		this.clients.set(id, updated);
		return updated;
	}

	deleteClient(id: string): boolean {
		return this.clients.delete(id);
	}

	// ==================== ORDER OPERATIONS ====================

	createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
		const now = new Date();
		const order: Order = {
			id: this.createId(),
			...data,
			createdAt: now,
			updatedAt: now
		};
		this.orders.set(order.id, order);
		return order;
	}

	getOrder(id: string): Order | undefined {
		return this.orders.get(id);
	}

	getOrdersByStatus(status: Order['status']): Order[] {
		return Array.from(this.orders.values())
			.filter(order => order.status === status && !order.deletedAt)
			.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
	}

	getAllOrders(): Order[] {
		return Array.from(this.orders.values())
			.filter(order => !order.deletedAt)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	updateOrder(id: string, data: Partial<Omit<Order, 'id' | 'createdAt'>>): Order | undefined {
		const order = this.orders.get(id);
		if (!order) return undefined;
		const updated: Order = {
			...order,
			...data,
			updatedAt: new Date()
		};
		this.orders.set(id, updated);
		return updated;
	}

	softDeleteOrder(id: string): Order | undefined {
		return this.updateOrder(id, { deletedAt: new Date() });
	}

	// ==================== ORDER ITEM OPERATIONS ====================

	createOrderItem(data: Omit<OrderItem, 'id' | 'createdAt'>): OrderItem {
		const orderItem: OrderItem = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.orderItems.set(orderItem.id, orderItem);
		return orderItem;
	}

	getOrderItem(id: string): OrderItem | undefined {
		return this.orderItems.get(id);
	}

	getOrderItemsByOrder(orderId: string): OrderItem[] {
		return Array.from(this.orderItems.values())
			.filter(item => item.orderId === orderId)
			.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
	}

	updateOrderItem(id: string, data: Partial<Omit<OrderItem, 'id' | 'createdAt'>>): OrderItem | undefined {
		const orderItem = this.orderItems.get(id);
		if (!orderItem) return undefined;
		const updated: OrderItem = { ...orderItem, ...data };
		this.orderItems.set(id, updated);
		return updated;
	}

	deleteOrderItem(id: string): boolean {
		return this.orderItems.delete(id);
	}

	deleteOrderItemsByOrder(orderId: string): void {
		for (const [id, item] of this.orderItems) {
			if (item.orderId === orderId) {
				this.orderItems.delete(id);
			}
		}
	}

	// ==================== VARIATION GROUP OPERATIONS ====================

	createVariationGroup(data: Omit<VariationGroup, 'id' | 'createdAt'>): VariationGroup {
		const group: VariationGroup = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.variationGroups.set(group.id, group);
		return group;
	}

	getVariationGroup(id: string): VariationGroup | undefined {
		return this.variationGroups.get(id);
	}

	getVariationGroupsByMenuItem(menuItemId: string): VariationGroup[] {
		return Array.from(this.variationGroups.values())
			.filter(group => group.menuItemId === menuItemId)
			.sort((a, b) => a.displayOrder - b.displayOrder);
	}

	// ==================== VARIATION OPERATIONS ====================

	createVariation(data: Omit<Variation, 'id' | 'createdAt'>): Variation {
		const variation: Variation = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.variations.set(variation.id, variation);
		return variation;
	}

	getVariation(id: string): Variation | undefined {
		return this.variations.get(id);
	}

	getVariationsByGroup(groupId: string): Variation[] {
		return Array.from(this.variations.values())
			.filter(v => v.groupId === groupId)
			.sort((a, b) => a.displayOrder - b.displayOrder);
	}

	// ==================== MODIFIER GROUP OPERATIONS ====================

	createModifierGroup(data: Omit<ModifierGroup, 'id' | 'createdAt'>): ModifierGroup {
		const group: ModifierGroup = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.modifierGroups.set(group.id, group);
		return group;
	}

	getModifierGroup(id: string): ModifierGroup | undefined {
		return this.modifierGroups.get(id);
	}

	getAllModifierGroups(): ModifierGroup[] {
		return Array.from(this.modifierGroups.values())
			.sort((a, b) => a.displayOrder - b.displayOrder);
	}

	// ==================== MODIFIER OPERATIONS ====================

	createModifier(data: Omit<Modifier, 'id' | 'createdAt'>): Modifier {
		const modifier: Modifier = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.modifiers.set(modifier.id, modifier);
		return modifier;
	}

	getModifier(id: string): Modifier | undefined {
		return this.modifiers.get(id);
	}

	getModifiersByGroup(groupId: string): Modifier[] {
		return Array.from(this.modifiers.values())
			.filter(m => m.groupId === groupId)
			.sort((a, b) => a.displayOrder - b.displayOrder);
	}

	// ==================== MENU ITEM MODIFIER GROUP OPERATIONS ====================

	createMenuItemModifierGroup(data: Omit<MenuItemModifierGroup, 'id' | 'createdAt'>): MenuItemModifierGroup {
		const mapping: MenuItemModifierGroup = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.menuItemModifierGroups.set(mapping.id, mapping);
		return mapping;
	}

	getMenuItemModifierGroups(menuItemId: string): MenuItemModifierGroup[] {
		return Array.from(this.menuItemModifierGroups.values())
			.filter(m => m.menuItemId === menuItemId);
	}

	// ==================== ORDER ITEM VARIATION OPERATIONS ====================

	createOrderItemVariation(data: Omit<OrderItemVariation, 'id' | 'createdAt'>): OrderItemVariation {
		const oiv: OrderItemVariation = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.orderItemVariations.set(oiv.id, oiv);
		return oiv;
	}

	getOrderItemVariations(orderItemId: string): OrderItemVariation[] {
		return Array.from(this.orderItemVariations.values())
			.filter(oiv => oiv.orderItemId === orderItemId);
	}

	// ==================== ORDER ITEM MODIFIER OPERATIONS ====================

	createOrderItemModifier(data: Omit<OrderItemModifier, 'id' | 'createdAt'>): OrderItemModifier {
		const oim: OrderItemModifier = {
			id: this.createId(),
			...data,
			createdAt: new Date()
		};
		this.orderItemModifiers.set(oim.id, oim);
		return oim;
	}

	getOrderItemModifiers(orderItemId: string): OrderItemModifier[] {
		return Array.from(this.orderItemModifiers.values())
			.filter(oim => oim.orderItemId === orderItemId);
	}

	// ==================== UTILITY METHODS ====================

	/**
	 * Get order with all related items, variations, and modifiers
	 */
	getOrderWithDetails(orderId: string): { 
		order: Order | undefined; 
		items: Array<{
			item: OrderItem;
			menuItem: MenuItem | undefined;
			variations: OrderItemVariation[];
			modifiers: OrderItemModifier[];
		}>;
	} {
		const order = this.getOrder(orderId);
		if (!order) {
			return { order: undefined, items: [] };
		}

		const orderItems = this.getOrderItemsByOrder(orderId);
		const items = orderItems.map(item => ({
			item,
			menuItem: this.getMenuItem(item.menuItemId),
			variations: this.getOrderItemVariations(item.id),
			modifiers: this.getOrderItemModifiers(item.id)
		}));

		return { order, items };
	}

	/**
	 * Calculate order total including items, variations, and modifiers
	 */
	calculateOrderTotal(orderId: string): number {
		const { items } = this.getOrderWithDetails(orderId);
		
		let total = 0;
		for (const { item } of items) {
			let itemTotal = item.unitPrice * item.quantity;
			
			// Add variation price adjustments
			const variations = this.getOrderItemVariations(item.id);
			for (const oiv of variations) {
				const variation = this.getVariation(oiv.variationId);
				if (variation) {
					itemTotal += variation.priceAdjustment * item.quantity;
				}
			}
			
			// Add modifier prices
			const modifiers = this.getOrderItemModifiers(item.id);
			for (const oim of modifiers) {
				itemTotal += oim.priceAtOrder * oim.quantity;
			}
			
			// Apply item discount if any
			if (item.discountAmount) {
				itemTotal -= item.discountAmount;
			}
			
			total += itemTotal;
		}
		
		return total;
	}
}

// Export singleton instance
export const mockDb = new MockDatabase();
