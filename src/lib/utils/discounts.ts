/**
 * Calculate discount amount based on type and value
 * @param basePrice - The original price
 * @param discountType - 'fixed' or 'percentage'
 * @param discountValue - The discount value ($ or %)
 * @returns The discount amount
 */
export function calculateDiscountAmount(
	basePrice: number,
	discountType: 'fixed' | 'percentage',
	discountValue: number
): number {
	if (discountType === 'fixed') {
		return Math.min(discountValue, basePrice);
	} else {
		return Math.min((basePrice * discountValue) / 100, basePrice);
	}
}

/**
 * Calculate final price after discount
 * @param basePrice - The original price
 * @param discountType - 'fixed' or 'percentage'
 * @param discountValue - The discount value ($ or %)
 * @returns The final price after discount
 */
export function calculateFinalPrice(
	basePrice: number,
	discountType: 'fixed' | 'percentage',
	discountValue: number
): number {
	const discountAmount = calculateDiscountAmount(basePrice, discountType, discountValue);
	return Math.max(0, roundToTwoDecimals(basePrice - discountAmount));
}

/**
 * Validate discount parameters
 * @param basePrice - The original price
 * @param discountType - 'fixed' or 'percentage'
 * @param discountValue - The discount value ($ or %)
 * @param maxDiscountPercentage - Maximum allowed discount percentage (default: 50)
 * @returns Validation result with valid flag and optional error message
 */
export function validateDiscount(
	basePrice: number,
	discountType: 'fixed' | 'percentage',
	discountValue: number,
	maxDiscountPercentage: number = 50
): { valid: boolean; error?: string } {
	// Check for negative values
	if (discountValue < 0) {
		return { valid: false, error: 'Discount cannot be negative' };
	}

	// Check for zero discount
	if (discountValue === 0) {
		return { valid: false, error: 'Discount must be greater than 0' };
	}

	if (discountType === 'fixed') {
		// Fixed discount cannot exceed base price
		if (discountValue > basePrice) {
			return { valid: false, error: 'Discount cannot exceed the item price' };
		}
	} else {
		// Percentage cannot exceed 100%
		if (discountValue > 100) {
			return { valid: false, error: 'Percentage discount cannot exceed 100%' };
		}
		// Check max discount limit
		if (discountValue > maxDiscountPercentage) {
			return { valid: false, error: `Discount cannot exceed ${maxDiscountPercentage}%` };
		}
	}

	return { valid: true };
}

/**
 * Interface for cart items with optional discounts
 */
export interface CartItem {
	item: {
		id: string;
		name: string;
		price: number;
		category: {
			id: string;
			name: string;
			displayOrder: number;
			createdAt: Date;
		} | null;
	};
	quantity: number;
	discount?: {
		type: 'fixed' | 'percentage';
		value: number;
		reason?: string;
	};
}

/**
 * Interface for order-level discount
 */
export interface OrderDiscount {
	type: 'fixed' | 'percentage';
	value: number;
	reason?: string;
}

/**
 * Calculate cart totals including all discounts
 * @param cart - Array of cart items
 * @param orderDiscount - Optional order-level discount
 * @returns Object with subtotal, discounts, and final total
 */
export function calculateCartTotals(
	cart: CartItem[],
	orderDiscount?: OrderDiscount
): {
	subtotal: number;
	itemDiscounts: number;
	orderDiscount: number;
	totalDiscount: number;
	finalTotal: number;
} {
	// Calculate subtotal (before any discounts)
	const subtotal = cart.reduce((total, cartItem) => {
		return total + (cartItem.item.price * cartItem.quantity);
	}, 0);

	// Calculate item-level discounts
	let itemDiscountsTotal = 0;
	let discountedSubtotal = 0;

	for (const cartItem of cart) {
		const itemSubtotal = cartItem.item.price * cartItem.quantity;

		if (cartItem.discount) {
			const itemDiscount = calculateDiscountAmount(
				itemSubtotal,
				cartItem.discount.type,
				cartItem.discount.value
			);
			itemDiscountsTotal += itemDiscount;
			discountedSubtotal += itemSubtotal - itemDiscount;
		} else {
			discountedSubtotal += itemSubtotal;
		}
	}

	// Calculate order-level discount (applied to discounted subtotal)
	let orderDiscountAmount = 0;
	if (orderDiscount && discountedSubtotal > 0) {
		orderDiscountAmount = calculateDiscountAmount(
			discountedSubtotal,
			orderDiscount.type,
			orderDiscount.value
		);
	}

	// Calculate totals
	const totalDiscount = itemDiscountsTotal + orderDiscountAmount;
	const finalTotal = Math.max(0, roundToTwoDecimals(discountedSubtotal - orderDiscountAmount));

	return {
		subtotal: roundToTwoDecimals(subtotal),
		itemDiscounts: roundToTwoDecimals(itemDiscountsTotal),
		orderDiscount: roundToTwoDecimals(orderDiscountAmount),
		totalDiscount: roundToTwoDecimals(totalDiscount),
		finalTotal
	};
}

/**
 * Round number to 2 decimal places
 * @param value - Number to round
 * @returns Rounded number
 */
function roundToTwoDecimals(value: number): number {
	return Math.round(value * 100) / 100;
}
