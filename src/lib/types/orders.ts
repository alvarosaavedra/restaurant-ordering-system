import type { User, MenuItem, Category, Order, OrderItem } from '$lib/server/db/schema';

// User roles
export type UserRole = User['role'];

// Order status
export type OrderStatus = Order['status'];

// Extended types for frontend use
export type MenuItemWithCategory = MenuItem & {
	category: Category;
};

export type OrderWithItems = Order & {
	employee?: {
		name: string;
		email: string;
	};
	items: (OrderItem & {
		menuItem: MenuItem;
	})[];
};

export type OrderWithEmployee = Order & {
	employee: {
		name: string;
		email: string;
	};
};

// Form types
export type CreateOrderForm = {
	customerName: string;
	customerPhone?: string;
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