import type {
	MenuItem,
	Category,
	Order,
	OrderItem,
	VariationGroup,
	Variation,
	ModifierGroup,
	Modifier,
	MenuItemModifierGroup,
	OrderItemVariation,
	OrderItemModifier
} from '$lib/server/db/schema';

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
		variations?: {
			groupId: string;
			variationId: string;
		}[];
		modifiers?: {
			modifierId: string;
			quantity: number;
		}[];
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

// ==================== VARIATIONS & MODIFIERS TYPES ====================

// Extended variation types
export type VariationGroupWithVariations = VariationGroup & {
	variations: Variation[];
};

export type VariationWithGroup = Variation & {
	group: VariationGroup;
};

// Extended modifier types
export type ModifierGroupWithModifiers = ModifierGroup & {
	modifiers: Modifier[];
};

export type ModifierWithGroup = Modifier & {
	group: ModifierGroup;
};

// Menu item with variations and modifiers
export type MenuItemWithVariations = MenuItemWithCategory & {
	variationGroups: VariationGroupWithVariations[];
};

export type MenuItemWithModifiers = MenuItemWithCategory & {
	modifierGroups: (MenuItemModifierGroup & {
		modifierGroup: ModifierGroupWithModifiers;
	})[];
};

export type MenuItemFull = MenuItemWithVariations & MenuItemWithModifiers;

// Cart item with customizations
export type CartItemCustomization = {
	variations: {
		groupId: string;
		variationId: string;
		groupName: string;
		variationName: string;
		priceAdjustment: number;
	}[];
	modifiers: {
		modifierId: string;
		modifierName: string;
		quantity: number;
		price: number;
	}[];
};

export type CartItemWithCustomization = CartItem & {
	customization: CartItemCustomization;
	adjustedPrice: number; // Base price + variation adjustments + modifiers
};

// Order item with full customization details
export type OrderItemWithCustomization = OrderItem & {
	menuItem: MenuItem;
	variations: (OrderItemVariation & {
		variationGroup: VariationGroup;
		variation: Variation;
	})[];
	modifiers: (OrderItemModifier & {
		modifier: Modifier;
	})[];
};

// Form types for admin
export type VariationGroupForm = {
	name: string;
	isRequired?: boolean;
	minSelections?: number;
	maxSelections?: number;
	displayOrder?: number;
};

export type VariationForm = {
	name: string;
	priceAdjustment?: number;
	isDefault?: boolean;
	displayOrder?: number;
};

export type ModifierGroupForm = {
	name: string;
	minSelections?: number;
	maxSelections?: number;
	displayOrder?: number;
};

export type ModifierForm = {
	name: string;
	price: number;
	isAvailable?: boolean;
	displayOrder?: number;
};

export type MenuItemModifierAssignment = {
	modifierGroupId: string;
	isRequired?: boolean;
	minSelections?: number;
	maxSelections?: number;
};