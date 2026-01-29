import type { MenuItem, Category, Order, OrderItem } from '$lib/server/db/schema';

// User roles
export type UserRole = 'order_taker' | 'kitchen' | 'delivery' | 'admin';

// Order status
export type OrderStatus = Order['status'];

// Extended types for frontend use
export type MenuItemWithCategory = MenuItem & {
	category: Category | null;
};

export type OrderWithItems = Order & {
	deletedAt?: Date | null;
	employee?: {
		name: string;
		email: string;
	};
	items: (OrderItem & {
		menuItem: MenuItem;
	})[];
};

export type OrderWithEmployee = Order & {
	deletedAt?: Date | null;
	employee: {
		name: string;
		email: string;
	};
};

// Form types
export type CreateOrderForm = {
	customerName: string;
	customerPhone?: string;
	deliveryDateTime: string;
	address?: string;
	comment?: string;
	items: {
		menuItemId: string;
		quantity: number;
	}[];
};

export type LoginForm = {
	email: string;
	password: string;
};

// UI state types
export type OrderFilter = {
	status?: OrderStatus;
	dateFrom?: Date;
	dateTo?: Date;
	customerName?: string;
};

export type CartItem = {
	menuItem: MenuItem;
	quantity: number;
};

export type Cart = {
	items: CartItem[];
	totalAmount: number;
};

// Props for MenuItem component
export interface MenuItemProps {
	item: MenuItemWithCategory;
	onAdd: (item: MenuItemWithCategory, quantity: number) => void;
}

// Admin form types
export type MenuItemForm = {
	name: string;
	description?: string;
	price: number;
	categoryId: string;
	isAvailable?: boolean;
};

export type CategoryForm = {
	name: string;
	displayOrder?: number;
};

export type ClientForm = {
	name: string;
	phone: string;
	address?: string;
};

export type AdminTab = 'menu-items' | 'categories' | 'clients';

// Extended types for admin
export type CategoryWithCount = Category & {
	itemCount: number;
};