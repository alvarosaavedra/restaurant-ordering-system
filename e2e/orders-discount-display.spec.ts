import { test, expect } from './fixtures';

test.describe('Order Discount Display', () => {
	test.describe('Order Detail Page', () => {
		test('should display order with item discounts', async ({ page, authenticatedAs, createTestMenuItems, createTestOrderWithItems, deleteTestOrder }) => {
			await authenticatedAs('admin');

			// Create test menu items
			const menuItems = await createTestMenuItems(1);
			const menuItem = menuItems[0];

			// Create order with item discount
			const order = await createTestOrderWithItems({
				orderData: {
					customerName: 'Discount Test Customer',
					customerPhone: '555-1234',
					deliveryDateTime: new Date(Date.now() + 86400000),
					totalAmount: 16.00
				},
				items: [
					{
						menuItemId: menuItem.id,
						quantity: 2,
						unitPrice: 10.00,
						discountAmount: 2.00,
						discountType: 'fixed',
						discountValue: 2.00,
						discountReason: 'Loyalty discount'
					}
				]
			});

			try {
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

				// Check final total
				await expect(page.getByText('$16.00')).toBeVisible();
			} finally {
				await deleteTestOrder(order.id);
			}
		});

		test('should display order with order-level discount', async ({ page, authenticatedAs, createTestMenuItems, createTestOrderWithItems, deleteTestOrder }) => {
			await authenticatedAs('admin');

			const menuItems = await createTestMenuItems(1);
			const menuItem = menuItems[0];

			const order = await createTestOrderWithItems({
				orderData: {
					customerName: 'Order Discount Customer',
					customerPhone: '555-5678',
					deliveryDateTime: new Date(Date.now() + 86400000),
					totalAmount: 25.00,
					discountAmount: 5.00,
					discountType: 'fixed',
					discountValue: 5.00,
					discountReason: 'First order discount'
				},
				items: [
					{
						menuItemId: menuItem.id,
						quantity: 2,
						unitPrice: 15.00
					}
				]
			});

			try {
				await page.goto(`/orders/${order.id}`);

				// Check order discount in breakdown
				await expect(page.getByText('Order Discount')).toBeVisible();
				await expect(page.getByText('(First order discount)')).toBeVisible();
				await expect(page.getByText('-$5.00')).toBeVisible();

				// Check total saved
				await expect(page.getByText('You Saved')).toBeVisible();
			} finally {
				await deleteTestOrder(order.id);
			}
		});

		test('should not show discount section when order has no discounts', async ({ page, authenticatedAs, createTestMenuItems, createTestOrderWithItems, deleteTestOrder }) => {
			await authenticatedAs('admin');

			const menuItems = await createTestMenuItems(1);
			const menuItem = menuItems[0];

			const order = await createTestOrderWithItems({
				orderData: {
					customerName: 'No Discount Customer',
					customerPhone: '555-9999',
					deliveryDateTime: new Date(Date.now() + 86400000),
					totalAmount: 20.00
				},
				items: [
					{
						menuItemId: menuItem.id,
						quantity: 1,
						unitPrice: 20.00
					}
				]
			});

			try {
				await page.goto(`/orders/${order.id}`);

				// Discount section should not be visible
				await expect(page.getByText('You Saved')).not.toBeVisible();
				await expect(page.getByText('Item Discounts')).not.toBeVisible();
				await expect(page.getByText('Order Discount')).not.toBeVisible();

				// Only total should be shown
				await expect(page.getByText('Total')).toBeVisible();
			} finally {
				await deleteTestOrder(order.id);
			}
		});
	});

	test.describe('Orders List Page', () => {
		test('should show discount badge for discounted orders', async ({ page, authenticatedAs, createTestMenuItems, createTestOrderWithItems, deleteTestOrder }) => {
			await authenticatedAs('admin');

			const menuItems = await createTestMenuItems(2);

			// Create discounted order
			const discountedOrder = await createTestOrderWithItems({
				orderData: {
					customerName: 'Discounted Customer',
					customerPhone: '555-1111',
					deliveryDateTime: new Date(Date.now() + 86400000),
					totalAmount: 15.00
				},
				items: [
					{
						menuItemId: menuItems[0].id,
						quantity: 1,
						unitPrice: 20.00,
						discountAmount: 5.00,
						discountType: 'fixed',
						discountValue: 5.00
					}
				]
			});

			// Create non-discounted order
			const regularOrder = await createTestOrderWithItems({
				orderData: {
					customerName: 'Regular Customer',
					customerPhone: '555-2222',
					deliveryDateTime: new Date(Date.now() + 172800000),
					totalAmount: 25.00
				},
				items: [
					{
						menuItemId: menuItems[1].id,
						quantity: 1,
						unitPrice: 25.00
					}
				]
			});

			try {
				// Navigate to orders list
				await page.goto('/orders');

				// Discounted order should have badge
				await expect(page.getByText('Discounted Customer').locator('..').getByText('Saved')).toBeVisible();

				// Regular order should not have badge
				const regularRow = page.locator('text=Regular Customer').first();
				await expect(regularRow.locator('xpath=ancestor::a')).not.toContainText('Saved');
			} finally {
				await deleteTestOrder(discountedOrder.id);
				await deleteTestOrder(regularOrder.id);
			}
		});
	});

	test.describe('OrderCard Component', () => {
		test('should display discount badges in kitchen view', async ({ page, authenticatedAs, createTestMenuItems, createTestOrderWithItems, deleteTestOrder }) => {
			await authenticatedAs('kitchen');

			const menuItems = await createTestMenuItems(1);

			const order = await createTestOrderWithItems({
				orderData: {
					customerName: 'Kitchen Test Customer',
					customerPhone: '555-3333',
					deliveryDateTime: new Date(Date.now() + 86400000),
					totalAmount: 20.00,
					status: 'pending'
				},
				items: [
					{
						menuItemId: menuItems[0].id,
						quantity: 2,
						unitPrice: 12.00,
						discountAmount: 2.00,
						discountType: 'fixed',
						discountValue: 2.00,
						discountReason: 'Special'
					}
				]
			});

			try {
				// Navigate to kitchen view
				await page.goto('/kitchen');

				// Check for discount badge on item
				await expect(page.getByText('$2.00 off')).toBeVisible();

				// Check for discount summary
				await expect(page.getByText('Discounts Applied')).toBeVisible();
				await expect(page.getByText('Item Discounts')).toBeVisible();
			} finally {
				await deleteTestOrder(order.id);
			}
		});
	});

	test.describe('Mobile Responsive', () => {
		test('should display discounts correctly on mobile viewport', async ({ page, authenticatedAs, createTestMenuItems, createTestOrderWithItems, deleteTestOrder }) => {
			await authenticatedAs('admin');

			const menuItems = await createTestMenuItems(1);

			const order = await createTestOrderWithItems({
				orderData: {
					customerName: 'Mobile Test Customer',
					customerPhone: '555-4444',
					deliveryDateTime: new Date(Date.now() + 86400000),
					totalAmount: 20.00
				},
				items: [
					{
						menuItemId: menuItems[0].id,
						quantity: 1,
						unitPrice: 25.00,
						discountAmount: 5.00,
						discountType: 'fixed',
						discountValue: 5.00
					}
				]
			});

			try {
				// Set mobile viewport
				await page.setViewportSize({ width: 375, height: 667 });

				// Navigate to order detail
				await page.goto(`/orders/${order.id}`);

				// Check discount information is visible on mobile
				await expect(page.getByText('Item Discounts')).toBeVisible();
				await expect(page.getByText('You Saved')).toBeVisible();
			} finally {
				await deleteTestOrder(order.id);
			}
		});
	});
});
