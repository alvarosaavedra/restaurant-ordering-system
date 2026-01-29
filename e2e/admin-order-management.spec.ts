import { test, expect } from './fixtures/auth';
import { TEST_USERS } from './fixtures/auth';
import { createOrder } from './fixtures/database';

test.describe('Admin Order Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	test('admin can edit order basic fields', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		const order = await createOrder({
			customerName: 'Test Customer',
			customerPhone: '555-1234',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order.id}`);
		await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();

		await page.getByRole('button', { name: 'Edit Order' }).click();
		await expect(page.getByRole('dialog', { name: 'Edit Order' })).toBeVisible();

		await page.getByLabel('Customer Name').fill('Updated Customer');
		await page.getByLabel('Delivery Date/Time').fill('2026-01-30T12:00');
		await page.getByRole('button', { name: 'Update Order' }).click();

		await expect(page.getByRole('alert')).toContainText('Order updated successfully');
		await expect(page.getByText('Updated Customer')).toBeVisible();
	});

	test('admin can edit order items', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 25.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order.id}`);
		await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();

		await page.getByRole('button', { name: 'Edit Items' }).click();
		await expect(page.getByRole('dialog', { name: 'Edit Order Items' })).toBeVisible();

		const itemRow = page.locator('.space-y-2 > div').first();
		const quantityInput = itemRow.getByRole('spinbutton');
		await quantityInput.fill('3');

		await page.getByRole('button', { name: 'Update Items' }).click();

		await expect(page.getByRole('alert')).toContainText('Order items updated successfully');
	});

	test('admin can add new item to order', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order.id}`);
		await page.getByRole('button', { name: 'Edit Items' }).click();

		await page.getByLabel('Add Item').selectOption({ label: 'Croissant' });
		await page.getByRole('button', { name: 'Update Items' }).click();

		await expect(page.getByRole('alert')).toContainText('Order items updated successfully');
	});

	test('admin can remove item from order', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order.id}`);
		await page.getByRole('button', { name: 'Edit Items' }).click();

		const removeButton = page.locator('[aria-label="Remove item"]').first();
		await removeButton.click();

		await page.getByRole('button', { name: 'Update Items' }).click();

		await expect(page.getByRole('alert')).toContainText('Order items updated successfully');
	});

	test('admin can soft-delete order', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order.id}`);
		await page.getByRole('button', { name: 'Delete' }).click();
		await expect(page.getByRole('dialog', { name: 'Delete Order' })).toBeVisible();

		await expect(page.getByText('This action will archive this order')).toBeVisible();
		await page.getByRole('button', { name: 'Delete Order' }).click();

		await expect(page).toHaveURL('/orders');
	});

	test('deleted orders do not appear in order history', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		await createOrder({
			customerName: 'Active Order',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		const order2 = await createOrder({
			customerName: 'Deleted Order',
			totalAmount: 25.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto('/orders');
		await page.waitForLoadState('networkidle');

		await expect(page.getByText('Active Order')).toBeVisible();
		await expect(page.getByText('Deleted Order')).toBeVisible();

		await page.goto(`/orders/${order2.id}`);
		await page.getByRole('button', { name: 'Delete' }).click();
		await page.getByRole('button', { name: 'Delete Order', exact: true }).click();

		await page.waitForURL('/orders');
		await page.waitForLoadState('networkidle');

		await expect(page.getByText('Active Order')).toBeVisible();
		await expect(page.getByText('Deleted Order')).not.toBeVisible();
	});

	test('deleted orders do not appear in kitchen view', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		await createOrder({
			customerName: 'Active Kitchen Order',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		const order2 = await createOrder({
			customerName: 'Deleted Kitchen Order',
			totalAmount: 25.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order2.id}`);
		await page.getByRole('button', { name: 'Delete' }).click();
		await page.getByRole('button', { name: 'Delete Order', exact: true }).click();

		await page.goto('/kitchen');
		await page.waitForLoadState('networkidle');

		await expect(page.getByText('Active Kitchen Order')).toBeVisible();
		await expect(page.getByText('Deleted Kitchen Order')).not.toBeVisible();
	});

	test('deleted orders do not appear in delivery view', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		await createOrder({
			customerName: 'Active Delivery Order',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'ready'
		});

		const order2 = await createOrder({
			customerName: 'Deleted Delivery Order',
			totalAmount: 25.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'ready'
		});

		await page.goto(`/orders/${order2.id}`);
		await page.getByRole('button', { name: 'Delete' }).click();
		await page.getByRole('button', { name: 'Delete Order', exact: true }).click();

		await page.goto('/delivery');
		await page.waitForLoadState('networkidle');

		await expect(page.getByText('Active Delivery Order')).toBeVisible();
		await expect(page.getByText('Deleted Delivery Order')).not.toBeVisible();
	});

	test('non-admin users cannot see admin controls', async ({ page, authenticatedAs }) => {
		await authenticatedAs('orderTaker');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order.id}`);
		await expect(page.getByRole('button', { name: 'Edit Order' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Edit Items' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
	});

	test('kitchen user cannot see admin controls', async ({ page, authenticatedAs }) => {
		await authenticatedAs('kitchen');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'preparing'
		});

		await page.goto(`/orders/${order.id}`);
		await expect(page.getByRole('button', { name: 'Edit Order' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Edit Items' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
	});

	test('delivery user cannot see admin controls', async ({ page, authenticatedAs }) => {
		await authenticatedAs('delivery');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'ready'
		});

		await page.goto(`/orders/${order.id}`);
		await expect(page.getByRole('button', { name: 'Edit Order' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Edit Items' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
	});

	test('success toast displays after editing order', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order.id}`);
		await page.getByRole('button', { name: 'Edit Order' }).click();

		await page.getByLabel('Customer Name').fill('Updated Name');
		await page.getByRole('button', { name: 'Update Order' }).click();

		const toast = page.getByRole('alert');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('Order updated successfully');
		await expect(toast).toContainText('Order updated successfully');
	});

	test('error toast displays for invalid data', async ({ page, authenticatedAs }) => {
		await authenticatedAs('admin');

		const order = await createOrder({
			customerName: 'Test Customer',
			totalAmount: 15.99,
			employeeId: TEST_USERS.orderTaker.email,
			status: 'pending'
		});

		await page.goto(`/orders/${order.id}`);
		await page.getByRole('button', { name: 'Edit Order' }).click();

		await page.getByLabel('Customer Name').clear();
		await page.getByRole('button', { name: 'Update Order' }).click();

		const toast = page.getByRole('alert');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('Customer name, delivery date/time, and status are required');
	});
});
