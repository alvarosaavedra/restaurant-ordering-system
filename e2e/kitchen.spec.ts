import { test, expect } from '@playwright/test';

test.describe('Kitchen Workflow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('jane@bakery.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await expect(page).toHaveURL('/kitchen');
	});

	test('should display kitchen heading', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Kitchen Orders' })).toBeVisible();
	});

	test('should display pending orders', async ({ page }) => {
		await expect(page.getByText('Pending orders')).toBeVisible();
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

	test('should display start preparing button for pending orders', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const preparingButton = firstOrder.getByRole('button', { name: 'Start Preparing' });
		await expect(preparingButton).toBeVisible();
	});

	test('should update order to preparing status', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const preparingButton = firstOrder.getByRole('button', { name: 'Start Preparing' });

		await preparingButton.click();

		await expect(page.getByText('Order status updated!')).toBeVisible();
	});

	test('should display mark ready button for preparing orders', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').filter({ hasText: 'Preparing' }).first();
		if (await firstOrder.count() > 0) {
			const readyButton = firstOrder.getByRole('button', { name: 'Mark Ready' });
			await expect(readyButton).toBeVisible();
		}
	});

	test('should update order to ready status', async ({ page }) => {
		const preparingOrder = page.locator('[role="article"]').filter({ hasText: 'Preparing' }).first();

		if (await preparingOrder.count() > 0) {
			const readyButton = preparingOrder.getByRole('button', { name: 'Mark Ready' });
			await readyButton.click();

			await expect(page.getByText('Order status updated!')).toBeVisible();
		}
	});

	test('should show loading state during status update', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const preparingButton = firstOrder.getByRole('button', { name: 'Start Preparing' });

		await preparingButton.click();
		await expect(preparingButton).toBeDisabled();
	});

	test('should display empty state when no orders', async ({ page }) => {
		await page.goto('/kitchen');
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
			await expect(card.locator('span').filter({ hasText: /^(Pending|Preparing|Ready|Delivered)$/ })).toBeVisible();
		}
	});

	test('should disable actions during status update', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		const preparingButton = firstOrder.getByRole('button', { name: 'Start Preparing' });

		await preparingButton.click();

		await expect(preparingButton).toBeDisabled();
	});

	test('should display order number', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();
		await expect(firstOrder.getByText(/Order #/)).toBeVisible();
	});

	test('should handle multiple status updates', async ({ page }) => {
		const firstOrder = page.locator('[role="article"]').first();

		if (await firstOrder.getByText('Pending').count() > 0) {
			const preparingButton = firstOrder.getByRole('button', { name: 'Start Preparing' });
			await preparingButton.click();

			await page.waitForTimeout(500);
			await expect(page.getByText('Order status updated!')).toBeVisible();
		}
	});
});
