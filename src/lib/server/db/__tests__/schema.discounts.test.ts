import { describe, it, expect } from 'vitest';
import { order, orderItem } from '../schema';

describe('Database Schema - Discounts', () => {
	describe('order table discount fields', () => {
		it('should have discountAmount field', () => {
			expect(order.discountAmount).toBeDefined();
			expect(order.discountAmount.name).toBe('discount_amount');
		});

		it('should have discountType field', () => {
			expect(order.discountType).toBeDefined();
			expect(order.discountType.name).toBe('discount_type');
		});

		it('should have discountValue field', () => {
			expect(order.discountValue).toBeDefined();
			expect(order.discountValue.name).toBe('discount_value');
		});

		it('should have discountReason field', () => {
			expect(order.discountReason).toBeDefined();
			expect(order.discountReason.name).toBe('discount_reason');
		});
	});

	describe('orderItem table discount fields', () => {
		it('should have discountAmount field', () => {
			expect(orderItem.discountAmount).toBeDefined();
			expect(orderItem.discountAmount.name).toBe('discount_amount');
		});

		it('should have discountType field', () => {
			expect(orderItem.discountType).toBeDefined();
			expect(orderItem.discountType.name).toBe('discount_type');
		});

		it('should have discountValue field', () => {
			expect(orderItem.discountValue).toBeDefined();
			expect(orderItem.discountValue.name).toBe('discount_value');
		});

		it('should have discountReason field', () => {
			expect(orderItem.discountReason).toBeDefined();
			expect(orderItem.discountReason.name).toBe('discount_reason');
		});

		it('should have finalPrice field', () => {
			expect(orderItem.finalPrice).toBeDefined();
			expect(orderItem.finalPrice.name).toBe('final_price');
		});
	});

	describe('discount type inference', () => {
		it('should infer Order type with discount fields', () => {
			// Type-level check - verify the fields exist in the table definition
			// by checking the column names in the table config
			const orderColumns = Object.keys(order);
			expect(orderColumns).toContain('discountAmount');
			expect(orderColumns).toContain('discountType');
			expect(orderColumns).toContain('discountValue');
			expect(orderColumns).toContain('discountReason');
		});

		it('should infer OrderItem type with discount fields', () => {
			// Type-level check - verify the fields exist in the table definition
			const orderItemColumns = Object.keys(orderItem);
			expect(orderItemColumns).toContain('discountAmount');
			expect(orderItemColumns).toContain('discountType');
			expect(orderItemColumns).toContain('discountValue');
			expect(orderItemColumns).toContain('discountReason');
			expect(orderItemColumns).toContain('finalPrice');
		});
	});
});
