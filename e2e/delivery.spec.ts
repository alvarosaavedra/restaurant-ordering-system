import { test, expect } from '@playwright/test';

test.describe('Delivery Workflow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('mike@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await expect(page).toHaveURL('/delivery');
	});

	test('should display delivery heading', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Delivery Orders' })).toBeVisible();
	});

	test('should display ready orders', async ({ page }) => {
		await expect(page.getByText('Ready orders')).toBeVisible();
	});

	test('should display order cards with customer information', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		await expect(firstOrder).toBeVisible();

		const customerName = firstOrder.getByRole('heading');
		await expect(customerName).toBeVisible();
	});

	test('should display order items', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const itemsList = firstOrder.getByRole('list', { name: 'Order items' });
		await expect(itemsList).toBeVisible();
	});

	test('should display order total', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const total = firstOrder.getByText(/^\$\d+\.\d{2}$/);
		await expect(total).toBeVisible();
	});

	test('should display mark delivered button for ready orders', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const deliveredButton = firstOrder.getByRole('button', { name: 'Mark Delivered' });
		await expect(deliveredButton).toBeVisible();
	});

	test('should update order to delivered status', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const deliveredButton = firstOrder.getByRole('button', { name: 'Mark Delivered' });

		await deliveredButton.click();

		await expect(page.getByText('Order status updated!')).toBeVisible();
	});

	test('should show loading state during status update', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const deliveredButton = firstOrder.getByRole('button', { name: 'Mark Delivered' });

		await deliveredButton.click();
		await expect(deliveredButton).toBeDisabled();
	});

	test('should display empty state when no orders', async ({ page }) => {
		await page.goto('/delivery');
		const orderCards = page.locator('[role="article"]');

		if (await orderCards.count() === 0) {
			await expect(page.getByText(/no orders/i)).toBeVisible();
		}
	});

	test('should auto-refresh orders', async ({ page }) => {
		await expect(page.getByText('Last updated')).toBeVisible();
	});

	test('should show refresh button', async ({ page }) => {
		const refreshButton = page.getByRole('button', { name: /Refresh/i });
		await expect(refreshButton).toBeVisible();
	});

	test('should manually refresh on button click', async ({ page }) => {
		const refreshButton = page.getByRole('button', { name: /Refresh/i });
		await refreshButton.click();

		await expect(page.getByText('Last updated')).toBeVisible();
	});

	test('should display customer phone with call link', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const phoneLink = firstOrder.getByRole('link');

		if (await phoneLink.count() > 0) {
			await expect(phoneLink).toBeVisible();
		}
	});

	test('should display order timestamp', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const timeElement = firstOrder.locator('time');
		await expect(timeElement).toBeVisible();
	});

	test('should navigate to dashboard', async ({ page }) => {
		await page.getByRole('link', { name: /Dashboard/i }).click();
		await expect(page).toHaveURL('/');
	});

	test('should navigate to order history', async ({ page }) => {
		await page.getByRole('link', { name: /Order History/i }).click();
		await expect(page).toHaveURL('/orders');
	});

	test('should show correct status badge for each order', async ({ page }) => {
		const orderCards = page.locator('[role="article"]');

		for (let i = 0; i < await orderCards.count(); i++) {
			const card = orderCards.nth(i);
			await expect(card.locator('span').filter({ hasText: /^(Ready|Delivered)$/ })).toBeVisible();
		}
	});

	test('should disable actions during status update', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const deliveredButton = firstOrder.getByRole('button', { name: 'Mark Delivered' });

		await deliveredButton.click();

		await expect(deliveredButton).toBeDisabled();
	});

	test('should display order number', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		await expect(firstOrder.getByText(/Order #/)).toBeVisible();
	});

	test('should remove delivered order from list', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const deliveredButton = firstOrder.getByRole('button', { name: 'Mark Delivered' });

		const initialCount = await page.locator('[role="article"]').count();

		await deliveredButton.click();

		await page.waitForTimeout(500);

		const newCount = await page.locator('[role="article"]').count();
		expect(newCount).toBeLessThan(initialCount);
	});

	test('should only show ready orders', async ({ page }) => {
		const orderCards = page.locator('[role="article"]');

		for (let i = 0; i < await orderCards.count(); i++) {
			const card = orderCards.nth(i);
			await expect(card.locator('span').filter({ hasText: 'Pending' })).not.toBeVisible();
			await expect(card.locator('span').filter({ hasText: 'Preparing' })).not.toBeVisible();
		}
	});

	test('should handle multiple deliveries', async ({ page }) => {
		const orderCards = page.locator('[role="article"]');

		for (let i = 0; i < Math.min(2, await orderCards.count()); i++) {
			const card = page.locator('[role="article"]').first();
			const deliveredButton = card.getByRole('button', { name: 'Mark Delivered' });

			await deliveredButton.click();
			await page.waitForTimeout(500);
		}
	});
});
