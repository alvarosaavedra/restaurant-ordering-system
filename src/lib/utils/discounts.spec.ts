import { describe, it, expect } from 'vitest';
import {
	calculateDiscountAmount,
	calculateFinalPrice,
	validateDiscount,
	calculateCartTotals
} from './discounts';

describe('Discount Calculations', () => {
	describe('calculateDiscountAmount', () => {
		it('should calculate fixed amount discount correctly', () => {
			expect(calculateDiscountAmount(100, 'fixed', 10)).toBe(10);
			expect(calculateDiscountAmount(50, 'fixed', 5)).toBe(5);
			expect(calculateDiscountAmount(200, 'fixed', 25.50)).toBe(25.50);
		});

		it('should calculate percentage discount correctly', () => {
			expect(calculateDiscountAmount(100, 'percentage', 10)).toBe(10);
			expect(calculateDiscountAmount(100, 'percentage', 25)).toBe(25);
			expect(calculateDiscountAmount(200, 'percentage', 15)).toBe(30);
		});

		it('should handle 0% discount', () => {
			expect(calculateDiscountAmount(100, 'percentage', 0)).toBe(0);
		});

		it('should handle 0 fixed discount', () => {
			expect(calculateDiscountAmount(100, 'fixed', 0)).toBe(0);
		});

		it('should handle 100% discount (free item)', () => {
			expect(calculateDiscountAmount(100, 'percentage', 100)).toBe(100);
		});

		it('should round to 2 decimal places', () => {
			expect(calculateDiscountAmount(99.99, 'percentage', 33.33)).toBeCloseTo(33.33, 2);
			expect(calculateDiscountAmount(100, 'percentage', 33.333)).toBeCloseTo(33.33, 2);
		});
	});

	describe('calculateFinalPrice', () => {
		it('should calculate final price with fixed discount', () => {
			expect(calculateFinalPrice(100, 'fixed', 10)).toBe(90);
			expect(calculateFinalPrice(50, 'fixed', 5)).toBe(45);
		});

		it('should calculate final price with percentage discount', () => {
			expect(calculateFinalPrice(100, 'percentage', 10)).toBe(90);
			expect(calculateFinalPrice(100, 'percentage', 25)).toBe(75);
			expect(calculateFinalPrice(200, 'percentage', 15)).toBe(170);
		});

		it('should return 0 when discount equals or exceeds price (100% off)', () => {
			expect(calculateFinalPrice(100, 'fixed', 100)).toBe(0);
			expect(calculateFinalPrice(100, 'percentage', 100)).toBe(0);
		});

		it('should round to 2 decimal places', () => {
			expect(calculateFinalPrice(99.99, 'percentage', 33.33)).toBeCloseTo(66.66, 2);
		});
	});

	describe('validateDiscount', () => {
		it('should validate valid fixed discounts', () => {
			expect(validateDiscount(100, 'fixed', 10).valid).toBe(true);
			expect(validateDiscount(100, 'fixed', 0.01).valid).toBe(true);
			expect(validateDiscount(100, 'fixed', 50).valid).toBe(true);
		});

		it('should validate valid percentage discounts', () => {
			expect(validateDiscount(100, 'percentage', 10).valid).toBe(true);
			expect(validateDiscount(100, 'percentage', 1).valid).toBe(true);
			expect(validateDiscount(100, 'percentage', 50).valid).toBe(true);
		});

		it('should reject negative discount values', () => {
			expect(validateDiscount(100, 'fixed', -10).valid).toBe(false);
			expect(validateDiscount(100, 'percentage', -5).valid).toBe(false);
			expect(validateDiscount(100, 'fixed', -0.01).valid).toBe(false);
		});

		it('should reject zero discount values', () => {
			expect(validateDiscount(100, 'fixed', 0).valid).toBe(false);
			expect(validateDiscount(100, 'percentage', 0).valid).toBe(false);
		});

		it('should reject discounts exceeding base price (fixed)', () => {
			expect(validateDiscount(100, 'fixed', 101).valid).toBe(false);
			expect(validateDiscount(50, 'fixed', 50.01).valid).toBe(false);
		});

		it('should reject percentage discounts over 100%', () => {
			expect(validateDiscount(100, 'percentage', 101).valid).toBe(false);
			expect(validateDiscount(100, 'percentage', 150).valid).toBe(false);
		});

		it('should apply max discount percentage limit (default 50%)', () => {
			expect(validateDiscount(100, 'percentage', 51).valid).toBe(false);
			expect(validateDiscount(100, 'percentage', 75).valid).toBe(false);
			expect(validateDiscount(100, 'percentage', 50).valid).toBe(true);
		});

		it('should allow custom max discount percentage', () => {
			expect(validateDiscount(100, 'percentage', 60, 75).valid).toBe(true);
			expect(validateDiscount(100, 'percentage', 76, 75).valid).toBe(false);
		});

		it('should return appropriate error messages', () => {
			expect(validateDiscount(100, 'fixed', -10).error).toBe('Discount cannot be negative');
			expect(validateDiscount(100, 'fixed', 0).error).toBe('Discount must be greater than 0');
			expect(validateDiscount(100, 'fixed', 101).error).toBe('Discount cannot exceed the item price');
			expect(validateDiscount(100, 'percentage', 101).error).toBe('Percentage discount cannot exceed 100%');
			expect(validateDiscount(100, 'percentage', 60).error).toBe('Discount cannot exceed 50%');
		});
	});

	describe('calculateCartTotals', () => {
		const mockCartItem = (
			price: number, 
			quantity: number, 
			discount?: { type: 'fixed' | 'percentage'; value: number },
			variations: { groupId: string; groupName: string; variationId: string; variationName: string; priceAdjustment: number }[] = [],
			modifiers: { modifierId: string; modifierName: string; groupId: string; groupName: string; price: number; quantity: number }[] = []
		) => ({
			item: { 
				id: '1', 
				name: 'Test Item', 
				price, 
				createdAt: new Date(),
				categoryId: '1',
				description: null,
				isAvailable: true,
				category: { id: '1', name: 'Test Category', displayOrder: 1, createdAt: new Date() } 
			},
			quantity,
			variations,
			modifiers,
			discount
		});

		it('should calculate totals without any discounts', () => {
			const cart = [
				mockCartItem(10, 2),
				mockCartItem(15, 1)
			];
			const totals = calculateCartTotals(cart);

			expect(totals.subtotal).toBe(35);
			expect(totals.itemDiscounts).toBe(0);
			expect(totals.orderDiscount).toBe(0);
			expect(totals.totalDiscount).toBe(0);
			expect(totals.finalTotal).toBe(35);
		});

		it('should calculate totals with item discounts only', () => {
			const cart = [
				mockCartItem(10, 2, { type: 'fixed', value: 2 }), // 20 - 2 = 18
				mockCartItem(15, 1, { type: 'percentage', value: 10 }) // 15 - 1.50 = 13.50
			];
			const totals = calculateCartTotals(cart);

			expect(totals.subtotal).toBe(35);
			expect(totals.itemDiscounts).toBeCloseTo(3.50, 2);
			expect(totals.orderDiscount).toBe(0);
			expect(totals.totalDiscount).toBeCloseTo(3.50, 2);
			expect(totals.finalTotal).toBeCloseTo(31.50, 2);
		});

		it('should calculate totals with order discount only', () => {
			const cart = [
				mockCartItem(10, 2),
				mockCartItem(15, 1)
			];
			const orderDiscount = { type: 'fixed' as const, value: 5 };
			const totals = calculateCartTotals(cart, orderDiscount);

			expect(totals.subtotal).toBe(35);
			expect(totals.itemDiscounts).toBe(0);
			expect(totals.orderDiscount).toBe(5);
			expect(totals.totalDiscount).toBe(5);
			expect(totals.finalTotal).toBe(30);
		});

		it('should calculate totals with both item and order discounts', () => {
			const cart = [
				mockCartItem(10, 2, { type: 'fixed', value: 2 }), // 20 - 2 = 18
				mockCartItem(15, 1, { type: 'percentage', value: 10 }) // 15 - 1.50 = 13.50
			];
			const orderDiscount = { type: 'percentage' as const, value: 10 }; // 10% of (18 + 13.50) = 3.15
			const totals = calculateCartTotals(cart, orderDiscount);

			expect(totals.subtotal).toBe(35);
			expect(totals.itemDiscounts).toBeCloseTo(3.50, 2);
			expect(totals.orderDiscount).toBeCloseTo(3.15, 2);
			expect(totals.totalDiscount).toBeCloseTo(6.65, 2);
			expect(totals.finalTotal).toBeCloseTo(28.35, 2);
		});

		it('should handle empty cart', () => {
			const totals = calculateCartTotals([]);

			expect(totals.subtotal).toBe(0);
			expect(totals.itemDiscounts).toBe(0);
			expect(totals.orderDiscount).toBe(0);
			expect(totals.totalDiscount).toBe(0);
			expect(totals.finalTotal).toBe(0);
		});

		it('should handle order discount on empty cart', () => {
			const orderDiscount = { type: 'fixed' as const, value: 5 };
			const totals = calculateCartTotals([], orderDiscount);

			expect(totals.subtotal).toBe(0);
			expect(totals.itemDiscounts).toBe(0);
			expect(totals.orderDiscount).toBe(0);
			expect(totals.finalTotal).toBe(0);
		});

		it('should not allow negative final total', () => {
			const cart = [
				mockCartItem(10, 1)
			];
			const orderDiscount = { type: 'fixed' as const, value: 100 };
			const totals = calculateCartTotals(cart, orderDiscount);

			expect(totals.finalTotal).toBe(0);
		});

		it('should round all values to 2 decimal places', () => {
			const cart = [
				mockCartItem(99.99, 1, { type: 'percentage', value: 33.33 })
			];
			const totals = calculateCartTotals(cart);

			expect(totals.itemDiscounts).toBeCloseTo(33.33, 2);
			expect(totals.finalTotal).toBeCloseTo(66.66, 2);
		});
	});
});
