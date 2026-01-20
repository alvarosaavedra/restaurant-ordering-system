import { test, expect } from '@playwright/test';

test.describe('Order History', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('john@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();
	});

	test('should display order history heading', async ({ page }) => {
		await page.goto('/orders');
		await expect(page.getByRole('heading', { name: 'Order History' })).toBeVisible();
	});

	test('should display order cards', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			await expect(orderCards.first()).toBeVisible();
		}
	});

	test('should display customer name for each order', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			const firstOrder = orderCards.first();
			const customerName = firstOrder.getByRole('heading');
			await expect(customerName).toBeVisible();
		}
	});

	test('should display status badge for each order', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			const firstOrder = orderCards.first();
			const statusBadge = firstOrder.locator('span').filter({ hasText: /^(Pending|Preparing|Ready|Delivered)$/ });
			await expect(statusBadge).toBeVisible();
		}
	});

	test('should display order total', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			const firstOrder = orderCards.first();
			const total = firstOrder.getByText(/^\$\d+\.\d{2}$/);
			await expect(total).toBeVisible();
		}
	});

	test('should filter orders by status', async ({ page }) => {
		await page.goto('/orders');

		const statusFilter = page.getByLabel('Filter by status');
		await statusFilter.click();
		await page.getByRole('option', { name: 'Pending' }).click();

		const url = page.url();
		expect(url).toContain('status=pending');
	});

	test('should filter orders by different statuses', async ({ page }) => {
		await page.goto('/orders');

		const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];

		for (const status of statuses) {
			const statusFilter = page.getByLabel('Filter by status');
			await statusFilter.click();
			await page.getByRole('option', { name: status }).click();

			await expect(page.url()).toContain(`status=${status.toLowerCase()}`);
		}
	});

	test('should search orders by customer name', async ({ page }) => {
		await page.goto('/orders');

		const searchInput = page.getByLabel('Search orders');
		await searchInput.fill('John');

		await page.waitForTimeout(500);

		const url = page.url();
		expect(url).toContain('search=John');
	});

	test('should sort orders by date', async ({ page }) => {
		await page.goto('/orders');

		const sortSelect = page.getByLabel('Sort by');
		await sortSelect.click();
		await page.getByRole('option', { name: 'Newest first' }).click();

		await expect(page.url()).toContain('sort=desc');
	});

	test('should sort orders by oldest first', async ({ page }) => {
		await page.goto('/orders');

		const sortSelect = page.getByLabel('Sort by');
		await sortSelect.click();
		await page.getByRole('option', { name: 'Oldest first' }).click();

		await expect(page.url()).toContain('sort=asc');
	});

	test('should display empty state when no orders match', async ({ page }) => {
		await page.goto('/orders');

		const searchInput = page.getByLabel('Search orders');
		await searchInput.fill('NonExistentCustomer123');

		await page.waitForTimeout(500);

		await expect(page.getByText(/no orders found/i)).toBeVisible();
	});

	test('should navigate to order details', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			await orderCards.first().click();

			await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();
		}
	});

	test('should display order details page', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			await orderCards.first().click();

			await expect(page.getByText(/Order #/)).toBeVisible();
			await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();
		}
	});

	test('should display customer information on order details', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			await orderCards.first().click();

			await expect(page.getByText('Customer Information')).toBeVisible();
		}
	});

	test('should display order items on order details', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			await orderCards.first().click();

			await expect(page.getByText('Order Items')).toBeVisible();
		}
	});

	test('should navigate back from order details', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			await orderCards.first().click();

			const backButton = page.getByRole('button', { name: /Back/i });
			if (await backButton.count() > 0) {
				await backButton.click();
				await expect(page).toHaveURL('/orders');
			}
		}
	});

	test('should display order timestamps', async ({ page }) => {
		await page.goto('/orders');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() > 0) {
			const firstOrder = orderCards.first();
			const timeElement = firstOrder.locator('time');
			await expect(timeElement).toBeVisible();
		}
	});

	test('should combine filters and search', async ({ page }) => {
		await page.goto('/orders');

		const searchInput = page.getByLabel('Search orders');
		await searchInput.fill('John');

		const statusFilter = page.getByLabel('Filter by status');
		await statusFilter.click();
		await page.getByRole('option', { name: 'Pending' }).click();

		await page.waitForTimeout(500);

		const url = page.url();
		expect(url).toContain('search=John');
		expect(url).toContain('status=pending');
	});

	test('should reset filters', async ({ page }) => {
		await page.goto('/orders');

		const statusFilter = page.getByLabel('Filter by status');
		await statusFilter.click();
		await page.getByRole('option', { name: 'All Statuses' }).click();

		await expect(page.url()).not.toContain('status=');
	});

	test('should display pagination if many orders', async ({ page }) => {
		await page.goto('/orders');

		const pagination = page.locator('[role="navigation"]').filter({ hasText: /Page/ });

		if (await pagination.count() > 0) {
			await expect(pagination.first()).toBeVisible();
		}
	});

	test('should navigate to dashboard', async ({ page }) => {
		await page.goto('/orders');
		await page.getByRole('link', { name: /Dashboard/i }).click();
		await expect(page).toHaveURL('/');
	});

	test('should navigate to new order page', async ({ page }) => {
		await page.goto('/orders');
		await page.getByRole('link', { name: /Create Order/i }).click();
		await expect(page).toHaveURL('/orders/new');
	});
});
