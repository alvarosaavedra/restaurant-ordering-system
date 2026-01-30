// Mock User data
export const mockUser = {
	id: 'user-1',
	name: 'John Doe',
	email: 'john@example.com',
	role: 'order_taker',
	createdAt: new Date('2024-01-01T00:00:00Z')
};

export const mockKitchenUser = {
	id: 'user-2',
	name: 'Jane Smith',
	email: 'jane@example.com',
	role: 'kitchen',
	createdAt: new Date('2024-01-01T00:00:00Z')
};

export const mockDeliveryUser = {
	id: 'user-3',
	name: 'Mike Johnson',
	email: 'mike@example.com',
	role: 'delivery',
	createdAt: new Date('2024-01-01T00:00:00Z')
};

export const mockAdminUser = {
	id: 'user-4',
	name: 'Admin User',
	email: 'admin@example.com',
	role: 'admin',
	createdAt: new Date('2024-01-01T00:00:00Z')
};

// Mock Category data
export const mockCategory = {
	id: 'cat-1',
	name: 'Breads',
	displayOrder: 1,
	createdAt: new Date('2024-01-01T00:00:00Z')
};

export const mockCategory2 = {
	id: 'cat-2',
	name: 'Pastries',
	displayOrder: 2,
	createdAt: new Date('2024-01-01T00:00:00Z')
};

// Mock Menu Item data
export const mockMenuItemWithCategory = {
	id: 'item-1',
	categoryId: 'cat-1',
	name: 'Sourdough Bread',
	description: 'Freshly baked artisan sourdough',
	price: 5.99,
	isAvailable: true,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	category: mockCategory
};

export const mockMenuItem = {
	id: 'item-1',
	categoryId: 'cat-1',
	name: 'Sourdough Bread',
	description: 'Freshly baked artisan sourdough',
	price: 5.99,
	isAvailable: true,
	createdAt: new Date('2024-01-01T00:00:00Z')
};

export const mockMenuItem2WithCategory = {
	id: 'item-2',
	categoryId: 'cat-2',
	name: 'Croissant',
	description: 'Buttery, flaky French pastry',
	price: 3.99,
	isAvailable: true,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	category: mockCategory2
};

export const mockMenuItem2 = {
	id: 'item-2',
	categoryId: 'cat-2',
	name: 'Croissant',
	description: 'Buttery, flaky French pastry',
	price: 3.99,
	isAvailable: true,
	createdAt: new Date('2024-01-01T00:00:00Z')
};

export const mockUnavailableMenuItemWithCategory = {
	id: 'item-3',
	categoryId: 'cat-1',
	name: 'Baguette',
	description: 'Traditional French bread',
	price: 4.99,
	isAvailable: false,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	category: mockCategory
};

export const mockUnavailableMenuItem = {
	id: 'item-3',
	categoryId: 'cat-1',
	name: 'Baguette',
	description: 'Traditional French bread',
	price: 4.99,
	isAvailable: false,
	createdAt: new Date('2024-01-01T00:00:00Z')
};

// Mock Client data
export const mockClient = {
	id: 'client-1',
	name: 'Alice Williams',
	phone: '555-1234',
	address: '123 Main St, City, ST 12345',
	createdAt: new Date('2024-01-01T00:00:00Z')
};

export const mockClient2 = {
	id: 'client-2',
	name: 'Bob Brown',
	phone: '555-5678',
	address: '456 Oak Ave, Town, ST 67890',
	createdAt: new Date('2024-01-02T00:00:00Z')
};

// Mock Order Item data
export const mockOrderItem = {
	id: 'order-item-1',
	orderId: 'order-1',
	menuItemId: 'item-1',
	quantity: 2,
	unitPrice: 5.99,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	menuItem: mockMenuItem
};

export const mockOrderItem2 = {
	id: 'order-item-2',
	orderId: 'order-1',
	menuItemId: 'item-2',
	quantity: 1,
	unitPrice: 3.99,
	createdAt: new Date('2024-01-01T00:00:00Z'),
	menuItem: mockMenuItem2
};

// Mock Order data
export const mockOrder = {
	id: 'order-1',
	customerName: 'Alice Williams',
	customerPhone: '555-1234',
	totalAmount: 15.97,
	status: 'pending' as const,
	deliveryDateTime: new Date('2024-01-02T14:00:00Z'),
	address: '123 Main St, City, ST 12345',
	comment: 'Please ring doorbell twice',
	employeeId: 'user-1',
	createdAt: new Date('2024-01-01T10:30:00Z'),
	updatedAt: new Date('2024-01-01T10:30:00Z'),
	items: [mockOrderItem, mockOrderItem2],
	employee: mockUser
};

export const mockOrderPreparing = {
	...mockOrder,
	id: 'order-2',
	status: 'preparing' as const,
	customerName: 'Bob Brown',
	customerPhone: '555-5678'
};

export const mockOrderReady = {
	...mockOrder,
	id: 'order-3',
	status: 'ready' as const,
	customerName: 'Charlie Davis',
	customerPhone: '555-9012'
};

export const mockOrderDelivered = {
	...mockOrder,
	id: 'order-4',
	status: 'delivered' as const,
	customerName: 'Diana Evans',
	customerPhone: '555-3456'
};

export const mockOrderNoDeliveryInfo = {
	...mockOrder,
	id: 'order-5',
	deliveryDateTime: null,
	address: null,
	comment: null
};

// Mock Order for cart (simplified structure)
export const mockCartItem = {
	...mockMenuItem,
	quantity: 2,
	total: 11.98
};

// Mock API responses
export const mockSuccessResponse = (data: unknown) => ({
	ok: true,
	json: async () => data,
	status: 200,
	statusText: 'OK'
});

export const mockErrorResponse = (message: string, status = 400) => ({
	ok: false,
	json: async () => ({ error: message }),
	status,
	statusText: 'Bad Request'
});

// Helper functions
export function createMockOrder(overrides?: Partial<typeof mockOrder>) {
	return {
		...mockOrder,
		...overrides
	};
}

export function createMockOrderItems(count: number) {
	return Array.from({ length: count }, (_, i) => ({
		id: `order-item-${i}`,
		orderId: 'order-1',
		menuItemId: `item-${i}`,
		quantity: 1,
		unitPrice: 5.99 + i,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		menuItem: {
			id: `item-${i}`,
			categoryId: 'cat-1',
			name: `Item ${i}`,
			price: 5.99 + i
		}
	}));
}

export function createMockCategories(count: number) {
	return Array.from({ length: count }, (_, i) => ({
		id: `cat-${i}`,
		name: `Category ${i}`,
		displayOrder: i,
		createdAt: new Date('2024-01-01T00:00:00Z')
	}));
}

export function createMockMenuItems(categoryId: string, count: number) {
	return Array.from({ length: count }, (_, i) => ({
		id: `item-${i}`,
		categoryId,
		name: `Menu Item ${i}`,
		description: `Description for item ${i}`,
		price: 5.99 + i,
		isAvailable: true,
		createdAt: new Date('2024-01-01T00:00:00Z')
	}));
}

export function createMockClients(count: number) {
	return Array.from({ length: count }, (_, i) => ({
		id: `client-${i}`,
		name: `Client ${i}`,
		phone: `555-${1000 + i}`,
		address: `${i * 100 + 1} Test St, City, ST 12345`,
		createdAt: new Date('2024-01-01T00:00:00Z')
	}));
}

export function createMockOrders(count: number, status?: 'pending' | 'preparing' | 'ready' | 'delivered') {
	return Array.from({ length: count }, (_, i) => ({
		...mockOrder,
		id: `order-${i}`,
		customerName: `Customer ${i}`,
		customerPhone: `555-${2000 + i}`,
		status: status || ['pending', 'preparing', 'ready', 'delivered'][i % 4] as any,
		createdAt: new Date(Date.now() - i * 3600000)
	}));
}

// Dashboard statistics
export const mockDashboardStats = {
	totalOrders: 100,
	pendingOrders: 15,
	preparingOrders: 8,
	readyOrders: 12,
	deliveredOrders: 65
};

// Mock MenuItem with order count (for MenuItemCard)
export const mockMenuItemCard = {
	...mockMenuItemWithCategory,
	orderCount: 5
};

// Mock Client with order count
export const mockClientWithOrderCount = {
	...mockClient,
	orderCount: 5
};

export const mockClient2WithOrderCount = {
	...mockClient2,
	orderCount: 3
};

export const mockClient3 = {
	id: 'client-3',
	name: 'Charlie Davis',
	phone: '555-9012',
	address: '789 Pine Rd, Village, IL 90789',
	createdAt: new Date('2024-01-03T00:00:00Z'),
	orderCount: 0
};

export const mockClient3WithOrderCount = {
	...mockClient3,
	orderCount: 0
};

export const mockClientWithSingleOrder = {
	...mockClient,
	orderCount: 1
};

// Mock Category with item count
export const mockCategoryWithCount = {
	...mockCategory,
	itemCount: 12
};

export const mockCategory2WithCount = {
	...mockCategory2,
	itemCount: 0
};
