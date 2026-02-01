import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSalesReport, getSalesSummary } from './sales-reports';
import { db } from '$lib/server/db';
import { order, orderItem, menuItem, category, user } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

describe('Sales Reports', () => {
	const testUserId = 'test-user-123';
	const testCategoryId = 'test-cat-123';
	const testMenuItemId = 'test-item-123';
	let testOrderIds: string[] = [];

	beforeEach(async () => {
		// Clear the testOrderIds array
		testOrderIds = [];

		// Clean up any existing test data first
		await db.delete(orderItem).where(sql`${orderItem.orderId} LIKE 'test-order-%'`);
		await db.delete(order).where(sql`${order.id} LIKE 'test-order-%'`);

		// Create fresh test data
		await db.insert(user).values({
			id: testUserId,
			name: 'Test User',
			email: 'test@example.com',
			passwordHash: 'hash',
			role: 'order_taker'
		});

		await db.insert(category).values({
			id: testCategoryId,
			name: 'Test Category',
			displayOrder: 1
		});

		await db.insert(menuItem).values({
			id: testMenuItemId,
			categoryId: testCategoryId,
			name: 'Test Item',
			price: 10.00
		});
	});

	afterEach(async () => {
		// Cleanup test data
		for (const orderId of testOrderIds) {
			await db.delete(orderItem).where(eq(orderItem.orderId, orderId));
			await db.delete(order).where(eq(order.id, orderId));
		}
		await db.delete(menuItem).where(eq(menuItem.id, testMenuItemId));
		await db.delete(category).where(eq(category.id, testCategoryId));
		await db.delete(user).where(eq(user.id, testUserId));
	});

	describe('getSalesReport', () => {
		it('should return empty array when no orders exist in date range', async () => {
			const result = await getSalesReport('2020-01-01', '2020-01-31');
			expect(result).toEqual([]);
		});

		it('should aggregate orders by date', async () => {
			const today = new Date().toISOString().split('T')[0];
			
			// Create test orders
			const orderId1 = `test-order-${Date.now()}-1`;
			const orderId2 = `test-order-${Date.now()}-2`;
			testOrderIds.push(orderId1, orderId2);

			await db.insert(order).values({
				id: orderId1,
				customerName: 'Customer 1',
				totalAmount: 50.00,
				status: 'delivered',
				employeeId: testUserId,
				deliveryDateTime: new Date(),
				createdAt: new Date()
			});

			await db.insert(order).values({
				id: orderId2,
				customerName: 'Customer 2',
				totalAmount: 75.00,
				status: 'delivered',
				employeeId: testUserId,
				deliveryDateTime: new Date(),
				createdAt: new Date()
			});

			await db.insert(orderItem).values({
				id: `item-${Date.now()}-1`,
				orderId: orderId1,
				menuItemId: testMenuItemId,
				quantity: 2,
				unitPrice: 25.00
			});

			await db.insert(orderItem).values({
				id: `item-${Date.now()}-2`,
				orderId: orderId2,
				menuItemId: testMenuItemId,
				quantity: 3,
				unitPrice: 25.00
			});

			const result = await getSalesReport(today, today);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				date: expect.any(String),
				grossRevenue: 125.00,
				orderCount: 2,
				avgOrderValue: 62.50
			});
		});

		it('should calculate discounts correctly', async () => {
			const today = new Date().toISOString().split('T')[0];
			const orderId = `test-order-${Date.now()}-discount`;
			testOrderIds.push(orderId);

			await db.insert(order).values({
				id: orderId,
				customerName: 'Customer Discount',
				totalAmount: 100.00,
				discountAmount: 10.00,
				discountType: 'fixed',
				discountValue: 10.00,
				status: 'delivered',
				employeeId: testUserId,
				deliveryDateTime: new Date(),
				createdAt: new Date()
			});

			await db.insert(orderItem).values({
				id: `item-${Date.now()}-discount`,
				orderId: orderId,
				menuItemId: testMenuItemId,
				quantity: 1,
				unitPrice: 100.00
			});

			const result = await getSalesReport(today, today);
			
			expect(result[0].totalDiscounts).toBe(10.00);
			expect(result[0].netRevenue).toBe(90.00);
		});
	});

	describe('getSalesSummary', () => {
		it('should return summary for empty date range', async () => {
			const result = await getSalesSummary('2020-01-01', '2020-01-31');
			
			expect(result).toEqual({
				totalRevenue: 0,
				totalDiscounts: 0,
				netRevenue: 0,
				totalOrders: 0,
				avgOrderValue: 0,
				totalItemsSold: 0
			});
		});

		it('should calculate overall summary correctly', async () => {
			const today = new Date().toISOString().split('T')[0];
			
			const orderId1 = `test-order-${Date.now()}-summary1`;
			const orderId2 = `test-order-${Date.now()}-summary2`;
			testOrderIds.push(orderId1, orderId2);

			await db.insert(order).values({
				id: orderId1,
				customerName: 'Customer 1',
				totalAmount: 100.00,
				discountAmount: 10.00,
				discountType: 'fixed',
				discountValue: 10.00,
				status: 'delivered',
				employeeId: testUserId,
				deliveryDateTime: new Date(),
				createdAt: new Date()
			});

			await db.insert(order).values({
				id: orderId2,
				customerName: 'Customer 2',
				totalAmount: 50.00,
				status: 'delivered',
				employeeId: testUserId,
				deliveryDateTime: new Date(),
				createdAt: new Date()
			});

			await db.insert(orderItem).values({
				id: `item-${Date.now()}-s1`,
				orderId: orderId1,
				menuItemId: testMenuItemId,
				quantity: 2,
				unitPrice: 50.00
			});

			await db.insert(orderItem).values({
				id: `item-${Date.now()}-s2`,
				orderId: orderId2,
				menuItemId: testMenuItemId,
				quantity: 1,
				unitPrice: 50.00
			});

			const result = await getSalesSummary(today, today);
			
			expect(result).toMatchObject({
				totalRevenue: 150.00,
				totalDiscounts: 10.00,
				netRevenue: 140.00,
				totalOrders: 2,
				avgOrderValue: 75.00,
				totalItemsSold: 3
			});
		});
	});
});
