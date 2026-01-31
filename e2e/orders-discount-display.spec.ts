import { test, expect } from '@playwright/test';
import { loginAsAdmin, createTestOrder, cleanupTestData } from '../test-utils';

test.describe('Order Discount Display', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test.afterEach(async () => {
		await cleanupTestData();
	});

	test.describe('Order Detail Page', () => {
		test('should display order with item discounts', async ({ page }) => {
			// Create order with item discount
			const order = await createTestOrder({
				customerName: 'Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 2,
						unitPrice: 10.00,
						discountAmount: 2.00,
						discountType: 'fixed',
						discountValue: 2.00,
						discountReason: 'Loyalty discount'
					}
				],
				totalAmount: 16.00
			});

			// Navigate to order detail
			await page.goto(`/orders/${order.id}`);

			// Wait for page to load
			await expect(page.getByText('Order Details')).toBeVisible();

			// Check discount badge on item
			await expect(page.getByText('$2.00 off')).toBeVisible();
			await expect(page.getByText('(Loyalty discount)')).toBeVisible();

			// Check discount breakdown
			await expect(page.getByText('Subtotal')).toBeVisible();
			await expect(page.getByText('Item Discounts')).toBeVisible();
			await expect(page.getByText('-$4.00')).toBeVisible(); // 2 items × $2 discount

			// Check total saved
			await expect(page.getByText('You Saved')).toBeVisible();
			await expect(page.getByText('-$4.00')).toBeVisible();

			// Check final total
			await expect(page.getByText('$16.00')).toBeVisible();
		});

		test('should display order with order-level discount', async ({ page }) => {
			// Create order with order discount
			const order = await createTestOrder({
				customerName: 'Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 2,
						unitPrice: 15.00
					}
				],
				discountAmount: 5.00,
				discountType: 'fixed',
				discountValue: 5.00,
				discountReason: 'First order discount',
				totalAmount: 25.00
			});

			// Navigate to order detail
			await page.goto(`/orders/${order.id}`);

			// Check order discount in breakdown
			await expect(page.getByText('Order Discount')).toBeVisible();
			await expect(page.getByText('(First order discount)')).toBeVisible();
			await expect(page.getByText('-$5.00')).toBeVisible();

			// Check total saved
			await expect(page.getByText('You Saved')).toBeVisible();
			await expect(page.getByText('-$5.00')).toBeVisible();
		});

		test('should display order with both item and order discounts', async ({ page }) => {
			// Create order with both types of discounts
			const order = await createTestOrder({
				customerName: 'Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 2,
						unitPrice: 10.00,
						discountAmount: 1.00,
						discountType: 'fixed',
						discountValue: 1.00,
						discountReason: 'Item promotion'
					}
				],
				discountAmount: 3.00,
				discountType: 'percentage',
				discountValue: 10,
				discountReason: 'Holiday sale',
				totalAmount: 15.00 // (2×$10 - 2×$1) - 10% = $18 - $1.8 - $3 = ~$15
			});

			// Navigate to order detail
			await page.goto(`/orders/${order.id}`);

			// Check both discounts are shown
			await expect(page.getByText('Item Discounts')).toBeVisible();
			await expect(page.getByText('Order Discount')).toBeVisible();
			await expect(page.getByText('(Holiday sale)')).toBeVisible();

			// Check total saved includes both
			await expect(page.getByText('You Saved')).toBeVisible();
		});

		test('should not show discount section when order has no discounts', async ({ page }) => {
			// Create order without discounts
			const order = await createTestOrder({
				customerName: 'Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 1,
						unitPrice: 20.00
					}
				],
				totalAmount: 20.00
			});

			// Navigate to order detail
			await page.goto(`/orders/${order.id}`);

			// Discount section should not be visible
			await expect(page.getByText('You Saved')).not.toBeVisible();
			await expect(page.getByText('Item Discounts')).not.toBeVisible();
			await expect(page.getByText('Order Discount')).not.toBeVisible();

			// Only total should be shown
			await expect(page.getByText('Total')).toBeVisible();
			await expect(page.getByText('$20.00')).toBeVisible();
		});

		test('should show strikethrough original price for discounted items', async ({ page }) => {
			// Create order with item discount
			const order = await createTestOrder({
				customerName: 'Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 2,
						unitPrice: 10.00,
						discountAmount: 2.00,
						discountType: 'fixed',
						discountValue: 2.00
					}
				],
				totalAmount: 16.00
			});

			// Navigate to order detail
			await page.goto(`/orders/${order.id}`);

			// Check for strikethrough original price
			const originalPrice = page.locator('text=$20.00').first();
			await expect(originalPrice).toHaveClass(/line-through/);
		});
	});

	test.describe('Orders List Page', () => {
		test('should show discount badge for discounted orders', async ({ page }) => {
			// Create discounted order
			const discountedOrder = await createTestOrder({
				customerName: 'Discounted Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 1,
						unitPrice: 20.00,
						discountAmount: 5.00,
						discountType: 'fixed',
						discountValue: 5.00
					}
				],
				totalAmount: 15.00
			});

			// Create non-discounted order
			const regularOrder = await createTestOrder({
				customerName: 'Regular Customer',
				items: [
					{
						menuItemId: 'test-item-2',
						quantity: 1,
						unitPrice: 25.00
					}
				],
				totalAmount: 25.00
			});

			// Navigate to orders list
			await page.goto('/orders');

			// Discounted order should have badge
			const discountedRow = page.locator(`a[href="/orders/${discountedOrder.id}"]`);
			await expect(discountedRow.getByText('Saved $5.00')).toBeVisible();

			// Regular order should not have badge
			const regularRow = page.locator(`a[href="/orders/${regularOrder.id}"]`);
			await expect(regularRow.getByText('Saved')).not.toBeVisible();
		});

		test('should calculate total savings correctly for orders list', async ({ page }) => {
			// Create order with multiple item discounts
			const order = await createTestOrder({
				customerName: 'Multi Discount Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 2,
						unitPrice: 10.00,
						discountAmount: 2.00,
						discountType: 'fixed',
						discountValue: 2.00
					},
					{
						menuItemId: 'test-item-2',
						quantity: 1,
						unitPrice: 15.00,
						discountAmount: 3.00,
						discountType: 'fixed',
						discountValue: 3.00
					}
				],
				totalAmount: 26.00 // (2×$10 - 2×$2) + ($15 - $3) = $16 + $12 = $28
			});

			// Navigate to orders list
			await page.goto('/orders');

			// Should show total savings (2×$2 + $3 = $7)
			const orderRow = page.locator(`a[href="/orders/${order.id}"]`);
			await expect(orderRow.getByText('Saved $7.00')).toBeVisible();
		});
	});

	test.describe('OrderCard Component', () => {
		test('should display discount badges in kitchen view', async ({ page }) => {
			// Create discounted order (ID used implicitly via page navigation)
			void await createTestOrder({
				customerName: 'Kitchen Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 2,
						unitPrice: 12.00,
						discountAmount: 2.00,
						discountType: 'fixed',
						discountValue: 2.00,
						discountReason: 'Special'
					}
				],
				totalAmount: 20.00,
				status: 'pending'
			});

			// Navigate to kitchen view
			await page.goto('/kitchen');

			// Check for discount badge on item
			await expect(page.getByText('$2.00 off')).toBeVisible();

			// Check for discount summary
			await expect(page.getByText('Discounts Applied')).toBeVisible();
			await expect(page.getByText('Item Discounts')).toBeVisible();
			await expect(page.getByText('-$4.00')).toBeVisible();
		});

		test('should display order discount in delivery view', async ({ page }) => {
			// Create order with order discount (ID used implicitly via page navigation)
			void await createTestOrder({
				customerName: 'Delivery Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 1,
						unitPrice: 30.00
					}
				],
				discountAmount: 5.00,
				discountType: 'fixed',
				discountValue: 5.00,
				discountReason: 'Delivery discount',
				totalAmount: 25.00,
				status: 'ready'
			});

			// Navigate to delivery view
			await page.goto('/delivery');

			// Check for order discount in summary
			await expect(page.getByText('Order Discount')).toBeVisible();
			await expect(page.getByText('(Delivery discount)')).toBeVisible();
			await expect(page.getByText('-$5.00')).toBeVisible();

			// Check for total saved
			await expect(page.getByText('Total Saved')).toBeVisible();
			await expect(page.getByText('-$5.00')).toBeVisible();
		});

		test('should show strikethrough pricing for discounted items in cards', async ({ page }) => {
			// Create order with item discount (ID used implicitly via page navigation)
			void await createTestOrder({
				customerName: 'Card Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 1,
						unitPrice: 20.00,
						discountAmount: 5.00,
						discountType: 'fixed',
						discountValue: 5.00
					}
				],
				totalAmount: 15.00,
				status: 'pending'
			});

			// Navigate to kitchen view
			await page.goto('/kitchen');

			// Check for strikethrough original price
			const originalPrice = page.locator('text=$20.00').first();
			await expect(originalPrice).toHaveClass(/line-through/);

			// Check for discounted price
			await expect(page.getByText('$15.00').first()).toBeVisible();
		});
	});

	test.describe('Mobile Responsive', () => {
		test('should display discounts correctly on mobile viewport', async ({ page }) => {
			// Create order with discounts
			const order = await createTestOrder({
				customerName: 'Mobile Test Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 1,
						unitPrice: 25.00,
						discountAmount: 5.00,
						discountType: 'fixed',
						discountValue: 5.00
					}
				],
				totalAmount: 20.00
			});

			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });

			// Navigate to order detail
			await page.goto(`/orders/${order.id}`);

			// Check discount information is visible
			await expect(page.getByText('Item Discounts')).toBeVisible();
			await expect(page.getByText('-$5.00')).toBeVisible();
			await expect(page.getByText('You Saved')).toBeVisible();
		});

		test('should show discount badges in orders list on mobile', async ({ page }) => {
			// Create discounted order
			const order = await createTestOrder({
				customerName: 'Mobile List Customer',
				items: [
					{
						menuItemId: 'test-item-1',
						quantity: 1,
						unitPrice: 20.00,
						discountAmount: 5.00,
						discountType: 'fixed',
						discountValue: 5.00
					}
				],
				totalAmount: 15.00
			});

			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });

			// Navigate to orders list
			await page.goto('/orders');

			// Check discount badge is visible
			const orderRow = page.locator(`a[href="/orders/${order.id}"]`);
			await expect(orderRow.getByText('Saved $5.00')).toBeVisible();
		});
	});
});
